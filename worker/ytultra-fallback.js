import { DownloadError } from "./download-errors.js";

// Extra fallback: the ytultra extraction API (used with its owner's permission). It extracts from its own pool of
// consumer IPs and returns direct YouTube CDN links, so nothing streams through this server. It only serves
// free-tier formats (muxed 360p); HD entries come back locked, so they are skipped.
// Enabled with YTULTRA_FALLBACK=true and capped per UTC day. It runs only after every other route has failed.
const ENDPOINT = "https://api.ytultra.com/ikool/youtube/download";

const itagOf = (url) => (String(url).match(/[?&]itag=(\d+)/) || [])[1];

export function pickMedia(medias, quality) {
  const usable = (Array.isArray(medias) ? medias : []).filter((m) => m && !m.locked && /^https:\/\/[a-z0-9.-]+\.googlevideo\.com\//.test(m.url || ""));
  return usable.find((m) => itagOf(m.url) === (quality === "audio" ? "140" : "18")) || null;
}

async function youtubeTitle(videoId, fetcher) {
  try {
    const response = await fetcher(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`, { signal: AbortSignal.timeout(8000) });
    const data = await response.json();
    return typeof data?.title === "string" ? data.title : "";
  } catch { return ""; }
}

export async function ytultraExtract({ videoId, quality, fetcher = fetch, timeoutMs = 45000 }) {
  // Its audio-only links are IP-bound and often answer 403 for the visitor, so only the muxed 360p file is used.
  if (quality === "audio") throw new DownloadError("FORMAT_UNAVAILABLE");
  let response;
  try {
    response = await fetcher(ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch { throw new DownloadError("SOURCE_BUSY"); }
  if (!response.ok) throw new DownloadError("SOURCE_BUSY");
  const body = await response.json().catch(() => null);
  if (body?.code !== "0000" || !body.data) throw new DownloadError("SOURCE_BUSY");
  const media = pickMedia(body.data.medias, quality);
  if (!media) throw new DownloadError("FORMAT_UNAVAILABLE");
  const title = body.data.title || await youtubeTitle(videoId, fetcher) || "video";
  const filename = String(title).replace(/[\r\n/\\<>:"|?*&%#+]/g, "_").slice(0, 100);
  const link = `${media.url}&title=${encodeURIComponent(filename)}`;
  return {
    title, thumbnail: body.data.imageUrl || undefined, duration: Number(body.data.duration) || undefined,
    // Asked for HD but only the free 360p exists: say so honestly instead of failing.
    actualQuality: "360p",
    directUrl: link, downloadUrl: link
  };
}
