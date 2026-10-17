import { absoluteUrl } from "./seo";

export const blogPosts = {
  "yt1s-search-terms-guide": {
    slug: "yt1s-search-terms-guide",
    title: "How to Download YouTube Videos and Audio with YT1s",
    description: "Choose MP4 or M4A, understand the 1080p limit, and troubleshoot expired links or unavailable videos on yt1s.video.",
    datePublished: "2026-09-24",
    dateModified: "2026-10-17",
    author: "yt1s.video Team",
    keywords: ["YouTube download help", "MP4", "M4A"],
    readingTime: "3 min read",
    intro: [
      "Use yt1s.video to prepare supported public YouTube videos and Shorts for download. You can save video as MP4 or audio as M4A. Only download content you own, have permission to use, or are legally allowed to access.",
      "This guide explains the available formats and what to do when a download fails. The service does not currently create MP3 or 4K files."
    ],
    relatedTools: [
      { href: "/youtube-to-mp4", label: "Download MP4 video" },
      { href: "/youtube-audio-downloader", label: "Download M4A audio" },
      { href: "/youtube-shorts-downloader", label: "Download Shorts" }
    ],
    sections: [
      {
        heading: "Choose MP4 for video or M4A for audio",
        paragraphs: [
          "MP4 includes video and audio. Choose 360p or 480p for a smaller file, 720p for HD, or 1080p for the highest selectable resolution. A lower-resolution source cannot gain detail by selecting a higher setting.",
          "Select Audio M4A if you only need sound. M4A is not MP3. If your player requires MP3, convert the saved audio with a separate audio converter; changing the filename extension will not convert it."
        ],
        links: [{ href: "/youtube-audio-downloader", label: "Open the audio downloader" }]
      },
      {
        heading: "Prepare and save your download",
        paragraphs: [
          "Copy the video's YouTube link, paste it into the downloader, choose a format and select Download. Wait for preparation to finish, then use the download link to save the file.",
          "Prepared links expire. If a link no longer works, return to the downloader and prepare the original video again. On mobile, look in your browser's downloads list or your device's Files app."
        ],
        links: [{ href: "/", label: "Open the downloader" }]
      },
      {
        heading: "Why a video may be unavailable",
        paragraphs: [
          "Private, deleted, live and region-restricted videos may not be supported. A public video can also fail when the source temporarily refuses requests. Check the original video and try again later if it remains available.",
          "Current service limits are 30 minutes and 500 MB. If a selected format fails, try a lower quality. A video recorded in 4K can only be delivered at a supported resolution up to 1080p here."
        ],
        links: [{ href: "/contact", label: "Contact support" }]
      }
    ],
    faqs: [
      ["Does YT1s create MP3 files?", "No. The audio option delivers M4A files."],
      ["Can I save 4K video?", "No. The maximum selectable resolution is 1080p, depending on the source."],
      ["Why has my download link stopped working?", "Links are temporary. Prepare the original video again to generate a new link."],
      ["Can I download a whole playlist?", "No. Use an individual video or Shorts URL."]
    ],
    conclusion: ["Choose the format your device supports, save the file before its link expires, and check that you have permission before reusing any downloaded content."]
  }
};

export function allBlogSlugs() { return Object.keys(blogPosts); }
export function getBlogPost(slug) { return blogPosts[slug]; }
export function blogPostUrl(post) { return absoluteUrl(`/blog/${post.slug}`); }

export function blogPostSchema(post) {
  return {
    "@context": "https://schema.org", "@type": "BlogPosting",
    headline: post.title, description: post.description,
    datePublished: post.datePublished, dateModified: post.dateModified,
    author: { "@type": "Organization", name: post.author, url: absoluteUrl("/") },
    publisher: { "@type": "Organization", name: "yt1s.video", url: absoluteUrl("/") },
    mainEntityOfPage: { "@type": "WebPage", "@id": blogPostUrl(post) },
    articleSection: "YouTube download help"
  };
}

export function blogFaqSchema(post) {
  return {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: post.faqs.map(([name, text]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text } }))
  };
}

export function blogBreadcrumbSchema(post) {
  return {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: blogPostUrl(post) }
    ]
  };
}
