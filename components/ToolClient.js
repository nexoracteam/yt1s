"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clipboard, Download, Eye, Film, ImageDown, Loader2, Music2, RotateCcw, ShieldCheck, Sparkles, X } from "lucide-react";
import { extractVideoId, thumbnailSet, timestampUrl, toTimestampSeconds } from "../lib/youtube";
import { DownloadError, safeDownloadMessage } from "../worker/download-errors";

function directDownloadUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    if (parsed.hostname === "yt1s-production.up.railway.app" && parsed.pathname.startsWith("/stream/")) return url;
    if (parsed.hostname !== "res.cloudinary.com") return "";
    return url.includes("/fl_attachment/") ? url : url.replace("/upload/", "/upload/fl_attachment/");
  } catch { return ""; }
}

const statusLabels = {
  queued: "Your download is in the queue…",
  checking: "Finding the best available format…",
  retrying: "Reconnecting automatically. Please keep this page open…",
  downloading: "Preparing your video…",
  uploading: "Finishing your download…",
  completed: "Your download link is ready. Streaming to your device.",
  failed: "Download couldn't be completed."
};

function CopyButton({ text, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1300);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-ink hover:border-flame hover:text-flame dark:border-white/10 dark:text-white"
    >
      <Clipboard className="h-4 w-4" /> {copied ? "Copied" : label}
    </button>
  );
}

function GeneratorResults({ tool, input }) {
  const topic = input.trim() || "your next YouTube video";
  let items = [];

  if (tool.title.includes("Title")) {
    items = [
      `I Tried ${topic} for 30 Days`,
      `How to Master ${topic} Without Wasting Time`,
      `The Truth About ${topic} Nobody Explains`,
      `7 ${topic} Tips I Wish I Knew Earlier`,
      `${topic}: Complete Beginner Guide`,
      `Stop Making These ${topic} Mistakes`,
      `Can ${topic} Really Change Your Results?`,
      `From Zero to Confident With ${topic}`,
      `The Simple ${topic} System That Works`,
      `Watch This Before You Start ${topic}`
    ];
  } else if (tool.title.includes("Description")) {
    items = [
      `In this video, we break down ${topic} with clear steps, practical examples, and mistakes to avoid.`,
      "What you will learn:\n00:00 Intro\n01:00 Main idea\n03:00 Step-by-step process\n06:00 Final tips",
      `Keywords: ${topic}, YouTube guide, creator tips, video strategy`,
      `Hashtags: #${topic.replace(/[^a-z0-9]/gi, "").slice(0, 24)} #YouTube #CreatorTools`
    ];
  } else if (tool.title.includes("Tag")) {
    items = [
      topic,
      `${topic} tutorial`,
      `${topic} guide`,
      `${topic} tips`,
      `how to ${topic}`,
      `${topic} for beginners`,
      `youtube ${topic}`,
      `best ${topic} strategy`,
      `${topic} explained`,
      `${topic} mistakes`
    ];
  } else {
    items = [
      `Hook: Open with the biggest promise or problem around ${topic}.`,
      "Setup: Explain who this is for and why it matters now.",
      "Main beats: Break the topic into 3-5 proof-driven sections.",
      "B-roll: Add visual examples every 8-12 seconds.",
      "CTA: Invite viewers to watch the next related video."
    ];
  }

  const output = items.join(tool.title.includes("Tag") ? ", " : "\n\n");
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black text-ink dark:text-white">Generated Output</h3>
        <CopyButton text={output} />
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} key={item} className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-gray-800 whitespace-pre-line dark:bg-zinc-800 dark:text-gray-100">{item}</motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ThumbnailResults({ input }) {
  const videoId = extractVideoId(input);
  if (!videoId) return null;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {thumbnailSet(videoId).map((thumb) => (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} key={thumb.url} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
          <img src={thumb.url} alt={thumb.label} className="aspect-video w-full bg-orange-50 object-cover" />
          <div className="p-4">
            <div className="font-black text-ink dark:text-white">{thumb.label}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{thumb.quality}</div>
            <div className="mt-4 flex gap-2">
              <a href={thumb.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-flame px-4 py-2 text-sm font-bold text-white"><Eye className="h-4 w-4" />Open</a>
              <a href={thumb.url} download className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-ink dark:border-white/10 dark:text-white"><ImageDown className="h-4 w-4" />Download</a>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function EngagementResults({ input }) {
  const [views = 0, likes = 0, comments = 0] = input.split(/[ ,]+/).map((value) => Number(value.replace(/,/g, "")) || 0);
  if (!views) return null;
  const rate = (((likes + comments) / views) * 100).toFixed(2);
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric label="Engagement Rate" value={`${rate}%`} />
      <Metric label="Like Rate" value={`${((likes / views) * 100).toFixed(2)}%`} />
      <Metric label="Comment Rate" value={`${((comments / views) * 100).toFixed(2)}%`} />
    </div>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:shadow-none"><div className="text-sm text-gray-500 dark:text-gray-400">{label}</div><div className="mt-2 text-3xl font-black text-ink dark:text-white">{value}</div></div>;
}

function TimestampResults({ input, time }) {
  const seconds = toTimestampSeconds(time);
  const url = timestampUrl(input, seconds);
  if (!url) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
      <div className="text-sm font-bold text-gray-500 dark:text-gray-400">Timestamp Link</div>
      <a href={url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-lg font-black text-flame">{url}</a>
      <div className="mt-4"><CopyButton text={url} /></div>
    </motion.div>
  );
}

function DownloadResults({ result, onFormat, busy }) {
  if (!result) return null;
  const watchUrl = result.videoId ? `https://www.youtube.com/watch?v=${result.videoId}` : "";
  const fileUrl = directDownloadUrl(result.downloadUrl || result.cloudinaryUrl);
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] border border-white/10 bg-[#15151d] p-6 shadow-2xl shadow-red-950/20">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {result.thumbnail && <img src={result.thumbnail} alt="Video thumbnail" className="aspect-video w-full rounded-2xl object-cover" />}
        <div>
          <h3 className="line-clamp-2 text-xl font-black text-white">{result.title || "Video result"}</h3>
          <p className="mt-2 text-sm text-gray-400">{result.note || (fileUrl ? "Your file is ready. If it hasn't started saving, use Download File below." : statusLabels[result.status] || "Video preview")}</p>
          {result.actualQuality && <p className="mt-2 text-sm font-bold text-red-300">{result.actualQuality === "audio" ? "M4A audio" : `${result.actualQuality} MP4`}{result.bytes ? ` · ${(result.bytes / 1024 / 1024).toFixed(1)} MB` : ""}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            {watchUrl && <a href={watchUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full text-sm font-black text-red-400"><Eye className="h-4 w-4" />Watch Preview</a>}
            {result.thumbnail && <a href={result.thumbnail} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-black text-white"><ImageDown className="h-4 w-4" />Open Thumbnail</a>}
            {fileUrl && <a href={fileUrl} download className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-pink-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-red-500/20"><Download className="h-4 w-4" />Download File</a>}
          </div>
        </div>
      </div>
      {onFormat && <div className="mt-6 border-t border-white/10 pt-5 text-left">
        <p className="mb-3 text-sm font-bold text-white">Video MP4 / Audio M4A</p>
        <p className="mb-4 text-xs text-gray-400">Live delivery to your device. No video file is stored on our server. Links expire after 10 minutes.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {["1080p", "720p", "480p", "360p", "audio"].map((value) => <div key={value} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <span className="text-sm font-bold text-gray-200">{value === "audio" ? "Audio M4A" : `Up to ${value} MP4`}</span>
            {result.quality === value && fileUrl ? <a href={fileUrl} download className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">Download</a> : <button type="button" disabled={busy} onClick={() => onFormat(value)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Get link</button>}
          </div>)}
        </div>
      </div>}
      {result.formats?.length > 0 && (
        <div className="mt-6 grid gap-3">
          {result.formats.map((format) => (
            <div key={`${format.itag || format.formatId}-${format.url || format.mimeType}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 p-4 dark:bg-zinc-800">
              <div>
                <div className="flex items-center gap-2 font-black text-ink dark:text-white">{format.hasVideo ? <Film className="h-4 w-4 text-flame" /> : <Music2 className="h-4 w-4 text-flame" />}{format.qualityLabel || format.audioQuality || format.quality || "Format"} {format.container ? `.${format.container}` : ""}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{format.hasVideo ? "video" : ""} {format.hasAudio ? "audio" : ""} {format.contentLength ? ` · ${(Number(format.contentLength) / 1024 / 1024).toFixed(1)} MB` : ""}</div>
              </div>
              {format.url && <a href={format.url} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white">Open Stream</a>}
            </div>
          ))}
        </div>
      )}
      {result.formats?.length === 0 && (
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-900 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-100">
          Preview and thumbnails are ready. Use the secure download processor below to create a downloadable file.
        </div>
      )}
    </motion.div>
  );
}

export default function ToolClient({ tool }) {
  const [input, setInput] = useState("");
  const [time, setTime] = useState("");
  const [quality, setQuality] = useState(tool.title.includes("MP3") ? "audio" : "720p");
  const [job, setJob] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadResult, setDownloadResult] = useState(null);
  const controllerRef = useRef(null);
  const [resumeId, setResumeId] = useState("");

  useEffect(() => () => controllerRef.current?.abort(), []);

  async function request(url, options, signal) {
    const response = await fetch(url, { ...options, signal, cache: "no-store" });
    const data = await response.json().catch(() => { throw new DownloadError("SERVICE_BUSY"); });
    if (!response.ok) {
      const error = new Error(safeDownloadMessage(data, "SERVICE_BUSY"));
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function poll(jobId, signal) {
    let failures = 0;
    for (let index = 0; index < 600; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      signal.throwIfAborted();
      try {
        const data = await request(`/api/worker-download?jobId=${encodeURIComponent(jobId)}`, {}, signal);
        if (!data.status) throw new DownloadError("SERVICE_BUSY");
        failures = 0;
        setJob(data);
        if (data.title || data.thumbnail || data.downloadUrl) setDownloadResult(data);
        if (["completed", "failed"].includes(data.status)) return data;
      } catch (error) {
        if (signal.aborted) throw error;
        if ([400, 404].includes(error.status)) { setResumeId(""); throw error; }
        failures += 1;
        if (failures >= 4) throw error;
      }
    }
    throw new DownloadError("TIMEOUT");
  }

  async function download(existingId = "", selectedQuality = quality) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setLoading(true);
    setError("");
    try {
      let start = { jobId: existingId };
      if (!existingId) {
        setResumeId("");
        start = await request("/api/worker-download", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input, quality: selectedQuality })
        }, controller.signal);
      }
      if (!start.jobId) throw new DownloadError("SERVICE_BUSY");
      setResumeId(start.jobId);
      setJob(start);
      const result = start.status === "completed" ? start : await poll(start.jobId, controller.signal);
      setResumeId("");
      if (result.status === "failed") throw new Error(safeDownloadMessage(result));
      setDownloadResult(result);
      setJob(result);
      const url = directDownloadUrl(result.downloadUrl);
      if (!url) throw new DownloadError("DELIVERY_UNAVAILABLE");
      const link = document.createElement("a");
      link.href = url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (!controller.signal.aborted) setError(safeDownloadMessage(error));
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    setError("");
    setJob(null);
    setDownloadResult(null);

    if (tool.mode === "download") {
      if (!extractVideoId(input)) { setError(safeDownloadMessage({ code: "INVALID_URL" })); return; }
      await download();
    } else if (tool.mode === "metadata") {
      setLoading(true);
      try {
        const response = await fetch("/api/info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: input, store: tool.mode === "download" })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Request failed");
        setDownloadResult(data);
      } catch {
        setError("Unable to preview this video right now. Please try another public video.");
      } finally {
        setLoading(false);
      }
    }
  }

  const isDownload = tool.mode === "download";

  return (
    <section className={isDownload ? "mx-auto max-w-5xl px-4 sm:px-6 lg:px-8" : "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"}>
      <form onSubmit={submit} className={isDownload ? "mx-auto rounded-[1.35rem] border border-white/15 bg-[#1c171b] p-2 shadow-2xl shadow-red-950/25 sm:flex sm:max-w-4xl" : "rounded-[2rem] border border-orange-100 bg-white p-3 shadow-2xl shadow-orange-100/80 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:flex"}>
        <input aria-label="YouTube video link" disabled={loading} value={input} onChange={(event) => setInput(event.target.value)} placeholder={tool.placeholder} className={isDownload ? "min-h-14 w-full min-w-0 flex-1 rounded-2xl bg-transparent px-5 text-sm font-semibold text-white outline-none placeholder:text-gray-500" : "min-h-14 flex-1 rounded-3xl bg-transparent px-5 text-ink outline-none placeholder:text-gray-400 dark:text-white"} required />
        {isDownload && <button type="button" disabled={loading} onClick={async () => { try { setInput(await navigator.clipboard.readText()); } catch { setError("Please paste the link into the input field."); } }} className="px-3 text-xs font-bold text-gray-300"><Clipboard className="mr-1 inline h-3 w-3" />Paste</button>}
        {input && isDownload && <button type="button" aria-label="Clear link" disabled={loading} onClick={() => { setInput(""); setDownloadResult(null); setJob(null); setError(""); setResumeId(""); }} className="px-2 text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>}
        {isDownload && (
          <select aria-label="Download quality" disabled={loading} value={quality} onChange={(event) => setQuality(event.target.value)} className="min-h-12 rounded-2xl border border-white/10 bg-white/10 px-4 text-sm font-black text-white outline-none sm:mx-2">
            <option className="bg-zinc-900" value="360p">360p</option>
            <option className="bg-zinc-900" value="480p">480p</option>
            <option className="bg-zinc-900" value="720p">720p HD</option>
            <option className="bg-zinc-900" value="1080p">1080p</option>
            <option className="bg-zinc-900" value="audio">Audio M4A</option>
          </select>
        )}
        {tool.mode === "timestamp" && <input value={time} onChange={(event) => setTime(event.target.value)} placeholder="Time, e.g. 1:23" className="min-h-14 rounded-3xl bg-transparent px-5 text-ink outline-none placeholder:text-gray-400 dark:text-white sm:w-44" required />}
        <button disabled={loading} className={isDownload ? "min-h-14 rounded-2xl bg-gradient-to-r from-red-500 to-pink-600 px-8 font-black text-white shadow-lg shadow-red-500/30 transition hover:scale-[1.02] disabled:opacity-70" : "min-h-14 rounded-3xl bg-gradient-to-r from-flame to-ember px-8 font-black text-white shadow-glow transition hover:scale-[1.02] disabled:opacity-60"}>
          {loading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Processing...</span> : <span className="inline-flex items-center gap-2">{isDownload ? <Download className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{isDownload ? "Download Now" : tool.action}</span>}
        </button>
      </form>
      <p className={isDownload ? "mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400" : "mt-3 text-center text-xs font-bold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400"}>{isDownload && <ShieldCheck className="h-4 w-4 text-emerald-500" />}{isDownload ? "Stream to your device · No video storage · No upload wait" : "Fast preview · Simple creator tools"}</p>
      {job && isDownload && <div role="status" aria-live="polite" className="mx-auto mt-6 max-w-4xl rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200"><span className="inline-flex items-center gap-2">{job.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : job.status === "failed" || error ? <AlertCircle className="h-4 w-4 text-amber-500" /> : <Loader2 className="h-4 w-4 animate-spin text-red-400" />}{error ? "Download paused. You can retry below." : statusLabels[job.status] || "Checking your download…"}</span>{job.status === "downloading" && Number.isFinite(job.progress) && <div className="mt-3"><progress aria-label="Download progress" value={job.progress} max="100" className="h-2 w-full accent-red-500" /><span>{job.progress}%</span></div>}</div>}
      {error && <div role="alert" className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-900"><p>{error}</p>{isDownload && <button type="button" disabled={loading} onClick={resumeId ? () => download(resumeId) : submit} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><RotateCcw className="h-4 w-4" />{resumeId ? "Check download status" : "Try again"}</button>}</div>}
      <div className="mt-10">
        {submitted && tool.mode === "thumbnail" && <ThumbnailResults input={input} />}
        {submitted && tool.mode === "generator" && <GeneratorResults tool={tool} input={input} />}
        {submitted && tool.mode === "calculator" && <EngagementResults input={input} />}
        {submitted && tool.mode === "timestamp" && <TimestampResults input={input} time={time} />}
        <DownloadResults result={downloadResult} busy={loading} onFormat={isDownload ? (value) => { setQuality(value); void download("", value); } : undefined} />
      </div>
    </section>
  );
}
