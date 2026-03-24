import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBuildId() {
  try {
    return (
      await readFile(path.join(process.cwd(), ".next", "BUILD_ID"), "utf-8")
    ).trim();
  } catch {
    return "";
  }
}

export async function GET() {
  const buildId =
    (await readBuildId()) ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
    "dev";

  return new Response(buildId, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

