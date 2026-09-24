import { brand } from "../../../lib/tools";
import { siteUrl } from "../../../lib/seo";

export function GET() {
  return new Response(`Contact: mailto:${brand.email}
Preferred-Languages: en
Canonical: ${siteUrl}/.well-known/security.txt
Policy: ${siteUrl}/terms
`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
