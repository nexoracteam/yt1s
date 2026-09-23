import { NextResponse } from "next/server";
import { isYouTubeInput } from "../../../lib/youtube";

export const runtime = "nodejs";
export const maxDuration = 30;

function workerHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (process.env.WORKER_SECRET) headers.Authorization = `Bearer ${process.env.WORKER_SECRET}`;
  return headers;
}

export async function POST(req) {
  try {
    const { url, quality = "720p" } = await req.json();
    const workerUrl = process.env.DOWNLOAD_WORKER_URL;

    if (!workerUrl) return NextResponse.json({ error: "DOWNLOAD_WORKER_URL is not configured." }, { status: 500 });
    if (!url || !isYouTubeInput(url)) return NextResponse.json({ error: "Valid YouTube URL is required." }, { status: 400 });

    const response = await fetch(`${workerUrl.replace(/\/$/, "")}/download`, {
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
    const workerUrl = process.env.DOWNLOAD_WORKER_URL;
    const jobId = new URL(req.url).searchParams.get("jobId");

    if (!workerUrl) return NextResponse.json({ error: "DOWNLOAD_WORKER_URL is not configured." }, { status: 500 });
    if (!jobId) return NextResponse.json({ error: "jobId is required." }, { status: 400 });

    const response = await fetch(`${workerUrl.replace(/\/$/, "")}/job/${encodeURIComponent(jobId)}`, {
      headers: workerHeaders(),
      cache: "no-store"
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Worker status request failed." }, { status: 500 });
  }
}
