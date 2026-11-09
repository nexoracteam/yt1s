import { DownloadError } from "./download-errors.js";

// Last-resort extractor: the paid-per-video hipersoft/youtube-downloader Apify actor (about $0.004 per video).
// It only runs after every free route (cookies, WARP, direct, home worker) has failed.
const ACTOR = "hipersoft~youtube-downloader";
const FORMATS = { audio: "mp3", "360p": "360", "480p": "720", "720p": "720", "1080p": "1080" };

export function apifyFormat(quality) { return FORMATS[quality] || "720"; }

// Caps spend: at most `limit` actor runs per UTC day.
export function createApifyBudget(limit, now = () => new Date()) {
  let day = "", used = 0;
  return {
    take() {
      const today = now().toISOString().slice(0, 10);
      if (day !== today) { day = today; used = 0; }
      if (used >= limit) return false;
      used++;
      return true;
    }
  };
}

export async function apifyExtract({ token, videoId, quality, fetcher = fetch, timeoutMs = 130000 }) {
  if (!token) throw new DownloadError("SERVICE_BUSY");
  let response;
  try {
    response = await fetcher(`https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?timeout=120`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ videoUrls: [`https://www.youtube.com/watch?v=${videoId}`], format: apifyFormat(quality), maxItems: 1 }),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch { throw new DownloadError("SOURCE_BUSY"); }
  if (!response.ok) throw new DownloadError("SOURCE_BUSY");
  const items = await response.json().catch(() => null);
  const item = Array.isArray(items) ? items.find((entry) => /^https:\/\//.test(entry?.downloadUrl || "")) : null;
  if (!item) throw new DownloadError("SOURCE_BUSY");
  return { title: item.title, thumbnail: item.thumbnailUrl, downloadUrl: item.downloadUrl, actualQuality: quality === "audio" ? "audio" : quality };
}
