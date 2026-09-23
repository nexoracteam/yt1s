import { NextResponse } from "next/server";
import { hasCloudinaryConfig } from "../../../lib/cloudinary";

export function GET() {
  return NextResponse.json({
    ok: true,
    app: "yt1s.video",
    cloudinary: hasCloudinaryConfig() ? "configured" : "missing-config"
  });
}
