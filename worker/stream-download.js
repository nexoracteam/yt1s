import { spawn } from "node:child_process";
import { DownloadError } from "./download-errors.js";

export function mediaUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.endsWith(".googlevideo.com") ? url.href : "";
  } catch { return ""; }
}

export function mediaHeaderEntries(value) {
  if (!value || typeof value !== "object") return [];
  const blocked = new Set(["host", "content-length", "connection", "transfer-encoding"]);
  return Object.entries(value)
    .filter(([key, headerValue]) => /^[A-Za-z0-9-]+$/.test(key)
      && !blocked.has(key.toLowerCase())
      && typeof headerValue === "string"
      && !/[\r\n]/.test(headerValue));
}

export function mediaHeaders(value) {
  return mediaHeaderEntries(value).map(([key, headerValue]) => `${key}: ${headerValue}\r\n`).join("");
}

// Node's fetch has no proxy support, so a probe that must leave through the WARP proxy shells out to curl.
function curlFetcher(proxy, spawnProcess = spawn) {
  return (url, { headers = {}, signal } = {}) => new Promise((resolve, reject) => {
    const args = ["-sS", "-L", "--max-time", "15", "-x", proxy, "-o", "/dev/null", "-w", "%{http_code}"];
    for (const [key, value] of Object.entries(headers)) args.push("-H", `${key}: ${value}`);
    const child = spawnProcess("curl", [...args, url], { stdio: ["ignore", "pipe", "ignore"] });
    let out = "";
    signal?.addEventListener("abort", () => child.kill("SIGKILL"), { once: true });
    child.stdout.on("data", (chunk) => { out += chunk; });
    child.once("error", reject);
    child.once("close", (code) => {
      const status = Number(out.trim().slice(-3));
      if (code !== 0 || !status) return reject(new Error("probe failed"));
      resolve({ ok: status >= 200 && status < 300, status, body: null });
    });
  });
}

export async function probeMedia(info, { fetcher, proxy, timeoutMs = 15000, spawnProcess } = {}) {
  fetcher ||= proxy ? curlFetcher(proxy, spawnProcess) : fetch;
  const inputs = info.requested_formats || [info];
  for (const input of inputs) {
    const url = mediaUrl(input.url);
    if (!url) throw new DownloadError("FORMAT_UNAVAILABLE");
    const headers = Object.fromEntries(mediaHeaderEntries(input.http_headers || info.http_headers));
    headers.Range = "bytes=0-0";
    let response;
    try {
      response = await fetcher(url, { headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
    } catch {
      throw new DownloadError("SOURCE_BUSY");
    }
    await response.body?.cancel().catch(() => {});
    if (!response.ok) throw new DownloadError(response.status === 403 || response.status === 429 ? "SOURCE_BUSY" : "DOWNLOAD_FAILED");
  }
}

function streamFailure(stderr) {
  if (/\b403\b|forbidden/i.test(stderr)) return "UPSTREAM_403";
  if (/\b429\b|too many requests/i.test(stderr)) return "UPSTREAM_429";
  if (/timed? ?out|connection.*reset|network is unreachable/i.test(stderr)) return "UPSTREAM_NETWORK";
  if (/invalid data|could not find codec|matches no streams/i.test(stderr)) return "MEDIA_FORMAT";
  return "STREAM_FAILED";
}

export function streamArgs(info, quality, { proxy } = {}) {
  const inputs = info.requested_formats || [info];
  const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];
  for (const input of inputs) {
    const url = mediaUrl(input.url);
    if (!url) throw new DownloadError("FORMAT_UNAVAILABLE");
    args.push("-protocol_whitelist", "https,tls,tcp,crypto,http", "-rw_timeout", "20000000", "-reconnect", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "3");
    // Media URLs are bound to the IP that extracted them, so a WARP-extracted link must also stream through WARP.
    if (proxy) args.push("-http_proxy", proxy);
    const headers = mediaHeaders(input.http_headers || info.http_headers);
    if (headers) args.push("-headers", headers);
    args.push("-i", url);
  }
  if (quality === "audio") {
    // Re-encode: stream-copying HE-AAC from muxed/HLS sources yields undecodable audio.
    args.push("-map", "0:a:0", "-vn", "-c:a", "aac", "-b:a", "192k");
  }
  else {
    const video = inputs.findIndex((item) => item.vcodec && item.vcodec !== "none");
    const audio = inputs.findIndex((item) => item.acodec && item.acodec !== "none");
    if (video < 0 || audio < 0) throw new DownloadError("FORMAT_UNAVAILABLE");
    const copyAudio = inputs[audio].acodec?.startsWith("mp4a");
    args.push("-map", `${video}:v:0`, "-map", `${audio}:a:0`, "-c:v", "copy", "-c:a", copyAudio ? "copy" : "aac", ...(copyAudio ? ["-bsf:a", "aac_adtstoasc"] : []));
  }
  // Audio-only fragments per packet (frag_keyframe) produce undecodable files on a pipe; fragment by duration instead.
  const fragment = quality === "audio" ? ["-frag_duration", "2000000", "-movflags", "+empty_moov+default_base_moof"] : ["-movflags", "+frag_keyframe+empty_moov+default_base_moof"];
  return [...args, ...fragment, "-f", "mp4", "pipe:1"];
}

export function streamMedia(req, res, info, quality, { maxBytes, proxy, spawnProcess = spawn, log = console.log } = {}) {
  const args = streamArgs(info, quality, { proxy });
  const child = spawnProcess("ffmpeg", args, { stdio: ["ignore", "pipe", "pipe"] });
  let bytes = 0, started = false, finished = false, stderr = "";
  const filename = `${String(info.title || "video").replace(/[\r\n/\\<>:"|?*]/g, "_").slice(0, 100)}.${quality === "audio" ? "m4a" : "mp4"}`;
  const stop = () => { if (!finished) child.kill("SIGKILL"); };
  const timer = setTimeout(stop, 30 * 60 * 1000);
  const firstByteTimer = setTimeout(stop, 60000);
  res.once("close", stop);
  child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-8000); });
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
    log(JSON.stringify({ event: "stream_finished", bytes, success: code === 0 && started, ...(code === 0 && started ? {} : { reason: streamFailure(stderr), detail: stderr.replace(/https?:\/\/\S+/g, "<url>").slice(-300) }) }));
    resolve();
  }));
}
