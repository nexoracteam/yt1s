// Home agent: lets this PC (a normal home connection, which YouTube trusts far more than a datacenter) do the
// work for the always-on worker. It only makes OUTBOUND HTTPS calls to that worker, so no tunnel, port
// forwarding or third-party service is needed. If this PC is off, the worker simply handles downloads itself.
//   extract task -> yt-dlp runs here and the format info is sent back
//   stream task  -> ffmpeg runs here and the finished MP4/M4A is uploaded, which the worker pipes to the visitor
import { spawn } from "node:child_process";
import { DownloadError, failureCode } from "./download-errors.js";
import { formatSelector, runCommand, ytDlpArgs } from "./download-support.js";
import { mediaSources, startRangedInputs, streamArgs, usesHls } from "./stream-download.js";

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
  let inputs = { urls: undefined, close() {} };
  if (!usesHls(task.info)) {
    try { inputs = await startRangedInputs(mediaSources(task.info)); }
    catch { await fetch(`${server}/agent/chunk/${task.streamId}?abort=1`, { method: "POST", headers: auth, signal: AbortSignal.timeout(10000) }).catch(() => {}); return; }
  }
  const child = spawn("ffmpeg", streamArgs(task.info, task.quality, { inputUrls: inputs.urls }), { stdio: ["ignore", "pipe", "pipe"] });
  const url = `${server}/agent/chunk/${task.streamId}`;
  let pending = [], size = 0, total = 0, seq = 0, sending = false, closed = false, aborted = false, stderr = "";
  child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-1500); });

  // Sends buffered bytes as one short POST; only one is in flight so order is preserved.
  async function flush(end = false) {
    if (sending || aborted) return;
    if (!pending.length && !end) return;
    sending = true;
    const body = Buffer.concat(pending);
    pending = []; size = 0;
    try {
      const response = await fetch(`${url}?seq=${seq++}${end ? "&end=1" : ""}`, { method: "POST", headers: { ...auth, "Content-Type": "application/octet-stream" }, body, signal: AbortSignal.timeout(60000) });
      total += body.length;
      if (!response.ok) { aborted = true; child.kill(); }
      else if ((await response.json().catch(() => ({}))).slow) await sleep(2000); // visitor's connection is slow: ease off
    } catch { aborted = true; child.kill(); }
    sending = false;
    child.stdout.resume();
  }

  const timer = setInterval(() => { void flush(); }, 1500);
  child.stdout.on("data", (chunk) => {
    pending.push(chunk); size += chunk.length;
    if (size >= 1024 * 1024) void flush();
    if (size >= 8 * 1024 * 1024) child.stdout.pause();
  });
  await new Promise((resolve) => child.once("close", (code) => { closed = true; clearInterval(timer); inputs.close(); aborted = aborted || code !== 0; resolve(); }));
  while (sending) await sleep(50);
  if (aborted) {
    await fetch(`${url}?abort=1`, { method: "POST", headers: auth, signal: AbortSignal.timeout(10000) }).catch(() => {});
    console.error(`stream ${task.streamId} failed after ${total} bytes: ${stderr.replace(/https?:\/\/\S+/g, "<url>").slice(-200)}`);
  } else {
    await flush(true);
    console.log(`stream ${task.streamId}: ${total} bytes in ${Date.now() - started}ms`);
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
