export default function manifest() {
  return {
    name: "yt1s.video - YouTube Video Downloader",
    short_name: "yt1s.video",
    description: "yt1s.video is a fast yt1s YouTube video downloader, Shorts downloader, audio and creator tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7ed",
    theme_color: "#ff3b30",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" }
    ]
  };
}
