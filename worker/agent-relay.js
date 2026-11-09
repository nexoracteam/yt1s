import express from "express";
import { nanoid } from "nanoid";
import { DownloadError } from "./download-errors.js";
import { streamHeaders } from "./stream-download.js";

// Lets a worker on a home connection serve downloads without any inbound route (no tunnel, no port forwarding).
// The home agent only makes outbound HTTPS calls to this server: it long-polls for tasks, returns extraction
// results, and uploads finished media, which this server pipes straight to the visitor.
export function createAgentRelay({ secret, now = () => Date.now(), pollMs = 25000, extractTimeoutMs = 60000, uploadWaitMs = 45000, drainWaitMs = 15000 } = {}) {
  let lastPoll = 0;
  let waiter = null;
  const tasks = [];
  const extractions = new Map();
  const streams = new Map();
  const authed = (req) => Boolean(secret) && req.headers.authorization === `Bearer ${secret}`;

  function push(task) {
    if (waiter) { clearTimeout(waiter.timer); const { res } = waiter; waiter = null; res.json(task); }
    else tasks.push(task);
  }

  return {
    // The agent polls at least every pollMs, so a recent poll means it is available.
    online: () => Boolean(secret) && now() - lastPoll < pollMs + 10000,

    extract({ jobId, videoId, quality }) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => { extractions.delete(jobId); reject(new DownloadError("SOURCE_BUSY")); }, extractTimeoutMs);
        extractions.set(jobId, { resolve, reject, timer });
        push({ type: "extract", jobId, videoId, quality });
      });
    },

    stream(req, res, { info, quality }) {
      return new Promise((resolve) => {
        const streamId = nanoid(16);
        const timer = setTimeout(() => {
          streams.delete(streamId);
          if (!res.headersSent) res.status(502).type("text/plain").send("This download link could not be opened. Return to the tool and generate a fresh link.");
          resolve();
        }, uploadWaitMs);
        streams.set(streamId, { res, timer, info, quality, resolve });
        res.once("close", () => { clearTimeout(timer); streams.delete(streamId); resolve(); });
        push({ type: "stream", streamId, info, quality });
      });
    },

    register(app) {
      app.get("/agent/next", (req, res) => {
        if (!authed(req)) return res.status(401).end();
        lastPoll = now();
        if (waiter) { clearTimeout(waiter.timer); waiter.res.status(204).end(); waiter = null; }
        if (tasks.length) return res.json(tasks.shift());
        const mine = { res, timer: setTimeout(() => { if (waiter === mine) waiter = null; res.status(204).end(); }, pollMs) };
        waiter = mine;
        req.on("close", () => { if (waiter === mine) { clearTimeout(mine.timer); waiter = null; } });
      });

      app.post("/agent/result/:jobId", express.json({ limit: "2mb" }), (req, res) => {
        if (!authed(req)) return res.status(401).end();
        const pending = extractions.get(req.params.jobId);
        if (!pending) return res.status(404).end();
        extractions.delete(req.params.jobId);
        clearTimeout(pending.timer);
        if (req.body?.ok && req.body.info) pending.resolve(req.body.info);
        else pending.reject(new DownloadError(typeof req.body?.code === "string" ? req.body.code : "SOURCE_BUSY"));
        res.json({ ok: true });
      });

      // Media arrives as many short POSTs instead of one long upload: Heroku's router drops a single
      // request that runs ~90s (H28), and short requests also give the agent backpressure.
      app.post("/agent/chunk/:streamId", express.raw({ type: () => true, limit: "16mb" }), (req, res) => {
        if (!authed(req)) return res.status(401).end();
        const pending = streams.get(req.params.streamId);
        if (!pending) return res.status(404).end();
        const out = pending.res;
        clearTimeout(pending.timer);
        const finishStream = () => { streams.delete(req.params.streamId); clearTimeout(pending.idle); pending.resolve(); };
        if (req.query.abort === "1") { out.destroy(); finishStream(); return res.json({ ok: true }); }
        if (!out.headersSent) out.status(200).set(streamHeaders(pending.info, pending.quality));
        clearTimeout(pending.idle);
        pending.idle = setTimeout(() => { out.destroy(); finishStream(); }, 120000);
        pending.idle.unref?.();
        const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
        // Answer within seconds even when the visitor's connection is slow: Heroku's router kills a request that is
        // still unanswered after 30s (H12) and the whole download would fail. A late "slow" ack tells the agent to
        // ease off instead.
        let replied = false;
        const done = (slow = false) => {
          if (replied) return;
          replied = true;
          if (req.query.end === "1") { out.end(); finishStream(); }
          res.json({ ok: true, slow });
        };
        if (body.length && !out.write(body)) {
          const wait = setTimeout(() => done(true), drainWaitMs);
          out.once("drain", () => { clearTimeout(wait); done(false); });
          out.once("close", () => { clearTimeout(wait); done(true); });
        } else done(false);
      });
    }
  };
}
