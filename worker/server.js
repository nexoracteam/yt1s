import express from "express";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { v2 as cloudinary } from "cloudinary";
import { DownloadError, failureCode, publicFailure } from "./download-errors.js";
import { QUALITIES, createCookieStore, directDownloadUrl, formatSelector, runCommand, videoIdFromInput, ytDlpArgs } from "./download-support.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RETRY_CODES = new Set(["SOURCE_BUSY", "TIMEOUT", "FORMAT_UNAVAILABLE"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function uploadFile(filePath, publicId) {
  if (!process.env.CLOUDINARY_URL) throw new DownloadError("DELIVERY_UNAVAILABLE");
  cloudinary.config({ secure: true });
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_chunked(filePath, {
      resource_type: "video", folder: "yt1s-video/downloads", public_id: publicId,
      overwrite: true, chunk_size: 6 * 1024 * 1024, timeout: 120000
    }, (error, result) => {
      if (error) {
        console.error(JSON.stringify({ event: "upload_failed", status: error.http_code || 0, reason: String(error.message || "").replace(/https?:\/\/\S+/g, "[url]").slice(0, 200) }));
        reject(new DownloadError("DELIVERY_UNAVAILABLE"));
      }
      else if (result?.done !== false && result?.secure_url) resolve(result);
    });
  });
}

export async function createWorker({ env = process.env, directory = path.join(__dirname, "downloads"),
  run = runCommand, upload = uploadFile, wait = sleep, log = console.log } = {}) {
  await mkdir(directory, { recursive: true });
  const cookies = await createCookieStore(directory, env);
  const maxDuration = Number(env.MAX_DURATION_SECONDS || 1800);
  const maxBytes = Number(env.MAX_FILE_MB || 500) * 1024 * 1024;
  const ttlMs = 60 * 60 * 1000;
  const jobs = new Map();
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
        const key = `${job.videoId}:${job.quality}`;
        if (byVideo.get(key) === id) byVideo.delete(key);
      }
    }
  }

  async function processJob(job) {
    const jobDir = path.join(directory, job.id);
    const url = `https://www.youtube.com/watch?v=${job.videoId}`;
    const ext = job.quality === "audio" ? "m4a" : "mp4";
    const startedAt = Date.now();
    try {
      // Anonymous first: a stale login session must not break public video downloads.
      const strategies = cookies.available ? ["anonymous", "cookies", "anonymous"] : ["anonymous", "anonymous"];
      let filePath;
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
          job.status = "downloading";
          job.progress = 0;
          const infoPath = path.join(jobDir, "info.json");
          await writeFile(infoPath, JSON.stringify(info), { mode: 0o600 });
          // Reuse extraction: no duplicate player/challenge request when starting the download.
          const downloadArgs = [...args, "--load-info-json", infoPath, "-f", formatSelector(job.quality), "--no-simulate", "--concurrent-fragments", "4",
            "--max-filesize", String(maxBytes), "--newline", "--progress", "--progress-template", "download:__PROGRESS__%(progress._percent_str)s",
            "-o", path.join(jobDir, "media.%(ext)s")];
          if (job.quality === "audio") downloadArgs.push("--extract-audio", "--audio-format", "m4a");
          else downloadArgs.push("--merge-output-format", "mp4", "--remux-video", "mp4");
          await run("yt-dlp", downloadArgs, {
            timeoutMs: 360000,
            onLine(line) {
              const match = line.match(/__PROGRESS__\s*([\d.]+)%/);
              if (match) job.progress = Math.min(100, Math.round(Number(match[1])));
            }
          });
          const candidate = path.join(jobDir, `media.${ext}`);
          const file = await stat(candidate).catch(() => { throw new DownloadError("FILE_LIMIT"); });
          if (!file.size || file.size > maxBytes) throw new DownloadError("FILE_LIMIT");
          job.bytes = file.size;
          filePath = candidate;
          break;
        } catch (error) {
          const code = failureCode(error);
          log(JSON.stringify({ event: "download_attempt", jobId: job.id, attempt: attempt + 1, strategy: strategies[attempt], code }));
          if (!RETRY_CODES.has(code) || attempt === strategies.length - 1) throw error;
          job.status = "retrying";
          await wait(1500 * (attempt + 1));
        } finally {
          if (cookiePath) await cookies.save(cookiePath).catch(() => {});
          if (!filePath) await rm(jobDir, { recursive: true, force: true });
        }
      }
      job.status = "uploading";
      const result = await upload(filePath, `${job.id}-${job.quality}`);
      job.previewUrl = result.secure_url;
      job.downloadUrl = directDownloadUrl(result.secure_url);
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
    ok: true, app: "yt1s-video-worker", version: "download-recovery-v2",
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
