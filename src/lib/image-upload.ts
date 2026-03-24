type SubmitActionStateArgs = {
  saving: boolean;
  uploading: boolean;
  idleLabel: string;
  savingLabel: string;
  uploadingLabel: string;
};

type StorageBucketClient = {
  upload: (
    path: string,
    file: File,
    options: { upsert: boolean },
  ) => Promise<{ error: { message: string } | null }>;
  getPublicUrl: (path: string) => { data: { publicUrl: string } };
};

type StorageLike = {
  from: (bucket: string) => StorageBucketClient;
};

type UploadImageToStorageArgs = {
  storage: StorageLike;
  bucket: string;
  userId: string;
  file: File;
  pathPrefix?: string;
  prepareFile?: (file: File) => Promise<File>;
  now?: () => number;
};

const maxImageDimension = 1600;
const compressionQuality = 0.82;
const compressionThresholdBytes = 900 * 1024;

export function getSubmitActionState({
  saving,
  uploading,
  idleLabel,
  savingLabel,
  uploadingLabel,
}: SubmitActionStateArgs) {
  if (saving) {
    return {
      disabled: true,
      label: savingLabel,
    };
  }

  if (uploading) {
    return {
      disabled: true,
      label: uploadingLabel,
    };
  }

  return {
    disabled: false,
    label: idleLabel,
  };
}

export async function uploadImageToStorage({
  storage,
  bucket,
  userId,
  file,
  pathPrefix = "",
  prepareFile = compressImageFile,
  now = Date.now,
}: UploadImageToStorageArgs) {
  const preparedFile = await prepareFile(file);
  const extension =
    preparedFile.name.split(".").pop()?.toLowerCase() ||
    inferExtensionFromMimeType(preparedFile.type) ||
    "jpg";
  const safeName = preparedFile.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
  const normalizedPrefix = pathPrefix.trim().replace(/^\/+|\/+$/g, "");
  const filePath = normalizedPrefix
    ? `${normalizedPrefix}/${userId}/${now()}-${safeName}.${extension}`
    : `${userId}/${now()}-${safeName}.${extension}`;
  const bucketClient = storage.from(bucket);
  const { error } = await bucketClient.upload(filePath, preparedFile, {
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = bucketClient.getPublicUrl(filePath);

  return {
    publicUrl: data.publicUrl,
    uploadedFile: preparedFile,
  };
}

export async function compressImageFile(file: File) {
  if (
    !file.type.startsWith("image/") ||
    file.size < compressionThresholdBytes ||
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof URL.createObjectURL !== "function" ||
    typeof HTMLCanvasElement === "undefined"
  ) {
    return file;
  }

  const image = await loadImage(file);

  if (!image) {
    return file;
  }

  const { width, height } = fitWithinBounds(image.width, image.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (!context) {
    return file;
  }

  context.drawImage(image, 0, 0, width, height);

  const targetType = selectCompressedMimeType(file.type);
  const blob = await canvasToBlob(canvas, targetType, compressionQuality);

  if (!blob || blob.size >= file.size) {
    return file;
  }

  return new File(
    [blob],
    replaceFileExtension(file.name, inferExtensionFromMimeType(targetType) || "jpg"),
    {
      type: targetType,
      lastModified: file.lastModified,
    },
  );
}

function fitWithinBounds(width: number, height: number) {
  const maxSide = Math.max(width, height);

  if (maxSide <= maxImageDimension) {
    return { width, height };
  }

  const scale = maxImageDimension / maxSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Failed to load image for compression."));
      image.src = objectUrl;
    });

    return image;
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function selectCompressedMimeType(type: string) {
  if (type === "image/png") {
    return "image/png";
  }

  if (type === "image/webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

function inferExtensionFromMimeType(type: string) {
  switch (type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
    default:
      return "";
  }
}

function replaceFileExtension(name: string, extension: string) {
  const baseName = name.replace(/\.[^.]+$/, "");
  return `${baseName}.${extension}`;
}
