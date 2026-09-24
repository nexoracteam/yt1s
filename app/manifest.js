export default function manifest() {
  return {
    name: "yt1s.video - YouTube Video Downloader",
    short_name: "yt1s.video",
    description: "Fast YouTube video downloader, Shorts downloader, audio and creator tools.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff7ed",
    theme_color: "#ff3b30",
    icons: [
      { src: "/icon.svg", sizes: "64x64", type: "image/svg+xml" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml" }
    ]
  };
}
