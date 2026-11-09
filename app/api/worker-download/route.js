import { NextResponse } from "next/server";
import { isYouTubeInput } from "../../../lib/youtube";
import { DownloadError, publicFailure, safeDownloadMessage } from "../../../worker/download-errors";

export const runtime = "nodejs";
export const maxDuration = 30;

function failure(code, status) {
  return NextResponse.json(publicFailure(new DownloadError(code)), { status });
}

const HEROKU_WORKER = (process.env.DOWNLOAD_WORKER_URL || "https://yt1s-worker-b6abf79b9888.herokuapp.com").replace(/\/$/, "");
let homeCache = { url: null, at: 0 };

// A worker on a home connection announces its tunnel URL to the always-on worker. Prefer it when it is online;
// otherwise (PC off, tunnel down, lookup fails) everything simply goes to the always-on worker.
async function homeWorker() {
  if (Date.now() - homeCache.at < 15000) return homeCache.url;
  let url = null;
  try {
    const data = await (await fetch(`${HEROKU_WORKER}/home`, { cache: "no-store", signal: AbortSignal.timeout(3000) })).json();
    if (typeof data?.url === "string" && /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(data.url)) url = data.url;
  } catch {}
  homeCache = { url, at: Date.now() };
  return url;
}

async function callWorker(base, path, options, timeoutMs) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(process.env.WORKER_SECRET ? { Authorization: `Bearer ${process.env.WORKER_SECRET}` } : {})
    },
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs)
  });
  const data = await response.json().catch(() => null);
  return { response, data };
}

async function proxy(path, options = {}) {
  try {
    const timeoutMs = options.method === "POST" ? 45000 : 30000;
    let result;
    const home = await homeWorker();
    if (home) {
      // Short timeout: a dead home worker must not slow the visitor down.
      try {
        const attempt = await callWorker(home, path, options, options.method === "POST" ? 8000 : 6000);
        // 404 on a poll just means the job lives on the always-on worker.
        if (attempt.data && typeof attempt.data === "object" && attempt.response.status < 500 && !(options.method !== "POST" && attempt.response.status === 404)) result = attempt;
      } catch { homeCache = { url: null, at: Date.now() }; }
    }
    if (!result) result = await callWorker(HEROKU_WORKER, path, options, timeoutMs);
    const { response, data } = result;
    if (!data || typeof data !== "object") return failure("SERVICE_BUSY", 502);
    if (!response.ok || data.status === "failed" || data.error) {
      data.error = safeDownloadMessage(data, response.status === 404 ? "JOB_EXPIRED" : "SERVICE_BUSY");
    }
    // Do not forward unexpected diagnostics from old worker versions.
    const fields = ["jobId", "id", "videoId", "status", "quality", "actualQuality", "title", "thumbnail", "duration", "bytes", "estimatedBytes", "expiresAt", "downloadUrl", "previewUrl", "progress", "attempt", "cached", "createdAt", "completedAt", "failedAt", "code", "error", "retryable"];
    const out = Object.fromEntries(fields.filter((key) => Object.hasOwn(data, key)).map((key) => [key, data[key]]));
    return NextResponse.json(out, { status: response.status, headers: { "Cache-Control": "no-store" } });
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
