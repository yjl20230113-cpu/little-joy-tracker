import { NextResponse } from "next/server";

type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

type DeepSeekResult = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type UnsplashPhoto = {
  id?: string;
  urls?: {
    regular?: string;
  };
  links?: {
    html?: string;
    download_location?: string;
  };
  user?: {
    name?: string;
    links?: {
      html?: string;
    };
  };
};

type UnsplashSearchResult = {
  results?: UnsplashPhoto[];
};

const keywordPrompt = `# Role
You are an internationally acclaimed minimalist curator and cinematic visual director.
You capture soft glimmers, textures, and emotional imagery from everyday life.
Your task is to convert a user's "small joyful moment" into the 3 English Unsplash search keywords most likely to create aesthetic resonance.

# Workflow & Categorization Logic
Deeply interpret the user's text with the following four-quadrant logic and generate 3 English keywords:
1. [Object]
If the text contains a specific tangible object such as strawberries, iced latte, an old book, or headphones:
Use: [core object], minimalist, close-up
Emphasize macro still-life photography.

2. [Scenery]
If the text contains a place or natural environment such as the seaside, a sunset street, a rainy forest, or a quiet library:
Use: [core scenery], cinematic landscape, peaceful
Emphasize depth, atmosphere, and cinematic lighting.

3. [Social / Intimacy]
If the text explicitly mentions a friend, partner, companion, or another specific person:
Use: two people, back view, companionship
Never use: crowd, group, party, meeting
The image must feel like two people and non-frontal.
If people cannot be localized well, use holding hands or two cups of coffee instead.

4. [Abstract / Emotional]
If the text only contains an abstract feeling:
Translate the feeling into healing imagery instead of directly translating the emotion.
happy -> dappled sunlight, wild flower
missing someone -> open window, soft curtain, wind
calm / spacing out -> calm water ripples, fog
fulfilled / abundant -> warm candlelight, grain texture

# Global Stylistic Suffixes
Every keyword must end with:
, high quality photography, soft tones, minimalist, aesthetic

# Negative Constraints
Outside the social / intimacy quadrant, do not include any human, face, or body part.
Never use: face, person, girl, boy, group, crowd, chaotic, messy, low resolution
Do not directly translate abstract emotions. For example, do not search happy; search sunshine-like imagery instead.

# Output Format
Return JSON only. No markdown. No explanation.
{
  "keywords": [
    "keyword one with stylistic suffixes",
    "keyword two with stylistic suffixes",
    "keyword three with stylistic suffixes"
  ]
}`;

function normalizeKeywords(input: unknown) {
  const raw =
    typeof input === "string" ? JSON.parse(input) : input && typeof input === "object" ? input : null;

  if (!raw || typeof raw !== "object") {
    throw new Error("DeepSeek keyword format is invalid");
  }

  const candidate = raw as Record<string, unknown>;
  const keywords = Array.isArray(candidate.keywords)
    ? candidate.keywords
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  if (keywords.length < 3) {
    throw new Error("DeepSeek keyword format is incomplete");
  }

  return keywords.slice(0, 3);
}

async function requestDeepSeek(apiKey: string, messages: DeepSeekMessage[]) {
  return fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.4,
      messages,
      response_format: { type: "json_object" },
    }),
  });
}

async function requestUnsplashSearch(accessKey: string, query: string) {
  const searchUrl = new URL("https://api.unsplash.com/search/photos");
  searchUrl.searchParams.set("query", query);
  searchUrl.searchParams.set("per_page", "1");
  searchUrl.searchParams.set("content_filter", "high");
  searchUrl.searchParams.set("orientation", "squarish");

  return fetch(searchUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
  });
}

async function triggerUnsplashDownload(accessKey: string, downloadLocation: string) {
  return fetch(downloadLocation, {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
      "Accept-Version": "v1",
    },
  });
}

async function searchUnsplashByKeywords(accessKey: string, keywords: string[]) {
  for (const rawKeyword of keywords) {
    const query = rawKeyword.trim();
    if (!query) {
      continue;
    }

    const unsplashResponse = await requestUnsplashSearch(accessKey, query);

    if (!unsplashResponse.ok) {
      const errorText = await unsplashResponse.text();
      throw new Error(errorText || "Unsplash search failed");
    }

    const unsplashResult = (await unsplashResponse.json()) as UnsplashSearchResult;
    const firstPhoto = unsplashResult.results?.[0];
    const imageUrl = firstPhoto?.urls?.regular?.trim() ?? "";
    const photoId = firstPhoto?.id?.trim() ?? "";
    const photoPageUrl = firstPhoto?.links?.html?.trim() ?? "";
    const photographerName = firstPhoto?.user?.name?.trim() ?? "";
    const photographerProfileUrl = firstPhoto?.user?.links?.html?.trim() ?? "";
    const downloadLocation = firstPhoto?.links?.download_location?.trim() ?? "";

    if (
      imageUrl &&
      photoId &&
      photoPageUrl &&
      photographerName &&
      photographerProfileUrl &&
      downloadLocation
    ) {
      return {
        query,
        imageUrl,
        photoId,
        photoPageUrl,
        photographerName,
        photographerProfileUrl,
        downloadLocation,
      };
    }
  }

  return null;
}

export async function POST(request: Request) {
  const deepSeekApiKey = process.env.DEEPSEEK_API_KEY;
  const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!deepSeekApiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is missing" },
      { status: 500 },
    );
  }

  if (!unsplashAccessKey) {
    return NextResponse.json(
      { error: "UNSPLASH_ACCESS_KEY is missing" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { content?: string; reason?: string };
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";

  if (!content && !reason) {
    return NextResponse.json(
      { error: "No event text provided" },
      { status: 400 },
    );
  }

  const response = await requestDeepSeek(deepSeekApiKey, [
    { role: "system", content: keywordPrompt },
    {
      role: "user",
      content: JSON.stringify({
        content: content || "(empty)",
        reason: reason || "(empty)",
      }),
    },
  ]);

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: errorText || "DeepSeek request failed" },
      { status: 502 },
    );
  }

  const deepSeekResult = (await response.json()) as DeepSeekResult;
  const messageContent = deepSeekResult.choices?.[0]?.message?.content;

  if (!messageContent) {
    return NextResponse.json(
      { error: "DeepSeek returned an empty response" },
      { status: 502 },
    );
  }

  let keywords: string[];
  try {
    keywords = normalizeKeywords(messageContent);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse DeepSeek keywords",
      },
      { status: 502 },
    );
  }

  let match;
  try {
    match = await searchUnsplashByKeywords(unsplashAccessKey, keywords);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unsplash search failed",
      },
      { status: 502 },
    );
  }

  if (!match) {
    return NextResponse.json(
      { error: "Unsplash returned no matching image" },
      { status: 404 },
    );
  }

  await triggerUnsplashDownload(unsplashAccessKey, match.downloadLocation);

  return NextResponse.json({
    imageUrl: match.imageUrl,
    keywords,
    query: match.query,
    photoId: match.photoId,
    photoPageUrl: match.photoPageUrl,
    photographerName: match.photographerName,
    photographerProfileUrl: match.photographerProfileUrl,
    downloadLocation: match.downloadLocation,
  });
}
