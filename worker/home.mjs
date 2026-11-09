// Home agent: lets this PC (a normal home connection, which YouTube trusts far more than a datacenter) do the
// work for the always-on worker. It only makes OUTBOUND HTTPS calls to that worker, so no tunnel, port
// forwarding or third-party service is needed. If this PC is off, the worker simply handles downloads itself.
//   extract task -> yt-dlp runs here and the format info is sent back
//   stream task  -> ffmpeg runs here and the finished MP4/M4A is uploaded, which the worker pipes to the visitor
import { spawn } from "node:child_process";
import { Readable } from "node:stream";
import { DownloadError, failureCode } from "./download-errors.js";
import { formatSelector, runCommand, ytDlpArgs } from "./download-support.js";
import { streamArgs } from "./stream-download.js";

const server = (process.env.WORKER_URL || "https://yt1s-worker-b6abf79b9888.herokuapp.com").replace(/\/$/, "");
const secret = process.env.HOME_SECRET;
if (!secret) { console.error("HOME_SECRET is required"); process.exit(1); }
const auth = { Authorization: `Bearer ${secret}` };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const strategies = [
  { name: "default" },
  { name: "modern-tv", playerClients: "tv_samsung,visionos,web" },
  { name: "vr-embedded", playerClients: "android_vr,web_embedded" }
];

// Only what the worker needs to build the ffmpeg command, so the upload stays small.
function slim(info) {
  const pick = (format) => ({ url: format.url, http_headers: format.http_headers, vcodec: format.vcodec, acodec: format.acodec, ext: format.ext, height: format.height });
  return {
    title: info.title, thumbnail: info.thumbnail, duration: info.duration, height: info.height, availability: info.availability,
    is_live: info.is_live, live_status: info.live_status, filesize: info.filesize, filesize_approx: info.filesize_approx,
    ...pick(info), ...(info.requested_formats ? { requested_formats: info.requested_formats.map(pick) } : {})
  };
}

async function extract({ videoId, quality }) {
  let lastError;
  for (const strategy of strategies) {
    try {
      const args = ytDlpArgs({ playerClients: strategy.playerClients });
      const { stdout } = await runCommand("yt-dlp", [...args, "--dump-single-json", "--skip-download", "-f", formatSelector(quality), `https://www.youtube.com/watch?v=${videoId}`]);
      const info = JSON.parse(stdout);
      streamArgs(info, quality); // throws if there is no usable format
      return { ok: true, info: slim(info), strategy: strategy.name };
    } catch (error) { lastError = error; }
  }
  return { ok: false, code: failureCode(lastError instanceof Error ? lastError : new DownloadError("SOURCE_BUSY")) };
}

async function handleExtract(task) {
  const started = Date.now();
  const result = await extract(task);
  console.log(`extract ${task.videoId} ${task.quality}: ${result.ok ? `ok via ${result.strategy}` : `failed ${result.code}`} in ${Date.now() - started}ms`);
  await fetch(`${server}/agent/result/${task.jobId}`, { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify({ ok: result.ok, info: result.info, code: result.code }), signal: AbortSignal.timeout(20000) }).catch((error) => console.error("result upload failed", error.message));
}

async function handleStream(task) {
  const started = Date.now();
  const abort = new AbortController();
  const child = spawn("ffmpeg", streamArgs(task.info, task.quality), { stdio: ["ignore", "pipe", "pipe"] });
  let bytes = 0, stderr = "";
  child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-1500); });
  child.stdout.on("data", (chunk) => { bytes += chunk.length; });
  child.once("close", (code) => { if (code !== 0) abort.abort(); });
  child.once("error", () => abort.abort());
  try {
    await fetch(`${server}/agent/upload/${task.streamId}`, {
      method: "POST", headers: { ...auth, "Content-Type": "application/octet-stream" },
      body: Readable.toWeb(child.stdout), duplex: "half", signal: abort.signal
    });
    console.log(`stream ${task.streamId}: ${bytes} bytes in ${Date.now() - started}ms`);
  } catch (error) {
    child.kill();
    console.error(`stream ${task.streamId} failed after ${bytes} bytes: ${error.message} ${stderr.replace(/https?:\/\/\S+/g, "<url>").slice(-200)}`);
  }
}

console.log(`home agent polling ${server}`);
for (;;) {
  try {
    const response = await fetch(`${server}/agent/next`, { headers: auth, signal: AbortSignal.timeout(40000) });
    if (response.status === 200) {
      const task = await response.json();
      void (task.type === "extract" ? handleExtract(task) : handleStream(task)).catch((error) => console.error("task error", error.message));
    } else if (response.status === 401) { console.error("worker rejected HOME_SECRET"); await sleep(30000); }
    else if (response.status !== 204) await sleep(3000);
  } catch (error) {
    await sleep(3000);
  }
}
