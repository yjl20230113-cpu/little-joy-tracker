import { describe, expect, it, vi } from "vitest";
import {
  compressImageFile,
  getSubmitActionState,
  uploadImageToStorage,
} from "./image-upload";

describe("image upload helpers", () => {
  it("prefers the upload label over the save label while an image is uploading", () => {
    expect(
      getSubmitActionState({
        saving: false,
        uploading: true,
        idleLabel: "保存到小美好",
        savingLabel: "发送中...",
        uploadingLabel: "正在处理图片...",
      }),
    ).toEqual({
      disabled: true,
      label: "正在处理图片...",
    });
  });

  it("keeps the save label when the form itself is saving", () => {
    expect(
      getSubmitActionState({
        saving: true,
        uploading: false,
        idleLabel: "保存修改",
        savingLabel: "保存中...",
        uploadingLabel: "正在处理图片...",
      }),
    ).toEqual({
      disabled: true,
      label: "保存中...",
    });
  });

  it("rethrows the original Supabase storage error message", async () => {
    const from = vi.fn(() => ({
      upload: vi.fn().mockResolvedValue({
        error: { message: "Storage bucket joy-images not found" },
      }),
      getPublicUrl: vi.fn(),
    }));

    await expect(
      uploadImageToStorage({
        storage: { from },
        bucket: "joy-images",
        userId: "user-1",
        file: new File(["raw"], "photo.jpg", { type: "image/jpeg" }),
        prepareFile: vi.fn(async (file: File) => file),
        now: () => 123456,
      }),
    ).rejects.toThrow("Storage bucket joy-images not found");
  });

  it("uploads the prepared file instead of the original one", async () => {
    const originalFile = new File(["raw"], "photo.jpg", { type: "image/jpeg" });
    const preparedFile = new File(["compressed"], "photo.jpg", {
      type: "image/jpeg",
    });
    const upload = vi.fn().mockResolvedValue({ error: null });
    const getPublicUrl = vi.fn().mockReturnValue({
      data: { publicUrl: "https://example.com/photo.jpg" },
    });

    const result = await uploadImageToStorage({
      storage: {
        from: vi.fn(() => ({
          upload,
          getPublicUrl,
        })),
      },
      bucket: "joy-images",
      userId: "user-1",
      file: originalFile,
      prepareFile: vi.fn(async () => preparedFile),
      now: () => 123456,
    });

    expect(upload).toHaveBeenCalledWith(
      "user-1/123456-photo.jpg",
      preparedFile,
      { upsert: false },
    );
    expect(result.publicUrl).toBe("https://example.com/photo.jpg");
  });

  it("returns the original file when image compression is unavailable", async () => {
    const file = new File(["raw"], "photo.jpg", { type: "image/jpeg" });

    await expect(compressImageFile(file)).resolves.toBe(file);
  });
});
