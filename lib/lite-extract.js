// Last resort that needs no worker at all: the site's own backend asks the ytultra extraction API (used with its
// owner's permission) for the free muxed 360p file and returns a direct YouTube CDN link. Nothing streams through
// our servers, so it keeps working when every worker is down or overloaded. Audio and HD are not available this way:
// HD requests fall back to 360p (the page says so), audio fails and the partner downloader is offered instead.
const ENDPOINT = "https://api.ytultra.com/ikool/youtube/download";

let windowStart = 0;
let used = 0;
const PER_MINUTE = Number(process.env.LITE_PER_MINUTE || 120);

function allowed() {
  const now = Date.now();
  if (now - windowStart > 60000) { windowStart = now; used = 0; }
  used += 1;
  return used <= PER_MINUTE;
}

const itagOf = (url) => (String(url).match(/[?&]itag=(\d+)/) || [])[1];

async function titleOf(videoId) {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`, { signal: AbortSignal.timeout(6000) });
    const data = await response.json();
    return typeof data?.title === "string" ? data.title : "";
  } catch { return ""; }
}

export async function liteExtract(videoId, quality) {
  if (process.env.LITE_FALLBACK === "false" || quality === "audio" || !/^[\w-]{11}$/.test(videoId || "") || !allowed()) return null;
  try {
    const response = await fetch(ENDPOINT, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
      signal: AbortSignal.timeout(22000)
    });
    if (!response.ok) return null;
    const body = await response.json();
    if (body?.code !== "0000" || !body.data) return null;
    const media = (body.data.medias || []).find((m) => m && !m.locked && itagOf(m.url) === "18" && /^https:\/\/[a-z0-9.-]+\.googlevideo\.com\//.test(m.url || ""));
    if (!media) return null;
    const title = body.data.title || await titleOf(videoId) || "video";
    const filename = String(title).replace(/[\r\n/\\<>:"|?*&%#+]/g, "_").slice(0, 100);
    const link = `${media.url}&title=${encodeURIComponent(filename)}`;
    const id = `lite${Math.random().toString(36).slice(2, 10).padEnd(8, "x")}`;
    return {
      jobId: id, id, videoId, quality, status: "completed", actualQuality: "360p",
      title, thumbnail: body.data.imageUrl || undefined,
      // Same link twice on purpose: the client probes it in the browser and, when it cannot be opened, shows the
      // partner downloader instead of a broken download.
      downloadUrl: link, directUrl: link, completedAt: new Date().toISOString()
    };
  } catch { return null; }
}
