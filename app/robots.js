export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"]
      }
    ],
    sitemap: "https://yt1s.video/sitemap.xml",
    host: "https://yt1s.video"
  };
}
