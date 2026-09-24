import { allToolSlugs, brand, legalPages, tools } from "../../lib/tools";
import { siteUrl } from "../../lib/seo";

export function GET() {
  const toolLines = allToolSlugs().map((slug) => `- ${tools[slug].title}: ${siteUrl}/${slug} - ${tools[slug].summary}`);
  const legalLines = Object.keys(legalPages).map((slug) => `- ${legalPages[slug].title}: ${siteUrl}/${slug}`);
  return new Response(`# ${brand.name}

> Fast YouTube tools for public videos, Shorts, thumbnails, metadata and creator workflows.

Canonical site: ${siteUrl}
Contact: ${brand.email}

Important pages:
${toolLines.join("\n")}

Legal pages:
${legalLines.join("\n")}

Usage policy: only process content you own, have permission to use, or are legally allowed to access.
`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
