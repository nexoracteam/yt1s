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
    const info = await ytdl.getInfo(watchUrl, { requestOptions: { maxRedirects: 5 } });
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
