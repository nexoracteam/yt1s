// Report cookie health without printing any cookie values.
import { readFile } from "node:fs/promises";

const text = await readFile(process.argv[2] || "youtube-cookies.txt", "utf8");
const rows = text.replace(/^\uFEFF/, "").split(/\r?\n/)
  .filter((line) => line && (!line.startsWith("#") || line.startsWith("#HttpOnly_")))
  .map((line) => line.replace(/^#HttpOnly_/, "").split("\t"));
const youtube = rows.filter((row) => /(^|\.)youtube\.com$/.test(row[0]));
const now = Date.now() / 1000;
const active = youtube.filter((row) => row.length === 7 && (!Number(row[4]) || Number(row[4]) > now));
console.log(JSON.stringify({
  netscapeHeader: /^# (Netscape )?HTTP Cookie File/m.test(text),
  rows: rows.length,
  malformed: rows.filter((row) => row.length !== 7).length,
  youtube: youtube.length,
  active: active.length,
  hasLoginCookies: active.some((row) => ["SID", "SAPISID", "__Secure-3PAPISID"].includes(row[5]))
}, null, 2));
