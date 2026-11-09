import express from "express";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { DownloadError, failureCode, publicFailure } from "./download-errors.js";
import { QUALITIES, createCookieStore, formatSelector, runCommand, videoIdFromInput, ytDlpArgs } from "./download-support.js";
import { directLink, probeMedia, streamArgs, streamMedia } from "./stream-download.js";
import { apifyExtract, createApifyBudget } from "./apify-fallback.js";
import { createAgentRelay } from "./agent-relay.js";
import { ytultraExtract } from "./ytultra-fallback.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RETRY_CODES = new Set(["SOURCE_BUSY", "TIMEOUT", "FORMAT_UNAVAILABLE", "DOWNLOAD_FAILED"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createWorker({ env = process.env, directory = path.join(__dirname, "downloads"),
  run = runCommand, warpCheck, warpRotate, apify = apifyExtract, ytultra = ytultraExtract, stream = streamMedia, probe = probeMedia, wait = sleep, log = console.log } = {}) {
  await mkdir(directory, { recursive: true });
  const cookies = await createCookieStore(directory, env);
  const maxDuration = Number(env.MAX_DURATION_SECONDS || 1800);
  const maxBytes = Number(env.MAX_FILE_MB || 500) * 1024 * 1024;
  const ttlMs = 10 * 60 * 1000;
  const prepareConcurrency = Math.max(1, Number(env.PREPARE_CONCURRENCY || 3));
  const maxQueue = Math.max(10, Number(env.MAX_QUEUE || 50));
  const streamConcurrency = Math.max(1, Number(env.STREAM_CONCURRENCY || 10));
  const warpProxy = env.WARP_PROXY || "";
  // Optional second worker (the always-on Heroku one) used when this worker cannot extract a video itself.
  const fallbackUrl = (env.FALLBACK_WORKER_URL || "").replace(/\/$/, "");
  // Home worker registry: a worker on a home connection (behind a Cloudflare quick tunnel) announces its
  // current public URL here, so the sites can prefer it and fall back to this worker when it is offline.
  let home = { url: "", at: 0 };
  const apifyBudget = createApifyBudget(Number(env.APIFY_DAILY_LIMIT ?? 150));
  const ytultraBudget = createApifyBudget(Number(env.YTULTRA_DAILY_LIMIT ?? 300));
  // The tunnel starts asynchronously (and may fail), so confirm it is really up, caching the answer briefly.
  let warpState = { at: 0, up: false };
  // When WARP itself gets bot-blocked, register a fresh WARP identity (new exit IP). Rate limited so a
  // genuinely unavailable video cannot trigger endless re-registration.
  let rotating = false, lastRotation = 0;
  async function rotateWarp() {
    if (!warpProxy || rotating || Date.now() - lastRotation < 5 * 60 * 1000) return;
    rotating = true; lastRotation = Date.now();
    try {
      await (warpRotate || (() => runCommand("sh", [path.join(__dirname, "warp.sh")], { timeoutMs: 90000 })))();
      log(JSON.stringify({ event: "warp_rotated" }));
    } catch { log(JSON.stringify({ event: "warp_rotate_failed" })); }
    finally { rotating = false; warpState = { at: 0, up: false }; }
  }
  async function warpUp() {
    if (rotating) return false;
    if (!warpProxy) return false;
    if (Date.now() - warpState.at < 30000) return warpState.up;
    const check = warpCheck || (async () => {
      const { stdout } = await runCommand("curl", ["-s", "-m", "6", "-x", warpProxy, "https://www.cloudflare.com/cdn-cgi/trace"], { timeoutMs: 8000 });
      return /^warp=(on|plus)/m.test(stdout);
    });
    warpState = { at: Date.now(), up: await check().catch(() => false) };
    return warpState.up;
  }
  const failureCacheMs = Number(env.FAILURE_CACHE_MS ?? 45000);
  const relay = createAgentRelay({ secret: env.HOME_SECRET, extractTimeoutMs: Number(env.AGENT_EXTRACT_TIMEOUT_MS || 60000) });
  const jobs = new Map();
  const sources = new Map();
  let activeStreams = 0;
  const byVideo = new Map();
  const queue = [];
  let active = 0;
  const app = express();
  relay.register(app);
  app.use(express.json({ limit: "16kb" }));

  function requireSecret(req, res, next) {
    if (env.ENFORCE_WORKER_AUTH !== "true") return next();
    if (!env.WORKER_SECRET || req.headers.authorization !== `Bearer ${env.WORKER_SECRET}`) {
      return res.status(401).json(publicFailure(new DownloadError("SERVICE_BUSY")));
    }
    next();
  }

  function prune() {
    for (const [id, job] of jobs) {
      if (["completed", "failed"].includes(job.status) && Date.now() - Date.parse(job.completedAt || job.failedAt) > ttlMs) {
        jobs.delete(id);
        sources.delete(id);
        const key = `${job.videoId}:${job.quality}`;
        if (byVideo.get(key) === id) byVideo.delete(key);
      }
    }
  }

  // Hand the job to the fallback worker and mirror its result; the download link then points at that worker.
  async function delegate(job) {
    const headers = { "Content-Type": "application/json", ...(env.FALLBACK_WORKER_SECRET ? { Authorization: `Bearer ${env.FALLBACK_WORKER_SECRET}` } : {}) };
    const started = await fetch(`${fallbackUrl}/download`, { method: "POST", headers, body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${job.videoId}`, quality: job.quality }), signal: AbortSignal.timeout(15000) });
    const first = await started.json();
    const remoteId = first.jobId || first.id;
    if (!remoteId) throw new DownloadError("SERVICE_BUSY");
    let remote = first;
    const deadline = Date.now() + 110000;
    while (!["completed", "failed"].includes(remote.status) && Date.now() < deadline) {
      await wait(2000);
      remote = await (await fetch(`${fallbackUrl}/job/${remoteId}`, { headers, signal: AbortSignal.timeout(15000) })).json();
    }
    if (remote.status !== "completed" || !remote.downloadUrl) throw new DownloadError("SOURCE_BUSY");
    for (const key of ["title", "thumbnail", "duration", "actualQuality", "estimatedBytes", "downloadUrl", "expiresAt"]) if (remote[key] !== undefined) job[key] = remote[key];
    job.viaFallback = true;
  }

  function finishJob(job, startedAt) {
    job.status = "completed";
    job.progress = 100;
    job.completedAt = new Date().toISOString();
    log(JSON.stringify({ event: "download_complete", jobId: job.id, elapsedMs: Date.now() - startedAt, quality: job.actualQuality, fallback: Boolean(job.viaFallback) }));
  }

  // Permitted third-party extraction (direct CDN links, free formats only). Enabled by YTULTRA_FALLBACK=true.
  async function tryYtultra(job, startedAt) {
    if (env.YTULTRA_FALLBACK !== "true" || !ytultraBudget.take()) return false;
    try {
      job.status = "retrying";
      const result = await ytultra({ videoId: job.videoId, quality: job.quality });
      Object.assign(job, result, { viaYtultra: true, expiresAt: new Date(Date.now() + ttlMs).toISOString() });
      finishJob(job, startedAt);
      return true;
    } catch { log(JSON.stringify({ event: "ytultra_failed", jobId: job.id })); return false; }
  }

  async function processJob(job) {
    const jobDir = path.join(directory, job.id);
    const url = `https://www.youtube.com/watch?v=${job.videoId}`;
    const startedAt = Date.now();
    // A standby worker on a blocked datacenter IP can set YTULTRA_FIRST=true to skip ~50s of attempts that always fail.
    if (env.YTULTRA_FIRST === "true" && job.quality !== "audio" && !relay.online() && await tryYtultra(job, startedAt)) return;
    try {
      // YouTube applies different bot/PO-token checks to each player client. Rotate
      // bounded, known-compatible clients before trying the optional cookie session.
      // With a cookie session, the cookie strategy is the one that works from a datacenter IP,
      // so try it first instead of burning ~25s on strategies that YouTube bot-blocks.
      // Cookie sessions work from a datacenter IP, so try them first: once without the watch page
      // (fast) and once with it (some videos only expose formats there). Round-robin moves each
      // attempt to a different account when several are configured.
      // Cookie sessions first (skipped while every account is cooling down, so a dead session is not re-hit).
      // Then WARP (a different IP, no cookies), then only two direct tries: from a datacenter IP the other
      // anonymous clients all get the same bot block, so extra attempts only add load and delay.
      const cookieStrategies = cookies.available && (cookies.healthy?.() ?? 1) > 0 ? [
        { name: "cookies-api", playerClients: "web_safari,web_creator", playerSkip: "webpage", cookies: true },
        { name: "cookies", playerClients: "web_safari,web_creator", cookies: true }
      ] : [];
      const warpStrategies = await warpUp() ? [
        { name: "warp-modern-tv", playerClients: "tv_samsung,visionos,web", proxy: warpProxy },
        { name: "warp-pot-api", playerClients: "mweb,web_safari,web_embedded", playerSkip: "webpage", proxy: warpProxy },
        { name: "warp-vr", playerClients: "android_vr,web_embedded", proxy: warpProxy }
      ] : [];
      const directStrategies = [
        { name: "modern-tv", playerClients: "tv_samsung,visionos,web" },
        { name: "pot-api", playerClients: "mweb,web_safari,web_embedded", playerSkip: "webpage" },
        // On a home (residential) connection the other anonymous clients work too, so keep them there.
        ...(env.FULL_DIRECT_STRATEGIES === "true" ? [
          { name: "tv-safari", playerClients: "tv,web_safari" },
          { name: "vr-embedded", playerClients: "android_vr,web_embedded" },
          { name: "default" }
        ] : [])
      ];
      const strategies = [...cookieStrategies, ...warpStrategies, ...directStrategies];
      let selectedInfo, selectedProxy, viaHome = false;
      // A connected home agent (residential IP) extracts first; if it fails or is offline the normal routes run.
      if (relay.online()) {
        try {
          job.status = "checking";
          const info = await relay.extract({ jobId: job.id, videoId: job.videoId, quality: job.quality });
          if (info.is_live || info.live_status === "is_upcoming") throw new DownloadError("LIVE_VIDEO");
          if (Number(info.duration || 0) > maxDuration) throw new DownloadError("DURATION_LIMIT");
          if (["private", "premium_only", "subscriber_only", "needs_auth"].includes(info.availability)) throw new DownloadError("VIDEO_UNAVAILABLE");
          streamArgs(info, job.quality);
          const estimate = Number(info.filesize || info.filesize_approx || 0);
          if (estimate > maxBytes) throw new DownloadError("FILE_LIMIT");
          job.title = info.title; job.thumbnail = info.thumbnail; job.duration = Number(info.duration || 0);
          job.actualQuality = job.quality === "audio" ? "audio" : info.height ? `${info.height}p` : job.quality;
          job.estimatedBytes = estimate;
          selectedInfo = info; viaHome = true;
          // Only home-IP extractions get a direct link; the site checks that it opens and otherwise uses the relay.
          job.directUrl = directLink(info, job.quality) || undefined;
        } catch (error) {
          const code = failureCode(error);
          log(JSON.stringify({ event: "home_extract_failed", jobId: job.id, code }));
          if (!RETRY_CODES.has(code)) throw error;
        }
      }
      for (let attempt = 0; attempt < strategies.length && !selectedInfo; attempt++) {
        await mkdir(jobDir, { recursive: true });
        let cookiePath;
        let stage = "extract";
        try {
          job.attempt = attempt + 1;
          job.status = attempt ? "retrying" : "checking";
          const strategy = strategies[attempt];
          if (strategy.cookies) cookiePath = await cookies.checkout(jobDir);
          const args = ytDlpArgs({ cookiePath, proxy: strategy.proxy || env.YTDLP_PROXY, playerClients: strategy.playerClients, playerSkip: strategy.playerSkip });
          const { stdout } = await run("yt-dlp", [...args, "--dump-single-json", "--skip-download", "-f", formatSelector(job.quality), url]);
          const info = JSON.parse(stdout);
          if (info.is_live || info.live_status === "is_upcoming") throw new DownloadError("LIVE_VIDEO");
          if (Number(info.duration || 0) > maxDuration) throw new DownloadError("DURATION_LIMIT");
          if (["private", "premium_only", "subscriber_only", "needs_auth"].includes(info.availability)) throw new DownloadError("VIDEO_UNAVAILABLE");
          job.title = info.title;
          job.thumbnail = info.thumbnail;
          job.duration = Number(info.duration || 0);
          job.actualQuality = job.quality === "audio" ? "audio" : info.height ? `${info.height}p` : job.quality;
          streamArgs(info, job.quality);
          stage = "probe";
          await probe(info, strategy.proxy ? { proxy: strategy.proxy } : undefined);
          const estimate = Number(info.filesize || info.filesize_approx || 0);
          if (estimate > maxBytes) throw new DownloadError("FILE_LIMIT");
          job.estimatedBytes = estimate;
          selectedInfo = info;
          selectedProxy = strategy.proxy;
          if (cookiePath) { cookies.markGood?.(cookiePath); log(JSON.stringify({ event: "cookie_ok", jobId: job.id, strategy: strategy.name, account: cookies.accountOf?.(cookiePath) })); }
          break;
        } catch (error) {
          const code = failureCode(error);
          // A bot block, or a session that no longer yields formats, sidelines that account for a while.
          if (cookiePath && (code === "SOURCE_BUSY" || code === "FORMAT_UNAVAILABLE")) cookies.markBlocked(cookiePath);
          log(JSON.stringify({ event: "download_attempt", jobId: job.id, attempt: attempt + 1, strategy: strategies[attempt].name, stage, code, account: cookies.accountOf?.(cookiePath) }));
          if (!RETRY_CODES.has(code) || attempt === strategies.length - 1) {
            // Every WARP try ended in a bot block: that exit IP is burned, so rotate it for the next job.
            if (code === "SOURCE_BUSY" && warpStrategies.length) void rotateWarp();
            throw error;
          }
          job.status = "retrying";
          await wait(1500 * (attempt + 1));
        } finally {
          if (cookiePath) { await cookies.save(cookiePath).catch(() => {}); cookies.release?.(cookiePath); }
          await rm(jobDir, { recursive: true, force: true });
        }
      }
      const token = nanoid(32);
      sources.set(job.id, { info: selectedInfo, token, proxy: selectedProxy, home: viaHome });
      const origin = env.PUBLIC_WORKER_URL || ("https://yt1s-worker-b6abf79b9888.herokuapp.com");
      job.downloadUrl = `${origin}/stream/${job.id}?token=${token}`;
      job.expiresAt = new Date(Date.now() + ttlMs).toISOString();
      job.status = "completed";
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      log(JSON.stringify({ event: "download_complete", jobId: job.id, elapsedMs: Date.now() - startedAt, quality: job.actualQuality }));
    } catch (error) {
      if (fallbackUrl && RETRY_CODES.has(failureCode(error))) {
        try { job.status = "retrying"; await delegate(job); return finishJob(job, startedAt); }
        catch { log(JSON.stringify({ event: "fallback_failed", jobId: job.id })); }
      }
      // Paid last resort, only when a token is configured and today's budget allows it.
      if (env.APIFY_TOKEN && RETRY_CODES.has(failureCode(error)) && apifyBudget.take()) {
        try {
          job.status = "retrying";
          const result = await apify({ token: env.APIFY_TOKEN, videoId: job.videoId, quality: job.quality });
          Object.assign(job, result, { viaApify: true, expiresAt: new Date(Date.now() + ttlMs).toISOString() });
          return finishJob(job, startedAt);
        } catch { log(JSON.stringify({ event: "apify_failed", jobId: job.id })); }
      }
      // Last resort: permitted third-party extraction (direct CDN links, free formats only).
      if (RETRY_CODES.has(failureCode(error)) && await tryYtultra(job, startedAt)) return;
      Object.assign(job, publicFailure(error), { status: "failed", failedAt: new Date().toISOString() });
      log(JSON.stringify({ event: "download_failed", jobId: job.id, code: job.code, elapsedMs: Date.now() - startedAt }));
    } finally {
      await rm(jobDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async function drain() {
    while (active < prepareConcurrency && queue.length) {
      const job = queue.shift();
      active++;
      void processJob(job).finally(() => { active--; void drain(); });
    }
  }

  app.get("/health", async (req, res) => {
    const poTokenProvider = await fetch("http://127.0.0.1:4416/ping", { signal: AbortSignal.timeout(2000) })
      .then((response) => response.ok).catch(() => false);
    res.json({
      ok: true, app: "yt1s-video-worker", version: "disk-free-stream-v4",
      cloudinary: Boolean(env.CLOUDINARY_URL), youtubeCookies: cookies.available, cookieAccounts: cookies.accounts, healthyCookieAccounts: cookies.healthy?.() ?? 0, poTokenProvider,
      proxy: Boolean(env.YTDLP_PROXY), warp: await warpUp(), agentOnline: relay.online(), maxDurationSeconds: maxDuration, maxFileMb: maxBytes / 1024 / 1024,
      prepareConcurrency, streamConcurrency, maxQueue
    });
  });

  app.post("/home/register", (req, res) => {
    const url = String(req.body?.url || "");
    if (!env.HOME_SECRET || req.headers.authorization !== `Bearer ${env.HOME_SECRET}`) return res.status(401).json({ ok: false });
    if (!/^https:\/\/[a-z0-9-]+\.trycloudflare\.com\/?$/.test(url) || /^https:\/\/api\./.test(url)) return res.status(400).json({ ok: false });
    home = { url: url.replace(/\/$/, ""), at: Date.now() };
    res.json({ ok: true });
  });

  app.get("/home", (req, res) => {
    const fresh = home.url && Date.now() - home.at < 150000;
    res.set("Cache-Control", "no-store").json({ url: fresh ? home.url : null });
  });

  app.post("/download", requireSecret, (req, res) => {
    const videoId = videoIdFromInput(req.body?.url);
    const quality = req.body?.quality ?? "720p";
    if (!videoId) return res.status(400).json(publicFailure(new DownloadError("INVALID_URL")));
    if (!QUALITIES.includes(quality)) return res.status(400).json(publicFailure(new DownloadError("INVALID_QUALITY")));
    prune();
    const key = `${videoId}:${quality}`;
    const existing = jobs.get(byVideo.get(key));
    if (existing && existing.status !== "failed") {
      return res.status(existing.status === "completed" ? 200 : 202).json({ ...existing, jobId: existing.id, cached: existing.status === "completed" });
    }
    // A video that just failed all strategies is not retried for a short while: repeated clicks would only
    // hammer YouTube again and lengthen the block.
    const lastFailed = jobs.get(byVideo.get(key));
    if (lastFailed?.status === "failed" && Date.now() - Date.parse(lastFailed.failedAt) < failureCacheMs) {
      return res.status(200).json({ ...lastFailed, jobId: lastFailed.id });
    }
    if (queue.length >= maxQueue || jobs.size >= 500) return res.status(429).json(publicFailure(new DownloadError("SERVICE_BUSY")));
    const id = nanoid(12);
    const job = { id, videoId, quality, status: "queued", createdAt: new Date().toISOString() };
    jobs.set(id, job);
    byVideo.set(key, id);
    queue.push(job);
    res.status(202).json({ jobId: id, status: "queued" });
    void drain();
  });

  app.get("/job/:id", requireSecret, (req, res) => {
    prune();
    const job = jobs.get(req.params.id);
    if (!job) return res.status(404).json(publicFailure(new DownloadError("JOB_EXPIRED")));
    res.set("Cache-Control", "no-store").json(job);
  });

  app.get("/stream/:id", async (req, res) => {
    prune();
    const job = jobs.get(req.params.id);
    const source = sources.get(req.params.id);
    if (!job || !source || req.query.token !== source.token) return res.status(404).send("Download link expired. Please generate a fresh link.");
    if (activeStreams >= streamConcurrency) return res.status(503).send("The download is still preparing. Please try the download button again in a moment.");
    if (req.method === "HEAD") return res.status(200).set("Cache-Control", "no-store").end();
    activeStreams++;
    try {
      if (source.home && relay.online()) await relay.stream(req, res, { info: source.info, quality: job.quality });
      else await stream(req, res, source.info, job.quality, { maxBytes, log, proxy: source.proxy });
    }
    catch { if (!res.headersSent) res.status(502).send("Please generate a fresh download link."); else res.destroy(); }
    finally { activeStreams--; }
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    res.status(400).json(publicFailure(new DownloadError("INVALID_URL")));
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const app = await createWorker();
  app.listen(process.env.PORT || 8080, () => console.log("yt1s download recovery worker ready"));
}
