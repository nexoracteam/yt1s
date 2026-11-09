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
  if (quality === "audio") return "bestaudio[ext=m4a]/bestaudio/18/best";
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

const COOLDOWN_MS = 30 * 60 * 1000;
const MAX_COOLDOWN_MS = 12 * 60 * 60 * 1000;

function cookieTexts(env) {
  // YOUTUBE_COOKIES_B64 is account 1; YOUTUBE_COOKIES_B64_2, _3, ... add more accounts.
  const texts = [];
  for (let index = 1; index <= 10; index++) {
    const suffix = index === 1 ? "" : `_${index}`;
    const encoded = env[`YOUTUBE_COOKIES_B64${suffix}`];
    const plain = env[`YOUTUBE_COOKIES${suffix}`];
    const text = (encoded ? Buffer.from(encoded, "base64").toString("utf8") : plain || "").replace(/^\uFEFF/, "");
    if (text) texts.push({ index, text });
  }
  return texts;
}

export async function createCookieStore(directory, env, now = () => Date.now()) {
  const accounts = [];
  const configuredTexts = cookieTexts(env);
  for (const { index, text } of configuredTexts) {
    if (!validCookies(text)) continue;
    const masterPath = path.join(directory, index === 1 ? "session-cookies.txt" : `session-cookies-${index}.txt`);
    await writeFile(masterPath, text, { mode: 0o600 });
    accounts.push({ index, masterPath, blockedUntil: 0, strikes: 0 });
  }
  const leases = new Map();
  let cursor = 0;
  const usable = () => accounts.filter((account) => account.blockedUntil <= now());
  return {
    configured: configuredTexts.length > 0,
    available: accounts.length > 0,
    accounts: accounts.length,
    // Accounts not cooling down after a bot block.
    healthy: () => usable().length,
    async checkout(jobDirectory) {
      if (!accounts.length) return null;
      // Round-robin across healthy accounts; if all are cooling down, still try the least recently blocked.
      const pool = usable().length ? usable() : [...accounts].sort((x, y) => x.blockedUntil - y.blockedUntil).slice(0, 1);
      const account = pool[cursor++ % pool.length];
      const cookiePath = path.join(jobDirectory, "cookies.txt");
      await writeFile(cookiePath, await readFile(account.masterPath), { mode: 0o600 });
      leases.set(cookiePath, account);
      return cookiePath;
    },
    async save(cookiePath) {
      const account = leases.get(cookiePath) || accounts[0];
      if (!account) return;
      // Jobs may overlap across accounts but never share an account file path; keep refreshed cookies.
      const updated = await readFile(cookiePath, "utf8").catch(() => "");
      if (!validCookies(updated)) return;
      await writeFile(`${account.masterPath}.tmp`, updated, { mode: 0o600 });
      await rename(`${account.masterPath}.tmp`, account.masterPath);
    },
    // Each consecutive failure doubles the cooldown (30 min up to 12 h) so a dead session stops being retried.
    markBlocked(cookiePath) {
      const account = leases.get(cookiePath);
      if (!account) return;
      account.strikes += 1;
      account.blockedUntil = now() + Math.min(COOLDOWN_MS * 2 ** (account.strikes - 1), MAX_COOLDOWN_MS);
    },
    markGood(cookiePath) {
      const account = leases.get(cookiePath);
      if (account) { account.strikes = 0; account.blockedUntil = 0; }
    },
    accountOf(cookiePath) { return leases.get(cookiePath)?.index; },
    release(cookiePath) { leases.delete(cookiePath); }
  };
}

export function ytDlpArgs({ cookiePath, proxy, playerClients, playerSkip }) {
  const args = ["--ignore-config", "--no-playlist", "--socket-timeout", "30",
    "--retries", "4", "--fragment-retries", "4", "--extractor-retries", "2",
    "--sleep-requests", "1", "--js-runtimes", `node:${process.execPath}`];
  const extractorArgs = [playerClients && `player_client=${playerClients}`, playerSkip && `player_skip=${playerSkip}`].filter(Boolean).join(";");
  if (extractorArgs) args.push("--extractor-args", `youtube:${extractorArgs}`);
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
