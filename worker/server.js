import express from "express";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { DownloadError, failureCode, publicFailure } from "./download-errors.js";
import { QUALITIES, createCookieStore, formatSelector, runCommand, videoIdFromInput, ytDlpArgs } from "./download-support.js";
import { streamArgs, streamMedia } from "./stream-download.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RETRY_CODES = new Set(["SOURCE_BUSY", "TIMEOUT", "FORMAT_UNAVAILABLE"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createWorker({ env = process.env, directory = path.join(__dirname, "downloads"),
  run = runCommand, stream = streamMedia, wait = sleep, log = console.log } = {}) {
  await mkdir(directory, { recursive: true });
  const cookies = await createCookieStore(directory, env);
  const maxDuration = Number(env.MAX_DURATION_SECONDS || 1800);
  const maxBytes = Number(env.MAX_FILE_MB || 500) * 1024 * 1024;
  const ttlMs = 10 * 60 * 1000;
  const jobs = new Map();
  const sources = new Map();
  let activeStreams = 0;
  const byVideo = new Map();
  const queue = [];
  let active = false;
  const app = express();
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

  async function processJob(job) {
    const jobDir = path.join(directory, job.id);
    const url = `https://www.youtube.com/watch?v=${job.videoId}`;
    const startedAt = Date.now();
    try {
      // Anonymous first: a stale login session must not break public video downloads.
      const strategies = cookies.available ? ["anonymous", "cookies", "anonymous"] : ["anonymous", "anonymous"];
      let selectedInfo;
      for (let attempt = 0; attempt < strategies.length; attempt++) {
        await mkdir(jobDir, { recursive: true });
        let cookiePath;
        try {
          job.attempt = attempt + 1;
          job.status = attempt ? "retrying" : "checking";
          if (strategies[attempt] === "cookies") cookiePath = await cookies.checkout(jobDir);
          const args = ytDlpArgs({ cookiePath, proxy: env.YTDLP_PROXY });
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
          const estimate = Number(info.filesize || info.filesize_approx || 0);
          if (estimate > maxBytes) throw new DownloadError("FILE_LIMIT");
          job.estimatedBytes = estimate;
          selectedInfo = info;
          break;
        } catch (error) {
          const code = failureCode(error);
          log(JSON.stringify({ event: "download_attempt", jobId: job.id, attempt: attempt + 1, strategy: strategies[attempt], code }));
          if (!RETRY_CODES.has(code) || attempt === strategies.length - 1) throw error;
          job.status = "retrying";
          await wait(1500 * (attempt + 1));
        } finally {
          if (cookiePath) await cookies.save(cookiePath).catch(() => {});
          await rm(jobDir, { recursive: true, force: true });
        }
      }
      const token = nanoid(32);
      sources.set(job.id, { info: selectedInfo, token });
      const origin = env.PUBLIC_WORKER_URL || (env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : "https://yt1s-production.up.railway.app");
      job.downloadUrl = `${origin}/stream/${job.id}?token=${token}`;
      job.expiresAt = new Date(Date.now() + ttlMs).toISOString();
      job.status = "completed";
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      log(JSON.stringify({ event: "download_complete", jobId: job.id, elapsedMs: Date.now() - startedAt, quality: job.actualQuality }));
    } catch (error) {
      Object.assign(job, publicFailure(error), { status: "failed", failedAt: new Date().toISOString() });
      log(JSON.stringify({ event: "download_failed", jobId: job.id, code: job.code, elapsedMs: Date.now() - startedAt }));
    } finally {
      await rm(jobDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  async function drain() {
    if (active) return;
    active = true;
    try {
      while (queue.length) await processJob(queue.shift());
    } finally { active = false; }
  }

  app.get("/health", (req, res) => res.json({
    ok: true, app: "yt1s-video-worker", version: "disk-free-stream-v3",
    cloudinary: Boolean(env.CLOUDINARY_URL), youtubeCookies: cookies.available,
    proxy: Boolean(env.YTDLP_PROXY), maxDurationSeconds: maxDuration, maxFileMb: maxBytes / 1024 / 1024
  }));

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
    if (queue.length >= 10 || jobs.size >= 500) return res.status(429).json(publicFailure(new DownloadError("SERVICE_BUSY")));
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
    if (activeStreams >= 3) return res.status(429).send("Downloads are busy. Please try again shortly.");
    if (req.method === "HEAD") return res.status(200).set("Cache-Control", "no-store").end();
    activeStreams++;
    try { await stream(req, res, source.info, job.quality, { maxBytes, log }); }
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
