export const brand = {
  name: "yt1s.video",
  url: "https://yt1s.video",
  email: "info@yt1s.video",
  tagline: "Fast YouTube tools for creators, editors, and students",
  description:
    "A fast yt downloader for public YouTube videos, Shorts, HD MP4, 4K-ready links, thumbnails, audio, metadata, and creator utilities."
};

export const peopleAlsoSearchKeywords = [
  "YT1s org download",
  "YT1s AI",
  "YT1s audio",
  "YT1s click",
  "Yts1 MP4 converter",
  "Yst1 download",
  "YT15",
  "Yt1 music"
];

export const seoKeywords = [
  "video downloader",
  "short downloader",
  "full hd video downloader",
  "4k video downloader",
  "yt downloader",
  "yt short downloader",
  "yt video downloader",
  "youtube video downloader",
  "youtube video downloader no ads",
  ...peopleAlsoSearchKeywords
];

export const toolCategories = [
  {
    title: "Downloaders",
    href: "/youtube-video-downloader",
    tools: [
      "youtube-video-downloader",
      "youtube-shorts-downloader",
      "youtube-to-mp3",
      "youtube-thumbnail-downloader",
      "youtube-shorts-thumbnail-downloader",
      "youtube-profile-downloader",
      "youtube-banner-downloader"
    ]
  },
  {
    title: "SEO & Metadata",
    href: "/youtube-tag-extractor",
    tools: [
      "youtube-title-generator",
      "youtube-description-generator",
      "youtube-tag-generator",
      "youtube-tag-extractor",
      "youtube-description-extractor"
    ]
  },
  {
    title: "Creator Tools",
    href: "/youtube-transcript-generator",
    tools: [
      "youtube-video-summary",
      "youtube-transcript-generator",
      "youtube-subtitle-downloader",
      "youtube-script-generator"
    ]
  },
  {
    title: "Analytics",
    href: "/youtube-channel-id-finder",
    tools: [
      "youtube-monetization-checker",
      "youtube-channel-id-finder",
      "youtube-playlist-length-calculator",
      "youtube-engagement-calculator",
      "youtube-timestamp-link-generator"
    ]
  }
];

export const tools = {
  "youtube-video-downloader": {
    title: "YouTube Video Downloader",
    badge: "Free Tool",
    action: "Download Now",
    placeholder: "Paste a YouTube URL or video ID...",
    mode: "download",
    summary: "Use this YouTube video downloader to prepare public videos, Shorts, HD MP4 and audio links with a clean no-clutter workflow.",
    features: ["Video downloader for public links", "Full HD video downloader options", "Direct stream delivery", "Mobile-friendly no-clutter UI"],
    formats: ["360p", "480p", "720p", "1080p", "Audio M4A", "MP4"]
  },
  "youtube-shorts-downloader": {
    title: "YouTube Shorts Downloader",
    badge: "Free Tool",
    action: "Get Shorts Links",
    placeholder: "Paste a YouTube Shorts URL...",
    mode: "download",
    summary: "A fast short downloader and yt short downloader for public YouTube Shorts with mobile-ready MP4 and audio options.",
    features: ["Shorts URL support", "YT short downloader workflow", "Fast metadata fetch", "Direct stream options"],
    formats: ["Shorts MP4", "720p", "Audio", "Thumbnail"]
  },
  "youtube-to-mp3": {
    title: "YouTube to MP3 Converter",
    badge: "Audio Tool",
    action: "Find Audio Streams",
    placeholder: "Paste a YouTube video link to find audio...",
    mode: "download",
    summary: "Create audio-ready M4A links from public YouTube videos for offline listening, study, and editing workflows.",
    features: ["Audio stream detection", "M4A/WebA options", "No account required", "Fast cloud delivery"],
    formats: ["M4A", "WebA", "Opus", "Audio-only"]
  },
  "youtube-thumbnail-downloader": {
    title: "YouTube Thumbnail Downloader",
    badge: "Free Tool",
    action: "Get Thumbnails",
    placeholder: "Paste YouTube URL to grab thumbnails...",
    mode: "thumbnail",
    summary: "Download YouTube thumbnails in MaxRes, HD, standard, and compact sizes without heavy server processing.",
    features: ["MaxRes 1280x720", "HD and standard sizes", "Direct JPG downloads", "Shorts support"],
    formats: ["maxresdefault", "sddefault", "hqdefault", "mqdefault", "default"]
  },
  "youtube-shorts-thumbnail-downloader": {
    title: "YouTube Shorts Thumbnail Downloader",
    badge: "Free Tool",
    action: "Get Shorts Thumbnail",
    placeholder: "Paste YouTube Shorts URL...",
    mode: "thumbnail",
    summary: "Extract cover images from YouTube Shorts using the same public thumbnail endpoints as regular videos.",
    features: ["Shorts links", "Preview grid", "Direct image links", "No upload required"],
    formats: ["MaxRes", "Standard", "High", "Medium"]
  },
  "youtube-profile-downloader": {
    title: "YouTube Profile Downloader",
    badge: "Creator Asset",
    action: "Find Channel Profile",
    placeholder: "Paste channel URL or @handle...",
    mode: "metadata",
    summary: "Find channel profile images and creator identity assets from public YouTube channel links.",
    features: ["Channel handles", "Avatar preview", "Creator asset cards", "Clean downloads"],
    formats: ["Avatar", "Channel name", "Handle"]
  },
  "youtube-banner-downloader": {
    title: "YouTube Banner Downloader",
    badge: "Creator Asset",
    action: "Find Banner",
    placeholder: "Paste channel URL or @handle...",
    mode: "metadata",
    summary: "Download YouTube channel banner artwork and brand visuals for research and creator inspiration.",
    features: ["Banner artwork", "Channel context", "High-resolution assets", "Brand research"],
    formats: ["Banner", "TV cover", "Desktop cover"]
  },
  "youtube-title-generator": {
    title: "YouTube Title Generator",
    badge: "SEO Tool",
    action: "Generate Titles",
    placeholder: "Enter your video topic or draft title...",
    mode: "generator",
    summary: "Generate practical, high-CTR title ideas using proven YouTube packaging patterns.",
    features: ["10 title ideas", "CTR-style hooks", "No API key needed", "Copy-ready output"],
    formats: ["How-to", "List", "Warning", "Curiosity", "Guide"]
  },
  "youtube-description-generator": {
    title: "YouTube Description Generator",
    badge: "SEO Tool",
    action: "Generate Description",
    placeholder: "Enter topic, keywords, or video outline...",
    mode: "generator",
    summary: "Create a structured YouTube description with hook, summary, chapters, links, and hashtags.",
    features: ["SEO summary", "CTA section", "Hashtags", "Chapter template"],
    formats: ["Description", "Hashtags", "CTA"]
  },
  "youtube-tag-generator": {
    title: "YouTube Tag Generator",
    badge: "SEO Tool",
    action: "Generate Tags",
    placeholder: "Enter your video topic...",
    mode: "generator",
    summary: "Create comma-separated starter tags from a topic while you wait for YouTube API/AI keys.",
    features: ["Comma-separated tags", "Long-tail ideas", "Copy all", "500-character awareness"],
    formats: ["Tags", "Keywords", "Long-tail"]
  },
  "youtube-tag-extractor": {
    title: "YouTube Tag Extractor",
    badge: "SEO Tool",
    action: "Extract Tags",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Inspect public video context and organize keyword ideas for competitor research and metadata planning.",
    features: ["Video metadata", "Tag API ready", "Copy tags", "Competitor research"],
    formats: ["Tags", "Title", "Channel", "Thumbnail"]
  },
  "youtube-description-extractor": {
    title: "YouTube Description Extractor",
    badge: "SEO Tool",
    action: "Extract Description",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Analyze video descriptions, links, hashtags, and structure for better YouTube SEO planning.",
    features: ["Description API ready", "Video context", "Copy output", "SEO audit"],
    formats: ["Description", "Links", "Hashtags"]
  },
  "youtube-script-generator": {
    title: "YouTube Script Generator",
    badge: "Creator Tool",
    action: "Create Script Outline",
    placeholder: "Enter your video idea...",
    mode: "generator",
    summary: "Build a structured script outline with hook, beats, b-roll prompts, and call-to-action sections.",
    features: ["Hook", "Outline", "B-roll notes", "CTA"],
    formats: ["Shorts", "Long-form", "Tutorial", "Review"]
  },
  "youtube-video-summary": {
    title: "YouTube Video Summary",
    badge: "Creator Tool",
    action: "Prepare Summary",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Review video context, thumbnail, and summary structure for faster competitor research.",
    features: ["Metadata", "Transcript-ready", "Summary-ready", "Creator research"],
    formats: ["Summary", "Chapters", "Key points"]
  },
  "youtube-transcript-generator": {
    title: "YouTube Transcript Generator",
    badge: "Creator Tool",
    action: "Find Transcript",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Prepare transcript-friendly outputs and copy-ready text sections from public video context.",
    features: ["Transcript workflow", "Copy text", "Language support", "Creator research"],
    formats: ["TXT", "SRT", "VTT"]
  },
  "youtube-subtitle-downloader": {
    title: "YouTube Subtitle Downloader",
    badge: "Creator Tool",
    action: "Find Subtitles",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Organize subtitle and caption formats for videos where public captions are available.",
    features: ["SRT/VTT ready", "Language selector planned", "Caption metadata", "Clean output"],
    formats: ["SRT", "VTT", "TXT"]
  },
  "youtube-monetization-checker": {
    title: "YouTube Monetization Checker",
    badge: "Estimator",
    action: "Estimate Channel",
    placeholder: "Enter channel URL, video link, or @handle...",
    mode: "metadata",
    summary: "Prepare channel-level checks and show transparent estimates only. Exact monetization status is not publicly guaranteed.",
    features: ["Channel lookup ready", "Revenue estimate template", "Clear uncertainty", "Sponsor research"],
    formats: ["Status", "Estimate", "Channel"]
  },
  "youtube-channel-id-finder": {
    title: "YouTube Channel ID Finder",
    badge: "Analytics",
    action: "Find Channel ID",
    placeholder: "Paste channel URL, video URL, or @handle...",
    mode: "metadata",
    summary: "Resolve channel IDs with YouTube API once connected; video metadata fallback works for video URLs.",
    features: ["UC ID lookup", "Handle support", "Copy ID", "API ready"],
    formats: ["Channel ID", "Handle", "Name"]
  },
  "youtube-playlist-length-calculator": {
    title: "YouTube Playlist Length Calculator",
    badge: "Analytics",
    action: "Calculate Length",
    placeholder: "Paste playlist URL...",
    mode: "metadata",
    summary: "Playlist duration calculation is ready for YouTube API playlist item data.",
    features: ["Total duration", "Video count", "Playback speed estimates", "API ready"],
    formats: ["1x", "1.25x", "1.5x", "2x"]
  },
  "youtube-engagement-calculator": {
    title: "YouTube Engagement Calculator",
    badge: "Free Tool",
    action: "Calculate Engagement",
    placeholder: "Paste views, likes, and comments as: 10000, 800, 120",
    mode: "calculator",
    summary: "Calculate engagement rate from views, likes, and comments directly in the browser/API.",
    features: ["Engagement rate", "Like ratio", "Comment ratio", "No API needed"],
    formats: ["Views", "Likes", "Comments", "Rate"]
  },
  "youtube-timestamp-link-generator": {
    title: "YouTube Timestamp Link Generator",
    badge: "Free Tool",
    action: "Create Timestamp Link",
    placeholder: "Paste YouTube URL and add time like 1:23...",
    mode: "timestamp",
    summary: "Create shareable YouTube links that open at a specific timestamp.",
    features: ["Watch URLs", "Short URLs", "Seconds conversion", "Copy-ready link"],
    formats: ["hh:mm:ss", "mm:ss", "seconds"]
  }
};

export const legalPages = {
  about: {
    title: "About yt1s.video",
    description: "Learn about yt1s.video, a fast YouTube downloader and creator utility site for public videos, Shorts, thumbnails and metadata tools.",
    sections: [
      ["What we build", "yt1s.video provides a fast yt downloader experience for public YouTube videos, Shorts, thumbnails, metadata and practical creator tools."],
      ["Our approach", "We focus on a smooth user journey, responsive design, clear download choices and ad placements that stay outside the main form."],
      ["Responsible use", "Use yt1s.video only for content you own, have permission to use, or are legally allowed to access."]
    ]
  },
  contact: {
    title: "Contact",
    description: "Contact yt1s.video for support, partnerships, legal notices and removal requests.",
    sections: [
      ["Support email", "For support, partnerships, copyright, DMCA or removal requests, contact info@yt1s.video."],
      ["Response details", "Include the affected URL, a short explanation, and any ownership or authorization details needed to review your request."]
    ]
  },
  privacy: {
    title: "Privacy Policy",
    description: "Privacy Policy for yt1s.video, including URL processing, temporary download links, cookies, analytics and contact details.",
    sections: [
      ["Information we process", "We process URLs, form inputs, selected formats and basic technical request data required to operate the selected tool."],
      ["Download handling", "Prepared download links are temporary. The current downloader streams media to the user device and does not keep completed video files on local server disk."],
      ["Analytics and ads", "We may use privacy-conscious analytics and advertising placements to understand usage and support the service. Ad placeholders are reserved outside the main download flow."],
      ["Contact", "For privacy requests, email info@yt1s.video."]
    ]
  },
  "cookie-policy": {
    title: "Cookie Policy",
    description: "Cookie Policy for yt1s.video, including essential storage, consent choices, analytics, advertising cookies and Google AdSense readiness.",
    sections: [
      ["What cookies are", "Cookies and local storage are small browser-side records that can remember preferences, consent choices, security states and measurement signals."],
      ["Essential storage", "yt1s.video uses essential storage for cookie consent, interface preferences and safe status recovery. These items help the website work and do not require advertising consent."],
      ["Analytics and advertising", "If analytics or Google AdSense are enabled, they may use cookies or similar technologies for measurement, fraud prevention, ad delivery and performance reporting."],
      ["Your choices", "Use the cookie banner to accept all or keep essential-only storage. You can also clear site data from your browser settings at any time."],
      ["Contact", "Questions about cookies or consent can be sent to info@yt1s.video."]
    ]
  },
  terms: {
    title: "Terms of Service",
    description: "Terms of Service for yt1s.video, including responsible use, copyright compliance and service availability.",
    sections: [
      ["Allowed use", "Use yt1s.video only for content you own, have permission to use, or are legally allowed to access."],
      ["User responsibility", "You are responsible for complying with copyright law, local law and platform terms before downloading or reusing content."],
      ["Service availability", "Download formats, quality and speed depend on the source video, network conditions and third-party platform availability."],
      ["Contact", "Questions about these terms can be sent to info@yt1s.video."]
    ]
  },
  dmca: {
    title: "DMCA Policy",
    description: "DMCA Policy for yt1s.video, including copyright takedown and removal request instructions.",
    sections: [
      ["Copyright policy", "yt1s.video does not claim ownership of third-party content and responds to valid copyright and removal requests."],
      ["Submit a notice", "Send DMCA or copyright notices to info@yt1s.video with the affected URL, proof of ownership or authorization, your contact information and a good-faith statement."],
      ["Removal review", "We review complete notices and may restrict tool access to affected URLs where appropriate."],
      ["Misuse", "Fraudulent or incomplete notices may be rejected. Only submit notices for content you own or are authorized to protect."]
    ]
  }
};

export function getTool(slug) {
  return tools[slug];
}

export function allToolSlugs() {
  return Object.keys(tools);
}
