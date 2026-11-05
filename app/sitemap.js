import { allBlogSlugs, blogPosts } from "../lib/blog";
import { allToolSlugs, isIndexable, legalPages } from "../lib/tools";
import { siteUrl } from "../lib/seo";

export default function sitemap() {
  const base = siteUrl;
  const updated = new Date("2026-11-05");
  return [
    { url: base, lastModified: updated, changeFrequency: "weekly", priority: 1 },
    ...allToolSlugs().filter(isIndexable).map((slug) => ({
      url: `${base}/${slug}`,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 0.85
    })),
    ...Object.keys(legalPages).map((slug) => ({
      url: `${base}/${slug}`,
      changeFrequency: "monthly",
      priority: 0.45
    })),
    { url: `${base}/blog`, lastModified: updated, changeFrequency: "weekly", priority: 0.7 },
    ...allBlogSlugs().map((slug) => ({
      url: `${base}/blog/${slug}`,
      lastModified: new Date(blogPosts[slug].dateModified),
      changeFrequency: "monthly",
      priority: 0.75
    }))
  ];
}
