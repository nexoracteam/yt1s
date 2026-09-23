import { allToolSlugs, legalPages } from "../lib/tools";

export default function sitemap() {
  const base = "https://yt1s.video";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    ...allToolSlugs().map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85
    })),
    ...Object.keys(legalPages).map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.45
    }))
  ];
}
