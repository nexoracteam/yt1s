import { v2 as cloudinary } from "cloudinary";

export function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
  );
}

export function configureCloudinary() {
  if (!hasCloudinaryConfig()) return false;
  if (process.env.CLOUDINARY_URL) return true;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  return true;
}

export async function uploadRemoteMedia(url, publicId) {
  configureCloudinary();
  return cloudinary.uploader.upload(url, {
    resource_type: "video",
    folder: "yt1s-video",
    public_id: publicId,
    overwrite: true,
    use_filename: false
  });
}
