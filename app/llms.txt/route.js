import { allBlogSlugs, blogPosts } from "../../lib/blog";
import { allToolSlugs, brand, legalPages, tools } from "../../lib/tools";
import { siteUrl } from "../../lib/seo";

export function GET() {
  const toolLines = allToolSlugs().map((slug) => `- ${tools[slug].title}: ${siteUrl}/${slug} - ${tools[slug].summary}`);
  const legalLines = Object.keys(legalPages).map((slug) => `- ${legalPages[slug].title}: ${siteUrl}/${slug}`);
  const blogLines = allBlogSlugs().map((slug) => `- ${blogPosts[slug].title}: ${siteUrl}/blog/${slug} - ${blogPosts[slug].description}`);
  return new Response(`# ${brand.name}

> Fast YouTube tools for public videos, Shorts, thumbnails, metadata and creator workflows.

Canonical site: ${siteUrl}
Contact: ${brand.email}

Important pages:
${toolLines.join("\n")}

Legal pages:
${legalLines.join("\n")}

Blog posts:
${blogLines.join("\n")}

Usage policy: only process content you own, have permission to use, or are legally allowed to access.
Cookie and ads policy: ${siteUrl}/cookie-policy
`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
