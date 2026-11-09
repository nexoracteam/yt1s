import express from "express";
import { nanoid } from "nanoid";
import { DownloadError } from "./download-errors.js";
import { streamHeaders } from "./stream-download.js";

// Lets a worker on a home connection serve downloads without any inbound route (no tunnel, no port forwarding).
// The home agent only makes outbound HTTPS calls to this server: it long-polls for tasks, returns extraction
// results, and uploads finished media, which this server pipes straight to the visitor.
export function createAgentRelay({ secret, now = () => Date.now(), pollMs = 25000, extractTimeoutMs = 60000, uploadWaitMs = 30000 } = {}) {
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

      app.post("/agent/upload/:streamId", (req, res) => {
        if (!authed(req)) return res.status(401).end();
        const pending = streams.get(req.params.streamId);
        if (!pending) return res.status(404).end();
        streams.delete(req.params.streamId);
        clearTimeout(pending.timer);
        const out = pending.res;
        out.status(200).set(streamHeaders(pending.info, pending.quality));
        // If the agent aborts mid-file the visitor's download must fail rather than look complete.
        req.on("aborted", () => out.destroy());
        req.on("error", () => out.destroy());
        out.on("close", () => { req.unpipe(out); if (!req.complete) req.destroy(); pending.resolve(); });
        req.on("end", () => { out.end(); res.json({ ok: true }); });
        req.pipe(out, { end: false });
      });
    }
  };
}
