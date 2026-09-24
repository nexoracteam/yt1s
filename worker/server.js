import express from "express";
import { spawn } from "node:child_process";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadDir = path.join(__dirname, "downloads");

const app = express();
const jobs = new Map();

app.use(express.json({ limit: "1mb" }));

const PORT = process.env.PORT || 8080;
const WORKER_SECRET = process.env.WORKER_SECRET || "";
const MAX_DURATION_SECONDS = Number(process.env.MAX_DURATION_SECONDS || 1800);
const MAX_FILE_MB = Number(process.env.MAX_FILE_MB || 500);

function requireSecret(req, res, next) {
  if (!WORKER_SECRET) return next();
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
  if (token !== WORKER_SECRET) return res.status(401).json({ error: "Unauthorized" });
  next();
}

function isYouTubeUrl(value = "") {
  try {
    const url = new URL(value);
    return ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"].includes(url.hostname);
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(value.trim());
  }
}

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return `https://www.youtube.com/watch?v=${trimmed}`;
  return trimmed;
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: false });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || stdout || `${command} exited with ${code}`));
    });
  });
}

function baseYtDlpArgs() {
  const args = [
    "--no-check-certificates",
    "--force-ipv4",
    "--user-agent",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "--add-header",
    "Accept-Language:en-US,en;q=0.9",
    "--js-runtimes",
    "node:/usr/local/bin/node",
    "--extractor-args",
    "youtube:player_client=android,web_safari,mweb"
  ];

  if (process.env.YOUTUBE_COOKIES_B64) {
    args.push("--cookies", path.join(downloadDir, "youtube-cookies.txt"));
  }

  return args;
}

function cleanError(message = "") {
  return String(message)
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s*https?:\/\/\S+/g, "")
    .slice(0, 900);
}

function formatSelector(quality) {
  if (quality === "audio") return "bestaudio[ext=m4a]/bestaudio/best";
  if (quality === "1080p") return "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best";
  if (quality === "720p") return "bestvideo[height<=720]+bestaudio/best[height<=720]/best";
  if (quality === "480p") return "bestvideo[height<=480]+bestaudio/best[height<=480]/best";
  if (quality === "360p") return "bestvideo[height<=360]+bestaudio/best[height<=360]/best";
  return "bestvideo+bestaudio/best";
}

async function getInfo(url) {
  const { stdout } = await run("yt-dlp", [...baseYtDlpArgs(), "--dump-json", "--no-playlist", url]);
  return JSON.parse(stdout);
}

async function writeCookiesIfPresent() {
  if (!process.env.YOUTUBE_COOKIES_B64) return;
  const { writeFile } = await import("node:fs/promises");
  const cookieText = Buffer.from(process.env.YOUTUBE_COOKIES_B64, "base64").toString("utf8");
  await writeFile(path.join(downloadDir, "youtube-cookies.txt"), cookieText, "utf8");
}

async function uploadToCloudinary(filePath, publicId, resourceType) {
  if (!process.env.CLOUDINARY_URL) throw new Error("CLOUDINARY_URL is missing on worker.");
  cloudinary.config({ secure: true });
  return cloudinary.uploader.upload(filePath, {
    resource_type: resourceType,
    folder: "yt1s-video/downloads",
    public_id: publicId,
    overwrite: true
  });
}

async function processJob(jobId, payload) {
  const job = jobs.get(jobId);
  const url = normalizeUrl(payload.url);
  const quality = payload.quality || "720p";
  const ext = quality === "audio" ? "m4a" : "mp4";
  const outputTemplate = path.join(downloadDir, `${jobId}.%(ext)s`);

  try {
    job.status = "checking";
    const info = await getInfo(url);
    const duration = Number(info.duration || 0);
    if (duration > MAX_DURATION_SECONDS) throw new Error(`Video is too long. Limit is ${MAX_DURATION_SECONDS} seconds.`);

    job.title = info.title;
    job.thumbnail = info.thumbnail;
    job.duration = duration;
    job.status = "downloading";

    const args = [
      ...baseYtDlpArgs(),
      "--no-playlist",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--restrict-filenames",
      "--merge-output-format",
      ext === "mp4" ? "mp4" : "m4a",
      "-f",
      formatSelector(quality),
      "-o",
      outputTemplate,
      url
    ];

    await run("yt-dlp", args, { cwd: downloadDir });

    const finalPath = path.join(downloadDir, `${jobId}.${ext}`);
    const fileStat = await stat(finalPath);
    const fileMb = fileStat.size / 1024 / 1024;
    if (fileMb > MAX_FILE_MB) throw new Error(`File is too large. Limit is ${MAX_FILE_MB} MB.`);

    job.status = "uploading";
    const upload = await uploadToCloudinary(finalPath, `${jobId}-${quality}`, quality === "audio" ? "video" : "video");

    job.status = "completed";
    job.downloadUrl = upload.secure_url;
    job.bytes = fileStat.size;
    job.completedAt = new Date().toISOString();

    await rm(finalPath, { force: true });
  } catch (error) {
    job.status = "failed";
    job.error = cleanError(error.message);
    job.failedAt = new Date().toISOString();
    await rm(downloadDir, { recursive: true, force: true });
    await mkdir(downloadDir, { recursive: true });
  }
}

app.get("/health", (req, res) => {
  res.json({ ok: true, app: "yt1s-video-worker", cloudinary: Boolean(process.env.CLOUDINARY_URL) });
});

app.post("/download", requireSecret, async (req, res) => {
  const { url, quality } = req.body || {};
  if (!url || !isYouTubeUrl(url)) return res.status(400).json({ error: "Valid YouTube URL is required." });

  const jobId = nanoid(12);
  jobs.set(jobId, {
    id: jobId,
    status: "queued",
    quality: quality || "720p",
    createdAt: new Date().toISOString()
  });

  processJob(jobId, { url, quality }).catch(() => {});
  res.status(202).json({ jobId, status: "queued" });
});

app.get("/job/:id", requireSecret, (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found." });
  res.json(job);
});

app.listen(PORT, async () => {
  await mkdir(downloadDir, { recursive: true });
  await writeCookiesIfPresent();
  console.log(`yt1s video worker listening on ${PORT}`);
});
