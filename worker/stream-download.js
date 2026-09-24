import { spawn } from "node:child_process";
import { DownloadError } from "./download-errors.js";

export function mediaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".googlevideo.com") ? url.href : "";
  } catch { return ""; }
}

export function streamArgs(info, quality) {
  const inputs = info.requested_formats || [info];
  const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];
  for (const input of inputs) {
    const url = mediaUrl(input.url);
    if (!url) throw new DownloadError("FORMAT_UNAVAILABLE");
    args.push("-protocol_whitelist", "https,tls,tcp,crypto,http", "-rw_timeout", "20000000", "-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "3");
    const headers = input.http_headers || info.http_headers || {};
    const safeHeaders = ["User-Agent", "Referer", "Origin"].filter((key) => typeof headers[key] === "string" && !/[\r\n]/.test(headers[key]));
    if (safeHeaders.length) args.push("-headers", safeHeaders.map((key) => `${key}: ${headers[key]}\r\n`).join(""));
    args.push("-i", url);
  }
  if (quality === "audio") args.push("-map", "0:a:0", "-vn", "-c:a", info.acodec?.startsWith("mp4a") ? "copy" : "aac");
  else {
    const video = inputs.findIndex((item) => item.vcodec && item.vcodec !== "none");
    const audio = inputs.findIndex((item) => item.acodec && item.acodec !== "none");
    if (video < 0 || audio < 0) throw new DownloadError("FORMAT_UNAVAILABLE");
    args.push("-map", `${video}:v:0`, "-map", `${audio}:a:0`, "-c:v", "copy", "-c:a", inputs[audio].acodec?.startsWith("mp4a") ? "copy" : "aac");
  }
  return [...args, "-movflags", "+frag_keyframe+empty_moov+default_base_moof", "-f", "mp4", "pipe:1"];
}

export function streamMedia(req, res, info, quality, { maxBytes, spawnProcess = spawn, log = console.log } = {}) {
  const args = streamArgs(info, quality);
  const child = spawnProcess("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
  let bytes = 0, started = false, finished = false;
  const filename = `${String(info.title || "video").replace(/[\r\n/\\<>:"|?*]/g, "_").slice(0, 100)}.${quality === "audio" ? "m4a" : "mp4"}`;
  const stop = () => { if (!finished) child.kill("SIGKILL"); };
  const timer = setTimeout(stop, 30 * 60 * 1000);
  const firstByteTimer = setTimeout(stop, 60000);
  res.once("close", stop);
  child.stderr.on("data", () => {});
  const fail = () => {
    if (!res.headersSent) res.status(502).type("text/plain").send("This download link could not be opened. Return to the tool and generate a fresh link.");
    else res.destroy();
  };
  child.stdout.on("data", (chunk) => {
    if (!started) {
      started = true;
      clearTimeout(firstByteTimer);
      res.status(200).set({
        "Content-Type": quality === "audio" ? "audio/mp4" : "video/mp4",
        "Content-Disposition": `attachment; filename="download.${quality === "audio" ? "m4a" : "mp4"}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"
      });
    }
    bytes += chunk.length;
    if (bytes > maxBytes) { stop(); res.destroy(); return; }
    if (!res.write(chunk)) child.stdout.pause();
  });
  res.on("drain", () => child.stdout.resume());
  child.once("error", fail);
  return new Promise((resolve) => child.once("close", (code) => {
    finished = true;
    clearTimeout(timer);
    clearTimeout(firstByteTimer);
    res.removeListener("close", stop);
    if (code === 0 && started) res.end();
    else if (!res.destroyed) fail();
    log(JSON.stringify({ event: "stream_finished", bytes, success: code === 0 && started }));
    resolve();
  }));
}
