import { NextResponse } from "next/server";
import { isYouTubeInput } from "../../../lib/youtube";

export const runtime = "nodejs";
export const maxDuration = 30;

function workerHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (process.env.WORKER_SECRET) headers.Authorization = `Bearer ${process.env.WORKER_SECRET}`;
  return headers;
}

function getWorkerUrl() {
  return (process.env.DOWNLOAD_WORKER_URL || "https://yt1s-production.up.railway.app").replace(/\/$/, "");
}

export async function POST(req) {
  try {
    const { url, quality = "720p" } = await req.json();
    const workerUrl = getWorkerUrl();

    if (!url || !isYouTubeInput(url)) return NextResponse.json({ error: "Valid YouTube URL is required." }, { status: 400 });

    const response = await fetch(`${workerUrl}/download`, {
      method: "POST",
      headers: workerHeaders(),
      body: JSON.stringify({ url, quality })
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Worker request failed." }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const workerUrl = getWorkerUrl();
    const jobId = new URL(req.url).searchParams.get("jobId");

    if (!jobId) return NextResponse.json({ error: "jobId is required." }, { status: 400 });

    const response = await fetch(`${workerUrl}/job/${encodeURIComponent(jobId)}`, {
      headers: workerHeaders(),
      cache: "no-store"
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Worker status request failed." }, { status: 500 });
  }
}
