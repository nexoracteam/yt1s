import { brand, defaultFaqs, defaultHowToSteps, seoKeywords, toolCategories, tools } from "./tools";

export const siteUrl = "https://yt1s.video";

export function absoluteUrl(path = "") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`.replace(/\/$/, "") || siteUrl;
}

export function titleFor(pageTitle) {
  return pageTitle ? `${pageTitle} | ${brand.name}` : "YT1s YouTube Downloader - MP4, Audio, Shorts & HD | yt1s.video";
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
    "@id": `${absoluteUrl(slug)}#tool`,
    name: tool.title,
    url: absoluteUrl(slug),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    description: tool.summary,
    inLanguage: "en",
    keywords: [...seoKeywords, ...(tool.formats || [])].join(", "),
    publisher: { "@type": "Organization", name: brand.name, url: siteUrl },
    potentialAction: { "@type": "UseAction", target: absoluteUrl(slug) },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }
  };
}

export function faqSchema(faqs = defaultFaqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } }))
  };
}

export function toolFaqSchema(tool) {
  return faqSchema(tool?.faqs || defaultFaqs);
}

export function howToSchema(slug, tool) {
  const steps = tool?.steps || defaultHowToSteps;
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${absoluteUrl(slug)}#howto`,
    name: `How to use ${tool.title}`,
    description: tool.summary,
    inLanguage: "en",
    totalTime: "PT1M",
    tool: [{ "@type": "HowToTool", name: brand.name }],
    step: steps.map(([, name, text], index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name,
      text
    }))
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(({ name, url }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url
    }))
  };
}

export function toolBreadcrumbSchema(slug, tool) {
  const category = toolCategories.find((entry) => entry.tools.includes(slug));
  return breadcrumbSchema([
    { name: "Home", url: siteUrl },
    { name: category?.title || "Tools", url: absoluteUrl(category?.href || "/youtube-video-downloader") },
    { name: tool.title, url: absoluteUrl(slug) }
  ]);
}

export function toolsItemListSchema() {
  const entries = Object.entries(tools);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: entries.length,
    itemListElement: entries.map(([slug, tool], index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(slug),
      name: tool.title
    }))
  };
}
