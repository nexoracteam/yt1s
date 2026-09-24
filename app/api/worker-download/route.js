import { NextResponse } from "next/server";
import { isYouTubeInput } from "../../../lib/youtube";
import { DownloadError, publicFailure, safeDownloadMessage } from "../../../worker/download-errors";

export const runtime = "nodejs";
export const maxDuration = 30;

function failure(code, status) {
  return NextResponse.json(publicFailure(new DownloadError(code)), { status });
}

async function proxy(path, options = {}) {
  try {
    const base = (process.env.DOWNLOAD_WORKER_URL || "https://yt1s-production.up.railway.app").replace(/\/$/, "");
    const response = await fetch(`${base}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(process.env.WORKER_SECRET ? { Authorization: `Bearer ${process.env.WORKER_SECRET}` } : {})
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000)
    });
    const data = await response.json();
    if (!data || typeof data !== "object") return failure("SERVICE_BUSY", 502);
    if (!response.ok || data.status === "failed" || data.error) {
      data.error = safeDownloadMessage(data, response.status === 404 ? "JOB_EXPIRED" : "SERVICE_BUSY");
    }
    // Do not forward unexpected diagnostics from old worker versions.
    const fields = ["jobId", "id", "videoId", "status", "quality", "actualQuality", "title", "thumbnail", "duration", "bytes", "downloadUrl", "previewUrl", "progress", "attempt", "cached", "createdAt", "completedAt", "failedAt", "code", "error", "retryable"];
    const result = Object.fromEntries(fields.filter((key) => Object.hasOwn(data, key)).map((key) => [key, data[key]]));
    return NextResponse.json(result, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return failure("SERVICE_BUSY", 503);
  }
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return failure("INVALID_URL", 400); }
  if (!isYouTubeInput(body?.url)) return failure("INVALID_URL", 400);
  const quality = body.quality ?? "720p";
  if (!["360p", "480p", "720p", "1080p", "audio"].includes(quality)) return failure("INVALID_QUALITY", 400);
  return proxy("/download", { method: "POST", body: JSON.stringify({ url: body.url, quality }) });
}

export async function GET(req) {
  const jobId = new URL(req.url).searchParams.get("jobId");
  if (!/^[\w-]{12}$/.test(jobId || "")) return failure("JOB_EXPIRED", 400);
  return proxy(`/job/${encodeURIComponent(jobId)}`);
}
