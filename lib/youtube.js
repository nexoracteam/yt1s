export function extractVideoId(input = "") {
  if (typeof input !== "string") return "";
  const value = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    if (!["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtu.be"].includes(url.hostname)) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    const id = url.hostname.endsWith("youtu.be") ? parts[0]
      : parts[0] === "watch" ? url.searchParams.get("v")
        : ["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : "";
    return /^[a-zA-Z0-9_-]{11}$/.test(id || "") ? id : "";
  } catch { return ""; }
}

export function isYouTubeInput(input = "") {
  return Boolean(extractVideoId(input));
}

export function thumbnailSet(videoId) {
  return [
    { label: "Max Resolution", quality: "1280 x 720", url: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` },
    { label: "Standard", quality: "640 x 480", url: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg` },
    { label: "High", quality: "480 x 360", url: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` },
    { label: "Medium", quality: "320 x 180", url: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg` },
    { label: "Default", quality: "120 x 90", url: `https://i.ytimg.com/vi/${videoId}/default.jpg` }
  ];
}

export function toTimestampSeconds(value = "") {
  const parts = value.trim().split(":").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part < 0)) return null;
  if (parts.length === 1) return Math.floor(parts[0]);
  if (parts.length === 2) return Math.floor(parts[0] * 60 + parts[1]);
  if (parts.length === 3) return Math.floor(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  return null;
}

export function timestampUrl(input, seconds) {
  const videoId = extractVideoId(input);
  if (!videoId || seconds == null) return "";
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}
