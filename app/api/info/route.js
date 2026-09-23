import ytdl from "@distube/ytdl-core";
import { NextResponse } from "next/server";
import { hasCloudinaryConfig, uploadRemoteMedia } from "../../../lib/cloudinary";
import { extractVideoId, isYouTubeInput, thumbnailSet } from "../../../lib/youtube";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_CLOUDINARY_REMOTE_BYTES = 45 * 1024 * 1024;

function publicFormat(format) {
  return {
    itag: format.itag,
    quality: format.quality,
    qualityLabel: format.qualityLabel,
    audioQuality: format.audioQuality,
    container: format.container,
    mimeType: format.mimeType,
    hasAudio: format.hasAudio,
    hasVideo: format.hasVideo,
    contentLength: format.contentLength,
    url: format.url
  };
}

function selectCloudinaryCandidate(formats) {
  return formats
    .filter((format) => format.url && format.hasAudio && Number(format.contentLength || 0) > 0)
    .filter((format) => Number(format.contentLength) <= MAX_CLOUDINARY_REMOTE_BYTES)
    .sort((a, b) => Number(b.contentLength || 0) - Number(a.contentLength || 0))[0];
}

async function fetchOembedFallback(videoId) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`, {
    headers: {
      "User-Agent": "Mozilla/5.0 yt1s.video metadata fallback"
    },
    next: { revalidate: 3600 }
  });

  if (!response.ok) throw new Error("YouTube metadata fallback failed.");
  return response.json();
}

function fallbackResponse(videoId, fallback, reason) {
  const thumbs = thumbnailSet(videoId);
  return NextResponse.json({
    videoId,
    title: fallback?.title || "YouTube video",
    author: fallback?.author_name || "YouTube creator",
    duration: 0,
    thumbnail: fallback?.thumbnail_url || thumbs[0].url,
    thumbnails: thumbs,
    formats: [],
    cloudinaryUrl: "",
    cloudinaryStatus: hasCloudinaryConfig() ? "configured" : "missing-config",
    limited: true,
    note:
      "YouTube blocked direct stream extraction from this serverless request, so yt1s.video loaded public metadata and thumbnails only. Try a different public video or use thumbnail tools; full video extraction may require cookies/proxy or a dedicated worker."
  }, { status: 200, headers: { "x-yt1s-fallback-reason": String(reason || "blocked") } });
}

export async function POST(req) {
  try {
    const { url, store = false } = await req.json();

    if (!url || !isYouTubeInput(url)) {
      return NextResponse.json({ error: "Please enter a valid YouTube URL or video ID." }, { status: 400 });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Could not find a YouTube video ID in that input." }, { status: 400 });
    }

    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    let info;
    try {
      info = await ytdl.getInfo(watchUrl, {
        requestOptions: {
          maxRedirects: 5,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
          }
        }
      });
    } catch (error) {
      const fallback = await fetchOembedFallback(videoId);
      return fallbackResponse(videoId, fallback, error.message);
    }
    const details = info.videoDetails;
    const formats = info.formats
      .filter((format) => format.url && (format.hasVideo || format.hasAudio))
      .map(publicFormat)
      .slice(0, 24);

    let cloudinaryUrl = "";
    let cloudinaryStatus = hasCloudinaryConfig() ? "configured" : "missing-config";
    const candidate = selectCloudinaryCandidate(info.formats);

    if (store && candidate && hasCloudinaryConfig()) {
      try {
        const upload = await uploadRemoteMedia(candidate.url, `${videoId}-${candidate.itag}`);
        cloudinaryUrl = upload.secure_url;
        cloudinaryStatus = "uploaded";
      } catch (error) {
        cloudinaryStatus = `upload-failed: ${error.message}`;
      }
    }

    return NextResponse.json({
      videoId,
      title: details.title,
      author: details.author?.name,
      duration: Number(details.lengthSeconds || 0),
      thumbnail: details.thumbnails?.at(-1)?.url || thumbnailSet(videoId)[0].url,
      thumbnails: thumbnailSet(videoId),
      formats,
      cloudinaryUrl,
      cloudinaryStatus,
      note: cloudinaryUrl
        ? "Stored on Cloudinary and ready for download."
        : "Direct formats are shown below. Cloudinary upload only runs when credentials exist and the file is small enough for Vercel limits."
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Unable to fetch this video right now. ${error.message || "Try another public video."}` },
      { status: 500 }
    );
  }
}
