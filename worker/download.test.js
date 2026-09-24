import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createWorker } from "./server.js";
import { runCommand, videoIdFromInput, formatSelector } from "./download-support.js";
import { streamArgs, mediaUrl } from "./stream-download.js";

const cookie = (value) => `# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t2000000000\tSID\t${value}\n`;

async function fixture(t, options) {
  const directory = await mkdtemp(path.join(tmpdir(), "yt1s-test-"));
  const app = await createWorker({ directory, env: { YOUTUBE_COOKIES: cookie("initial") }, wait: async () => {}, log: () => {}, ...options });
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(async () => { await new Promise((resolve) => server.close(resolve)); await rm(directory, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  async function start(url = "https://youtu.be/RpJ4UWDjyeU", quality = "720p") {
    const response = await fetch(`${base}/download`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, quality }) });
    return { status: response.status, ...await response.json() };
  }
  async function finish(id) {
    for (let n = 0; n < 200; n++) {
      const job = await (await fetch(`${base}/job/${id}`)).json();
      if (["completed", "failed"].includes(job.status)) return job;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    assert.fail("Job never finished");
  }
  return { directory, start, finish };
}

test("recovers from anonymous block, preserves rotated cookies, caches canonical URLs and cleans only job files", async (t) => {
  let extractions = 0;
  const f = await fixture(t, {
    async run(command, args) {
      const cookieIndex = args.indexOf("--cookies");
      if (args.includes("--dump-single-json")) {
        extractions++;
        if (cookieIndex < 0) throw new Error("Sign in to confirm you're not a bot. YOUTUBE_COOKIES_B64 secret-value");
        await writeFile(args[cookieIndex + 1], cookie("rotated"));
        return { stdout: JSON.stringify({ title: "Video", duration: 20, height: 720, availability: "public", url: "https://example.googlevideo.com/video", vcodec: "avc1", acodec: "mp4a" }) };
      }
      assert.fail("Preparing a link must never download media to disk");
    },
    async stream(req, res) { res.end("media"); }
  });
  const started = await f.start();
  const job = await f.finish(started.jobId);
  assert.equal(job.status, "completed");
  assert.equal(job.attempt, 2);
  assert.match(job.downloadUrl, /\/stream\/.*\?token=/);
  assert.ok(job.expiresAt);
  assert.match(await readFile(path.join(f.directory, "session-cookies.txt"), "utf8"), /rotated/);
  const again = await f.start("https://www.youtube.com/watch?v=RpJ4UWDjyeU&feature=share");
  assert.equal(again.cached, true);
  assert.equal(again.jobId, started.jobId);
  assert.equal(extractions, 2);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.deepEqual(await readdir(f.directory), ["session-cookies.txt"]);
});

test("bounded retries never leak internal errors and failure does not remove cookies", async (t) => {
  let calls = 0;
  const f = await fixture(t, { async run() { calls++; throw new Error("HTTP Error 429 YOUTUBE_COOKIES_B64 Railway secret-value"); } });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "failed");
  assert.equal(job.code, "SOURCE_BUSY");
  assert.equal(calls, 3);
  assert.doesNotMatch(JSON.stringify(job), /Railway|YOUTUBE_COOKIES|secret-value|429/);
  assert.match(await readFile(path.join(f.directory, "session-cookies.txt"), "utf8"), /initial/);
});

test("private video is not retried and invalid input never starts a process", async (t) => {
  let calls = 0;
  const f = await fixture(t, { async run() { calls++; throw new Error("Private video"); } });
  assert.equal((await f.start({ value: "x" })).code, "INVALID_URL");
  assert.equal((await f.start("https://evil.test/watch?v=RpJ4UWDjyeU")).code, "INVALID_URL");
  assert.equal((await f.start("RpJ4UWDjyeU", "4k")).code, "INVALID_QUALITY");
  assert.equal(calls, 0);
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.code, "VIDEO_UNAVAILABLE");
  assert.equal(calls, 1);
});

test("command timeout terminates subprocess", async () => {
  await assert.rejects(runCommand(process.execPath, ["-e", "setInterval(()=>{},1000)"], { timeoutMs: 100 }), { code: "TIMEOUT" });
});

test("quality selection and strict video URL parsing", () => {
  assert.match(formatSelector("1080p"), /^best\[height=1080\]/);
  assert.equal(videoIdFromInput("https://youtube.com.evil.test/watch?v=RpJ4UWDjyeU"), "");
  assert.equal(videoIdFromInput("https://youtube.com/shorts/RpJ4UWDjyeU"), "RpJ4UWDjyeU");
});

test("HD streaming merges separate tracks to stdout, never a disk file", () => {
  const args = streamArgs({ requested_formats: [
    { url: "https://rr1.googlevideo.com/video", vcodec: "avc1", acodec: "none" },
    { url: "https://rr1.googlevideo.com/audio", vcodec: "none", acodec: "mp4a.40.2" }
  ] }, "1080p");
  assert.equal(args.at(-1), "pipe:1");
  assert.ok(args.includes("0:v:0"));
  assert.ok(args.includes("1:a:0"));
  assert.equal(args[args.indexOf("-c:v") + 1], "copy");
  assert.equal(args[args.indexOf("-c:a") + 1], "copy");
  assert.ok(args.includes("+frag_keyframe+empty_moov+default_base_moof"));
  assert.equal(mediaUrl("http://127.0.0.1/admin"), "");
  assert.equal(mediaUrl("https://googlevideo.com.evil.test/file"), "");
  assert.throws(() => streamArgs({url:"file:///etc/passwd"}, "720p"), {code:"FORMAT_UNAVAILABLE"});
});
