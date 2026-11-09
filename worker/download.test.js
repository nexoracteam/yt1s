import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import express from "express";
import { createWorker } from "./server.js";
import { createCookieStore, runCommand, videoIdFromInput, formatSelector, ytDlpArgs } from "./download-support.js";
import { apifyExtract, apifyFormat, createApifyBudget } from "./apify-fallback.js";
import { probeMedia, streamArgs, mediaHeaders, mediaUrl } from "./stream-download.js";

const cookie = (value) => `# Netscape HTTP Cookie File\n.youtube.com\tTRUE\t/\tTRUE\t2000000000\tSID\t${value}\n`;

async function fixture(t, options) {
  const directory = await mkdtemp(path.join(tmpdir(), "yt1s-test-"));
  const app = await createWorker({ directory, env: { YOUTUBE_COOKIES: cookie("initial") }, probe: async () => {}, wait: async () => {}, log: () => {}, ...options });
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
  return { directory, start, finish, base };
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
  assert.equal(job.attempt, 1);
  assert.match(job.downloadUrl, /\/stream\/.*\?token=/);
  assert.ok(job.expiresAt);
  assert.match(await readFile(path.join(f.directory, "session-cookies.txt"), "utf8"), /rotated/);
  const again = await f.start("https://www.youtube.com/watch?v=RpJ4UWDjyeU&feature=share");
  assert.equal(again.cached, true);
  assert.equal(again.jobId, started.jobId);
  assert.equal(extractions, 1);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.deepEqual(await readdir(f.directory), ["session-cookies.txt"]);
});

test("bounded retries never leak internal errors and failure does not remove cookies", async (t) => {
  let calls = 0;
  const f = await fixture(t, { async run() { calls++; throw new Error("HTTP Error 429 YOUTUBE_COOKIES_B64 Railway secret-value"); } });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "failed");
  assert.equal(job.code, "SOURCE_BUSY");
  assert.equal(calls, 4);
  assert.doesNotMatch(JSON.stringify(job), /Railway|YOUTUBE_COOKIES|secret-value|429/);
  assert.match(await readFile(path.join(f.directory, "session-cookies.txt"), "utf8"), /initial/);
});

test("unknown extractor failures continue through the bounded client fallbacks", async (t) => {
  let calls = 0;
  const f = await fixture(t, {
    async run() {
      calls++;
      if (calls < 3) throw new Error("Unexpected extractor response");
      return { stdout: JSON.stringify({ title: "Recovered", duration: 20, height: 720, availability: "public", url: "https://example.googlevideo.com/video", vcodec: "avc1", acodec: "mp4a" }) };
    }
  });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "completed");
  assert.equal(job.attempt, 3);
  assert.equal(calls, 3);
});

test("unplayable extracted media URLs fall through to the next client", async (t) => {
  let probes = 0;
  const f = await fixture(t, {
    async run() {
      return { stdout: JSON.stringify({ title: "Video", duration: 20, height: 720, availability: "public", url: "https://example.googlevideo.com/video", vcodec: "avc1", acodec: "mp4a" }) };
    },
    async probe() {
      probes++;
      if (probes === 1) throw Object.assign(new Error("blocked"), { code: "SOURCE_BUSY" });
    }
  });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "completed");
  assert.equal(job.attempt, 2);
  assert.equal(probes, 2);
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

test("yt-dlp strategies can select alternate YouTube clients without leaking config", () => {
  const args = ytDlpArgs({ playerClients: "mweb,web_safari", playerSkip: "webpage" });
  assert.equal(args[args.indexOf("--extractor-args") + 1], "youtube:player_client=mweb,web_safari;player_skip=webpage");
  assert.ok(args.includes("--no-cookies"));
  assert.ok(args.includes("--sleep-requests"));
});

test("HD streaming merges separate tracks to stdout, never a disk file", () => {
  const args = streamArgs({ requested_formats: [
    { url: "https://rr1.googlevideo.com/video", vcodec: "avc1", acodec: "none", http_headers: { "user-agent": "client", "X-YouTube-Client-Name": "28", Host: "blocked", Bad: "x\r\ny" } },
    { url: "https://rr1.googlevideo.com/audio", vcodec: "none", acodec: "mp4a.40.2" }
  ] }, "1080p");
  assert.equal(args.at(-1), "pipe:1");
  assert.ok(args.includes("0:v:0"));
  assert.ok(args.includes("1:a:0"));
  assert.equal(args[args.indexOf("-c:v") + 1], "copy");
  assert.equal(args[args.indexOf("-c:a") + 1], "copy");
  assert.ok(args.includes("+frag_keyframe+empty_moov+default_base_moof"));
  const forwardedHeaders = args[args.indexOf("-headers") + 1];
  assert.match(forwardedHeaders, /user-agent: client/);
  assert.match(forwardedHeaders, /X-YouTube-Client-Name: 28/);
  assert.doesNotMatch(forwardedHeaders, /Host|Bad/);
  assert.equal(mediaHeaders({ Connection: "close", Accept: "*/*" }), "Accept: */*\r\n");
  assert.equal(mediaUrl("http://127.0.0.1/admin"), "");
  assert.equal(mediaUrl("https://googlevideo.com.evil.test/file"), "");
  assert.throws(() => streamArgs({url:"file:///etc/passwd"}, "720p"), {code:"FORMAT_UNAVAILABLE"});
});

test("media probe rejects upstream 403 before returning a broken link", async () => {
  await assert.rejects(probeMedia({ url: "https://rr1.googlevideo.com/video" }, {
    fetcher: async (url, options) => {
      assert.equal(options.headers.Range, "bytes=0-0");
      return { ok: false, status: 403, body: { cancel: async () => {} } };
    }
  }), { code: "SOURCE_BUSY" });
});

test("cookie accounts rotate round-robin and a blocked account cools down", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "yt1s-pool-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let clock = 1000;
  const env = { YOUTUBE_COOKIES: cookie("one"), YOUTUBE_COOKIES_2: cookie("two") };
  const store = await createCookieStore(directory, env, () => clock);
  assert.equal(store.accounts, 2);
  const seen = [];
  for (let i = 0; i < 4; i++) {
    const jobDir = path.join(directory, `job${i}`);
    await (await import("node:fs/promises")).mkdir(jobDir);
    const file = await store.checkout(jobDir);
    seen.push((await readFile(file, "utf8")).includes("one") ? 1 : 2);
  }
  assert.deepEqual(seen, [1, 2, 1, 2]);
  const blockedDir = path.join(directory, "blocked");
  await (await import("node:fs/promises")).mkdir(blockedDir);
  const blocked = await store.checkout(blockedDir);
  store.markBlocked(blocked);
  assert.equal(store.healthy(), 1);
  clock += 31 * 60 * 1000;
  assert.equal(store.healthy(), 2);
});

test("repeated cookie failures escalate the cooldown and success resets it", async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), "yt1s-strikes-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let clock = 0;
  const store = await createCookieStore(directory, { YOUTUBE_COOKIES: cookie("one") }, () => clock);
  const { mkdir } = await import("node:fs/promises");
  const lease = async (name) => { const dir = path.join(directory, name); await mkdir(dir); return store.checkout(dir); };
  store.markBlocked(await lease("a"));
  clock += 31 * 60 * 1000;
  assert.equal(store.healthy(), 1);
  store.markBlocked(await lease("b"));
  clock += 31 * 60 * 1000;
  assert.equal(store.healthy(), 0, "second strike lasts about an hour");
  clock += 60 * 60 * 1000;
  assert.equal(store.healthy(), 1);
  const good = await lease("c");
  store.markBlocked(good);
  store.markGood(good);
  assert.equal(store.healthy(), 1);
});

test("WARP strategies run after cookies, carry the proxy to probe and stream, and bound the retries", async (t) => {
  const proxies = [];
  let probeProxy, streamProxy;
  const f = await fixture(t, {
    env: { YOUTUBE_COOKIES: cookie("initial"), WARP_PROXY: "http://127.0.0.1:40000" },
    warpCheck: async () => true,
    async run(command, args) {
      const i = args.indexOf("--proxy");
      proxies.push(i < 0 ? null : args[i + 1]);
      if (i < 0) throw new Error("Sign in to confirm you're not a bot");
      return { stdout: JSON.stringify({ title: "V", duration: 20, height: 360, availability: "public", url: "https://x.googlevideo.com/v", vcodec: "avc1", acodec: "mp4a" }) };
    },
    async probe(info, options) { probeProxy = options?.proxy; },
    async stream(req, res, info, quality, options) { streamProxy = options.proxy; res.end("media"); }
  });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "completed");
  assert.deepEqual(proxies, [null, null, "http://127.0.0.1:40000"]);
  assert.equal(probeProxy, "http://127.0.0.1:40000");
  assert.ok(streamArgs({ url: "https://x.googlevideo.com/v", vcodec: "avc1", acodec: "mp4a", http_headers: {} }, "360p", { proxy: "http://127.0.0.1:40000" }).includes("-http_proxy"));
  assert.ok(!streamArgs({ url: "https://x.googlevideo.com/v", vcodec: "avc1", acodec: "mp4a", http_headers: {} }, "360p").includes("-http_proxy"));
});

test("cookie strategies are skipped while every account cools down, and a fresh failure is not retried at once", async (t) => {
  let calls = 0;
  const f = await fixture(t, { env: { YOUTUBE_COOKIES: cookie("x") }, async run() { calls++; throw new Error("Requested format is not available"); } });
  const first = await f.finish((await f.start()).jobId);
  assert.equal(first.status, "failed");
  const before = calls;
  const again = await f.start();
  assert.equal(again.status, "failed");
  assert.equal(calls, before, "failed video must not be re-extracted inside the failure cache window");
});

test("a job where every WARP try is bot-blocked rotates the WARP identity once", async (t) => {
  let rotations = 0;
  const f = await fixture(t, {
    env: { WARP_PROXY: "http://127.0.0.1:40000" },
    warpCheck: async () => true,
    warpRotate: async () => { rotations++; },
    async run() { throw new Error("Sign in to confirm you're not a bot"); }
  });
  assert.equal((await f.finish((await f.start()).jobId)).status, "failed");
  assert.equal((await f.finish((await f.start("https://youtu.be/aaaaaaaaaaa")).jobId)).status, "failed");
  assert.equal(rotations, 1, "rotation is rate limited");
});

test("a worker that cannot extract hands the job to the fallback worker and mirrors its link", async (t) => {
  const remote = express();
  remote.use(express.json());
  remote.post("/download", (req, res) => res.status(202).json({ jobId: "remote-job-1", status: "queued" }));
  remote.get("/job/remote-job-1", (req, res) => res.json({ id: "remote-job-1", status: "completed", title: "T", actualQuality: "360p", downloadUrl: "https://fallback.example/stream/remote-job-1?token=x", expiresAt: "2030-01-01T00:00:00Z" }));
  const server = remote.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const f = await fixture(t, {
    env: { FALLBACK_WORKER_URL: `http://127.0.0.1:${server.address().port}` },
    async run() { throw new Error("Sign in to confirm you're not a bot"); }
  });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "completed");
  assert.equal(job.viaFallback, true);
  assert.match(job.downloadUrl, /fallback\.example\/stream/);
});

test("home worker registry needs the secret, accepts only tunnel URLs and expires", async (t) => {
  const f = await fixture(t, { env: { HOME_SECRET: "s3cret" } });
  const post = (body, token = "s3cret") => fetch(`${f.base}/home/register`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  assert.equal((await post({ url: "https://abc-def.trycloudflare.com" }, "wrong")).status, 401);
  assert.equal((await post({ url: "https://evil.example.com" })).status, 400);
  assert.equal((await post({ url: "https://abc-def.trycloudflare.com" })).status, 200);
  assert.deepEqual(await (await fetch(`${f.base}/home`)).json(), { url: "https://abc-def.trycloudflare.com" });
});

test("Apify is a paid last resort: used only with a token, mapped formats, daily budget enforced", async (t) => {
  assert.equal(apifyFormat("audio"), "mp3");
  assert.equal(apifyFormat("1080p"), "1080");
  const budget = createApifyBudget(2, () => new Date("2026-11-09T10:00:00Z"));
  assert.deepEqual([budget.take(), budget.take(), budget.take()], [true, true, false]);
  let body;
  const out = await apifyExtract({ token: "tok", videoId: "dQw4w9WgXcQ", quality: "720p", fetcher: async (url, options) => {
    body = JSON.parse(options.body);
    assert.equal(options.headers.Authorization, "Bearer tok");
    return { ok: true, json: async () => [{ title: "T", thumbnailUrl: "https://i.example/t.jpg", downloadUrl: "https://files.example/v.mp4", status: "ready" }] };
  } });
  assert.equal(body.format, "720");
  assert.equal(out.downloadUrl, "https://files.example/v.mp4");

  let calls = 0;
  const f = await fixture(t, {
    env: { APIFY_TOKEN: "tok", APIFY_DAILY_LIMIT: "1" },
    async run() { throw new Error("Sign in to confirm you're not a bot"); },
    async apify() { calls++; return { title: "T", downloadUrl: "https://files.example/v.mp4", actualQuality: "720p" }; }
  });
  const job = await f.finish((await f.start()).jobId);
  assert.equal(job.status, "completed");
  assert.equal(job.viaApify, true);
  const second = await f.finish((await f.start("https://youtu.be/aaaaaaaaaaa")).jobId);
  assert.equal(second.status, "failed");
  assert.equal(calls, 1);
});
