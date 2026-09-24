import { spawn } from "node:child_process";
import { readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { DownloadError } from "./download-errors.js";

export const QUALITIES = ["360p", "480p", "720p", "1080p", "audio"];

export function videoIdFromInput(input) {
  if (typeof input !== "string") return "";
  const value = input.trim();
  if (/^[\w-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    const hosts = ["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtu.be"];
    if (!hosts.includes(url.hostname)) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    const id = url.hostname.endsWith("youtu.be") ? parts[0]
      : parts[0] === "watch" ? url.searchParams.get("v")
        : ["shorts", "embed", "live"].includes(parts[0]) ? parts[1] : "";
    return /^[\w-]{11}$/.test(id || "") ? id : "";
  } catch { return ""; }
}

export function formatSelector(quality) {
  if (quality === "audio") return "bestaudio[ext=m4a]/bestaudio";
  const height = Number(quality.replace("p", ""));
  // Prefer combined streams only at the requested height, not 360p for every quality.
  return `best[height=${height}][ext=mp4]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]`;
}

export function validCookies(text, now = Date.now() / 1000) {
  if (!/^# (Netscape )?HTTP Cookie File/m.test(text)) return false;
  const rows = text.replace(/^\uFEFF/, "").split(/\r?\n/)
    .filter((line) => line.trim() && (!line.startsWith("#") || line.startsWith("#HttpOnly_")))
    .map((line) => line.replace(/^#HttpOnly_/, "").split("\t"));
  return rows.length > 0 && rows.every((row) => row.length === 7 && Number.isFinite(Number(row[4])))
    && rows.some((row) => /(^|\.)youtube\.com$/.test(row[0]) && (!Number(row[4]) || Number(row[4]) > now));
}

export async function createCookieStore(directory, env) {
  const masterPath = path.join(directory, "session-cookies.txt");
  const text = (env.YOUTUBE_COOKIES_B64
    ? Buffer.from(env.YOUTUBE_COOKIES_B64, "base64").toString("utf8")
    : env.YOUTUBE_COOKIES || "").replace(/^\uFEFF/, "");
  const configured = Boolean(text);
  const available = configured && validCookies(text);
  if (available) await writeFile(masterPath, text, { mode: 0o600 });
  return {
    configured, available,
    async checkout(jobDirectory) {
      if (!available) return null;
      const cookiePath = path.join(jobDirectory, "cookies.txt");
      await writeFile(cookiePath, await readFile(masterPath), { mode: 0o600 });
      return cookiePath;
    },
    async save(cookiePath) {
      // Jobs are serialized. Preserve refreshed cookies rather than resetting from env on every request.
      const updated = await readFile(cookiePath, "utf8").catch(() => "");
      if (!validCookies(updated)) return;
      await writeFile(`${masterPath}.tmp`, updated, { mode: 0o600 });
      await rename(`${masterPath}.tmp`, masterPath);
    }
  };
}

export function ytDlpArgs({ cookiePath, proxy }) {
  const args = ["--ignore-config", "--no-playlist", "--force-ipv4", "--socket-timeout", "20",
    "--retries", "2", "--fragment-retries", "2", "--extractor-retries", "1",
    "--js-runtimes", `node:${process.execPath}`];
  // Use the maintained default clients from the installed yt-dlp version.
  if (cookiePath) args.push("--cookies", cookiePath);
  else args.push("--no-cookies");
  if (proxy) args.push("--proxy", proxy);
  return args;
}

export function runCommand(command, args, { timeoutMs = 90000, onLine, ...options } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: false, detached: process.platform !== "win32" });
    let stdout = "", stderr = "", pending = "", timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (process.platform !== "win32") process.kill(-child.pid, "SIGKILL");
        else child.kill("SIGKILL");
      } catch { child.kill("SIGKILL"); }
    }, timeoutMs);
    child.stdout.on("data", (chunk) => {
      stdout = (stdout + chunk).slice(-8 * 1024 * 1024);
      if (onLine) {
        pending += chunk;
        const lines = pending.split(/\r?\n/);
        pending = lines.pop();
        for (const line of lines) onLine(line);
      }
    });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-16000); });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) reject(new DownloadError("TIMEOUT"));
      else if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(stderr || "Download process failed"));
    });
  });
}

export function directDownloadUrl(url) {
  const parsed = new URL(url);
  if (parsed.hostname !== "res.cloudinary.com") throw new DownloadError("DELIVERY_UNAVAILABLE");
  return url.includes("/fl_attachment/") ? url : url.replace("/upload/", "/upload/fl_attachment/");
}
