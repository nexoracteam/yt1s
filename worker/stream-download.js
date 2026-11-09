import { spawn } from "node:child_process";
import http from "node:http";
import { once } from "node:events";
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

// YouTube throttles a single long request for DASH/audio streams to roughly real-time speed and may end it early
// without an error. yt-dlp avoids this by reading the file in short ranged requests. ffmpeg cannot, so a tiny
// loopback server in front of it does the same: ffmpeg reads http://127.0.0.1:<port>/<n>, and each read is served from
// sequential 8 MB ranged requests (with retries) to the real URL, optionally through a proxy.
const RANGE_CHUNK = 8 * 1024 * 1024;
let undiciModule;

async function fetcherFor(proxy) {
  if (!proxy) return { run: (url, init) => fetch(url, init) };
  undiciModule ||= await import("undici");
  const dispatcher = new undiciModule.ProxyAgent(proxy);
  return { run: (url, init) => undiciModule.fetch(url, { ...init, dispatcher }) };
}

export async function startRangedInputs(sources, { proxy, chunk = RANGE_CHUNK, retries = 3, fetcher } = {}) {
  const transport = fetcher ? { run: fetcher } : await fetcherFor(proxy);
  const sizes = new Map();
  const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function ranged(source, start, end) {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await transport.run(source.url, { headers: { ...source.headers, Range: `bytes=${start}-${end}` }, signal: AbortSignal.timeout(60000) });
        if (response.status === 206 || response.status === 200) return response;
        await response.body?.cancel().catch(() => {});
        lastError = new Error(`HTTP ${response.status}`);
      } catch (error) { lastError = error; }
      await pause(300 * (attempt + 1));
    }
    throw lastError;
  }

  async function sizeOf(source) {
    if (sizes.has(source)) return sizes.get(source);
    const response = await ranged(source, 0, 0);
    await response.body?.cancel().catch(() => {});
    const total = Number((/\/(\d+)\s*$/.exec(response.headers.get("content-range") || "") || [])[1]);
    if (!Number.isFinite(total) || total <= 0) throw new Error("unknown size");
    sizes.set(source, total);
    return total;
  }

  const server = http.createServer(async (req, res) => {
    const source = sources[Number(String(req.url).split("/").pop())];
    if (!source) { res.writeHead(404).end(); return; }
    let gone = false;
    res.on("close", () => { gone = true; });
    try {
      const size = await sizeOf(source);
      const match = /bytes=(\d+)-/.exec(req.headers.range || "");
      const start = match ? Math.min(Number(match[1]), size) : 0;
      res.writeHead(match ? 206 : 200, {
        "Content-Type": "application/octet-stream", "Accept-Ranges": "bytes", "Content-Length": size - start,
        ...(match ? { "Content-Range": `bytes ${start}-${size - 1}/${size}` } : {})
      });
      if (req.method === "HEAD") { res.end(); return; }
      for (let position = start; position < size && !gone; position += chunk) {
        const response = await ranged(source, position, Math.min(position + chunk, size) - 1);
        for await (const part of response.body) {
          if (gone) break;
          if (!res.write(part)) await once(res, "drain");
        }
      }
      res.end();
    } catch { res.destroy(); }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  return { urls: sources.map((_, index) => `http://127.0.0.1:${port}/${index}`), close: () => { server.close(); server.closeAllConnections?.(); } };
}

// HLS manifests point at many segment URLs of their own, so they cannot go through the single-file ranged proxy.
export function usesHls(info) {
  return (info.requested_formats || [info]).some((input) => /m3u8/i.test(input.protocol || "") || /\.m3u8|\/manifest\//i.test(String(input.url || "")));
}

export function mediaSources(info) {
  return (info.requested_formats || [info]).map((input) => {
    const url = mediaUrl(input.url);
    if (!url) throw new DownloadError("FORMAT_UNAVAILABLE");
    return { url, headers: Object.fromEntries(mediaHeaderEntries(input.http_headers || info.http_headers)) };
  });
}

function streamFailure(stderr) {
  if (/\b403\b|forbidden/i.test(stderr)) return "UPSTREAM_403";
  if (/\b429\b|too many requests/i.test(stderr)) return "UPSTREAM_429";
  if (/timed? ?out|connection.*reset|network is unreachable/i.test(stderr)) return "UPSTREAM_NETWORK";
  if (/invalid data|could not find codec|matches no streams/i.test(stderr)) return "MEDIA_FORMAT";
  return "STREAM_FAILED";
}

export function streamArgs(info, quality, { proxy, inputUrls } = {}) {
  const inputs = info.requested_formats || [info];
  const args = ["-hide_banner", "-loglevel", "error", "-nostdin"];
  for (const [index, input] of inputs.entries()) {
    const url = inputUrls ? inputUrls[index] : mediaUrl(input.url);
    if (!url) throw new DownloadError("FORMAT_UNAVAILABLE");
    args.push("-protocol_whitelist", "https,tls,tcp,crypto,http,httpproxy", "-rw_timeout", "20000000", "-reconnect", "1", "-reconnect_at_eof", "1", "-reconnect_streamed", "1", "-reconnect_delay_max", "3");
    // Media URLs are bound to the IP that extracted them, so a WARP-extracted link must also stream through WARP.
    // (With loopback inputs the ranged proxy already handles the proxy and the headers.)
    if (proxy && !inputUrls) args.push("-http_proxy", proxy);
    const headers = inputUrls ? "" : mediaHeaders(input.http_headers || info.http_headers);
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

// Fast mode (360p only): the muxed 360p file is a single plain file that YouTube serves unthrottled
// (ratebypass=yes), so the visitor's browser can fetch it straight from the CDN. `&title=` makes googlevideo
// answer with Content-Disposition: attachment, so the browser saves it instead of playing it.
// Audio-only links are throttled by YouTube and send no filename, and HD merges two tracks, so both use the relay.
export function directLink(info, quality) {
  if (quality !== "360p" || info.requested_formats) return "";
  const url = mediaUrl(info.url);
  if (!url || !/[?&]ratebypass=yes(&|$)/.test(url)) return "";
  const hasVideo = info.vcodec && info.vcodec !== "none";
  const hasAudio = info.acodec && info.acodec !== "none";
  if (!(hasVideo && hasAudio) || Number(info.height || 360) > 480) return "";
  const title = String(info.title || "video").replace(/[\r\n/\\<>:"|?*&%#+]/g, "_").slice(0, 100);
  return `${url}&title=${encodeURIComponent(title)}`;
}

export function streamHeaders(info, quality) {
  const filename = `${String(info.title || "video").replace(/[\r\n/\\<>:"|?*]/g, "_").slice(0, 100)}.${quality === "audio" ? "m4a" : "mp4"}`;
  return {
    "Content-Type": quality === "audio" ? "audio/mp4" : "video/mp4",
    "Content-Disposition": `attachment; filename="download.${quality === "audio" ? "m4a" : "mp4"}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff"
  };
}

export async function streamMedia(req, res, info, quality, { maxBytes, proxy, spawnProcess = spawn, log = console.log, ranged = true } = {}) {
  let inputs = null;
  if (ranged && !usesHls(info)) {
    try { inputs = await startRangedInputs(mediaSources(info), { proxy }); }
    catch { if (!res.headersSent) res.status(502).type("text/plain").send("This download link could not be opened. Return to the tool and generate a fresh link."); return; }
  }
  const args = streamArgs(info, quality, inputs ? { inputUrls: inputs.urls } : { proxy });
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
    inputs?.close();
    clearTimeout(timer);
    clearTimeout(firstByteTimer);
    res.removeListener("close", stop);
    if (code === 0 && started) res.end();
    else if (!res.destroyed) fail();
    log(JSON.stringify({ event: "stream_finished", bytes, success: code === 0 && started, ...(code === 0 && started ? {} : { reason: streamFailure(stderr), detail: stderr.replace(/https?:\/\/\S+/g, "<url>").slice(-300) }) }));
    resolve();
  }));
}
