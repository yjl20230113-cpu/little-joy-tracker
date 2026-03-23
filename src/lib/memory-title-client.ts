import {
  fallbackMemoryTitle,
  isValidMemoryTitle,
  type MemoryTitleEventInput,
} from "./memory-title";

type MemoryTitleResponse = {
  items?: Array<{
    index?: number;
    title?: string;
  }>;
};

async function requestMemoryTitles(events: MemoryTitleEventInput[]) {
  const response = await fetch("/api/memory-title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ events }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to generate memory titles");
  }

  return (await response.json()) as MemoryTitleResponse;
}

function normalizeGeneratedTitles(
  events: MemoryTitleEventInput[],
  response: MemoryTitleResponse,
) {
  const items = Array.isArray(response.items) ? response.items : [];
  const titles = new Array(events.length).fill("");

  for (const item of items) {
    const index = item.index;
    const title = typeof item.title === "string" ? item.title.trim() : "";

    if (
      typeof index !== "number" ||
      !Number.isInteger(index) ||
      index < 0 ||
      index >= events.length ||
      !isValidMemoryTitle(title)
    ) {
      continue;
    }

    titles[index] = title;
  }

  if (titles.some((title) => !title)) {
    throw new Error("Generated titles are incomplete");
  }

  return titles;
}

export async function generateMemoryTitles(events: MemoryTitleEventInput[]) {
  const cleanedEvents = events
    .map((event) => ({
      content: typeof event.content === "string" ? event.content.trim() : "",
      reason: typeof event.reason === "string" ? event.reason.trim() : "",
      time: typeof event.time === "string" ? event.time.trim() : "",
    }))
    .filter((event) => event.content || event.reason);

  if (cleanedEvents.length === 0) {
    return [];
  }

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await requestMemoryTitles(cleanedEvents);
      const titles = normalizeGeneratedTitles(cleanedEvents, response);
      return titles;
    } catch {
      // Retry once before falling back locally.
    }
  }

  return cleanedEvents.map((event) => fallbackMemoryTitle(event.content));
}
