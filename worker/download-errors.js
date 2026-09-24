// Shared with the frontend. Never display subprocess/provider errors.
export const DOWNLOAD_ERRORS = {
  INVALID_URL: "Please enter a valid YouTube video link.",
  INVALID_QUALITY: "Please choose one of the available download formats.",
  VIDEO_UNAVAILABLE: "This video is private, removed, or unavailable for download. Please try another public video.",
  LIVE_VIDEO: "Live streams can be downloaded after the broadcast has ended.",
  DURATION_LIMIT: "This video is too long. Please choose a shorter video.",
  FILE_LIMIT: "This file is too large. Please choose a lower quality or a shorter video.",
  FORMAT_UNAVAILABLE: "That quality is not available for this video. Please try another format.",
  SOURCE_BUSY: "We couldn't prepare this video right now. Please try again in a moment or use another public video.",
  TIMEOUT: "This download is taking longer than expected. Please try again or choose a lower quality.",
  SERVICE_BUSY: "The download service is busy. Please try again in a moment.",
  JOB_EXPIRED: "This download session has expired. Please start the download again.",
  DELIVERY_UNAVAILABLE: "We couldn't finish preparing your file. Please try again in a moment.",
  DOWNLOAD_FAILED: "We couldn't complete this download. Please try again or use another public video."
};

const retryableCodes = new Set(["SOURCE_BUSY", "TIMEOUT", "SERVICE_BUSY", "DELIVERY_UNAVAILABLE", "DOWNLOAD_FAILED"]);

export class DownloadError extends Error {
  constructor(code) {
    super(DOWNLOAD_ERRORS[code] || DOWNLOAD_ERRORS.DOWNLOAD_FAILED);
    this.code = code;
  }
}

export function failureCode(error) {
  if (Object.hasOwn(DOWNLOAD_ERRORS, error?.code)) return error.code;
  const message = String(error?.message || "");
  if (/not a bot|too many requests|HTTP Error (403|429|5\d\d)|cookies.*(expired|invalid)|sign in to confirm|PO Token/i.test(message)) return "SOURCE_BUSY";
  if (/private video|video unavailable|has been removed|not available in your country|members.only|age.restricted|confirm your age|login required|premium.only/i.test(message)) return "VIDEO_UNAVAILABLE";
  if (/requested format.*not available|no video formats/i.test(message)) return "FORMAT_UNAVAILABLE";
  if (/timed? ?out|timeout|ETIMEDOUT/i.test(message)) return "TIMEOUT";
  if (/max.filesize|larger than max|file.*too large/i.test(message)) return "FILE_LIMIT";
  return "DOWNLOAD_FAILED";
}

export function publicFailure(error) {
  const code = failureCode(error);
  return { code, error: DOWNLOAD_ERRORS[code], retryable: retryableCodes.has(code) };
}

export function safeDownloadMessage(data, fallback = "DOWNLOAD_FAILED") {
  if (data?.code && Object.hasOwn(DOWNLOAD_ERRORS, data.code)) return DOWNLOAD_ERRORS[data.code];
  const message = data?.error || data?.message;
  return Object.values(DOWNLOAD_ERRORS).includes(message) ? message : DOWNLOAD_ERRORS[fallback];
}
