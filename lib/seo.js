import { brand, seoKeywords, tools } from "./tools";

export const siteUrl = "https://yt1s.video";

export function absoluteUrl(path = "") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || siteUrl;
}

export function titleFor(pageTitle) {
  return pageTitle ? `${pageTitle} | ${brand.name}` : "YouTube Video Downloader - HD, Shorts, 4K & Audio | yt1s.video";
}

export function descriptionFor(text) {
  return text || "Use yt1s.video as a fast YouTube video downloader, short downloader, full HD video downloader and 4K video downloader for public videos, Shorts and audio links.";
}

export function baseOpenGraph(path = "/") {
  return {
    url: absoluteUrl(path),
    siteName: brand.name,
    type: "website"
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: siteUrl,
    email: brand.email,
    contactPoint: [{ "@type": "ContactPoint", email: brand.email, contactType: "customer support" }]
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: siteUrl,
    description: brand.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/youtube-video-downloader?url={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function toolSchema(slug, tool) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    url: absoluteUrl(slug),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    description: tool.summary,
    keywords: [...seoKeywords, ...(tool.formats || [])].join(", "),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ["Is yt1s.video free to use?", "Yes. yt1s.video provides free tools for public videos, Shorts, thumbnails and creator workflows."],
      ["Can I use it as a full HD video downloader?", "Supported public videos can be prepared in 360p, 480p, 720p and 1080p depending on source availability."],
      ["Does yt1s.video store downloaded videos?", "The current download flow streams prepared media to the user device and does not keep completed video files on local server disk."],
      ["What content can I download?", "Only process content you own, have permission to use, or are legally allowed to access."]
    ].map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } }))
  };
}

export function toolsItemListSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: Object.entries(tools).slice(0, 12).map(([slug, tool], index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(slug),
      name: tool.title
    }))
  };
}
