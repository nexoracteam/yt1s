import { NextResponse } from "next/server";
import { extractVideoId, isYouTubeInput } from "../../../lib/youtube";
import { liteExtract } from "../../../lib/lite-extract";
import { DownloadError, publicFailure, safeDownloadMessage } from "../../../worker/download-errors";

export const runtime = "nodejs";
export const maxDuration = 30;

function failure(code, status) {
  return NextResponse.json(publicFailure(new DownloadError(code)), { status });
}

const HEROKU_WORKER = (process.env.DOWNLOAD_WORKER_URL || "https://yt1s-worker-b6abf79b9888.herokuapp.com").replace(/\/$/, "");
const BACKUP_WORKER = (process.env.BACKUP_WORKER_URL || "https://yt1s-worker-eu-b88ee7e26698.herokuapp.com").replace(/\/$/, "");
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

async function backupStart(videoId, quality) {
  return callWorker(BACKUP_WORKER, "/download", { method: "POST", body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}`, quality }) }, 20000);
}

// Every worker is down or has given up on this video: serve the free 360p straight from this site's backend.
async function lastResort(isPost, options, result) {
  const data = result?.data;
  const unusable = !result || !data || typeof data !== "object" || result.response.status >= 500;
  let videoId = "", quality = "720p";
  if (isPost && unusable) {
    try { const body = JSON.parse(options.body); videoId = extractVideoId(body.url); quality = body.quality || quality; } catch {}
  } else if (!isPost && data?.status === "failed" && data.videoId) {
    videoId = data.videoId; quality = data.quality || quality;
  }
  return videoId ? liteExtract(videoId, quality) : null;
}

async function proxy(path, options = {}) {
  try {
    const isPost = options.method === "POST";
    const timeoutMs = isPost ? 45000 : 30000;
    let result;
    const home = await homeWorker();
    if (home) {
      // Short timeout: a dead home worker must not slow the visitor down.
      try {
        const attempt = await callWorker(home, path, options, isPost ? 8000 : 6000);
        // 404 on a poll just means the job lives on another worker.
        if (attempt.data && typeof attempt.data === "object" && attempt.response.status < 500 && !(!isPost && attempt.response.status === 404)) result = attempt;
      } catch { homeCache = { url: null, at: Date.now() }; }
    }
    if (!result) {
      // Main worker first; if it is unreachable or erroring, the standby worker takes over.
      let primary = null;
      try { primary = await callWorker(HEROKU_WORKER, path, options, timeoutMs); } catch {}
      const usable = primary?.data && typeof primary.data === "object" && primary.response.status < 500;
      if (usable && (isPost || (primary.response.status !== 404 && primary.data.status !== "failed"))) {
        result = primary;
      } else if (BACKUP_WORKER && BACKUP_WORKER !== HEROKU_WORKER) {
        try {
          if (isPost) {
            // Main worker down: start the job on the standby (its jobId is found there on later polls).
            const started = await callWorker(BACKUP_WORKER, path, options, 20000);
            result = started.data && started.response.status < 500 ? started : primary;
          } else if (usable && primary.data.status === "failed" && primary.data.videoId && primary.data.quality) {
            // The main worker tried everything and failed: give the standby a go (it dedupes repeated polls).
            const retry = await backupStart(primary.data.videoId, primary.data.quality);
            result = retry.data && retry.response.status < 500 ? { response: retry.response, data: { ...retry.data, id: retry.data.jobId || retry.data.id } } : primary;
          } else {
            // Unknown here (404) or main worker unreachable: the job may live on the standby.
            const found = await callWorker(BACKUP_WORKER, path, options, 15000);
            result = found.data && found.response.status < 500 ? found : primary;
          }
        } catch { result = primary; }
      } else result = primary;
    }
    const lite = await lastResort(isPost, options, result);
    if (lite) return NextResponse.json(lite, { status: 200, headers: { "Cache-Control": "no-store" } });
    if (!result) return failure("SERVICE_BUSY", 503);
    const { response, data } = result;
    if (!data || typeof data !== "object") return failure("SERVICE_BUSY", 502);
    if (!response.ok || data.status === "failed" || data.error) {
      data.error = safeDownloadMessage(data, response.status === 404 ? "JOB_EXPIRED" : "SERVICE_BUSY");
    }
    // Do not forward unexpected diagnostics from old worker versions.
    const fields = ["jobId", "id", "videoId", "status", "quality", "actualQuality", "title", "thumbnail", "duration", "bytes", "estimatedBytes", "expiresAt", "downloadUrl", "directUrl", "previewUrl", "progress", "attempt", "cached", "createdAt", "completedAt", "failedAt", "code", "error", "retryable"];
    const out = Object.fromEntries(fields.filter((key) => Object.hasOwn(data, key)).map((key) => [key, data[key]]));
    return NextResponse.json(out, { status: response.ok ? response.status : (response.status || 503), headers: { "Cache-Control": "no-store" } });
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
