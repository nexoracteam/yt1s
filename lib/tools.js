export const brand = {
  name: "yt1s.video",
  tagline: "Fast YouTube tools for creators, editors, and students",
  description:
    "Download thumbnails, inspect public video metadata, prepare safe direct stream links, and use practical YouTube utility tools from one clean dashboard."
};

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
    action: "Get Download Links",
    placeholder: "Paste a YouTube URL or video ID...",
    mode: "download",
    summary: "Fetch public video metadata and direct formats, then save supported files through Cloudinary when Vercel limits allow it.",
    features: ["MP4 and WebM formats", "Video title and thumbnail preview", "Cloudinary storage ready", "Vercel-safe limits"],
    formats: ["360p", "720p", "1080p", "Audio-only", "WebM", "MP4"]
  },
  "youtube-shorts-downloader": {
    title: "YouTube Shorts Downloader",
    badge: "Free Tool",
    action: "Get Shorts Links",
    placeholder: "Paste a YouTube Shorts URL...",
    mode: "download",
    summary: "Resolve public Shorts metadata and direct mobile-friendly formats from a clean Vercel-powered interface.",
    features: ["Shorts URL support", "Vertical video previews", "Fast metadata fetch", "Direct stream options"],
    formats: ["Shorts MP4", "720p", "Audio", "Thumbnail"]
  },
  "youtube-to-mp3": {
    title: "YouTube to MP3 Converter",
    badge: "Limited on Vercel",
    action: "Find Audio Streams",
    placeholder: "Paste a YouTube video link to find audio...",
    mode: "download",
    summary: "Find audio-only streams where available. Full MP3 conversion requires ffmpeg and may be unavailable on Vercel-only hosting.",
    features: ["Audio stream detection", "M4A/WebA links", "No account required", "Clear conversion limits"],
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
    badge: "API Ready",
    action: "Find Channel Profile",
    placeholder: "Paste channel URL or @handle...",
    mode: "metadata",
    summary: "Prepare channel avatar extraction using YouTube Data API once your API key is connected.",
    features: ["Channel handles", "Avatar preview", "YouTube API ready", "Clean download cards"],
    formats: ["Avatar", "Channel name", "Handle"]
  },
  "youtube-banner-downloader": {
    title: "YouTube Banner Downloader",
    badge: "API Ready",
    action: "Find Banner",
    placeholder: "Paste channel URL or @handle...",
    mode: "metadata",
    summary: "Download channel banner artwork after connecting YouTube Data API channel branding data.",
    features: ["Banner artwork", "Channel context", "API ready", "High-resolution assets"],
    formats: ["Banner", "TV cover", "Desktop cover"]
  },
  "youtube-title-generator": {
    title: "YouTube Title Generator",
    badge: "Template Tool",
    action: "Generate Titles",
    placeholder: "Enter your video topic or draft title...",
    mode: "generator",
    summary: "Generate practical title ideas locally with reusable copywriting patterns. AI integration is intentionally left out for now.",
    features: ["10 title ideas", "CTR-style hooks", "No API key needed", "Copy-ready output"],
    formats: ["How-to", "List", "Warning", "Curiosity", "Guide"]
  },
  "youtube-description-generator": {
    title: "YouTube Description Generator",
    badge: "Template Tool",
    action: "Generate Description",
    placeholder: "Enter topic, keywords, or video outline...",
    mode: "generator",
    summary: "Create a structured YouTube description with hook, summary, chapters, links, and hashtags.",
    features: ["SEO summary", "CTA section", "Hashtags", "Chapter template"],
    formats: ["Description", "Hashtags", "CTA"]
  },
  "youtube-tag-generator": {
    title: "YouTube Tag Generator",
    badge: "Template Tool",
    action: "Generate Tags",
    placeholder: "Enter your video topic...",
    mode: "generator",
    summary: "Create comma-separated starter tags from a topic while you wait for YouTube API/AI keys.",
    features: ["Comma-separated tags", "Long-tail ideas", "Copy all", "500-character awareness"],
    formats: ["Tags", "Keywords", "Long-tail"]
  },
  "youtube-tag-extractor": {
    title: "YouTube Tag Extractor",
    badge: "API Ready",
    action: "Extract Tags",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Extract public metadata now and connect YouTube Data API later for authentic backend tags where available.",
    features: ["Video metadata", "Tag API ready", "Copy tags", "Competitor research"],
    formats: ["Tags", "Title", "Channel", "Thumbnail"]
  },
  "youtube-description-extractor": {
    title: "YouTube Description Extractor",
    badge: "API Ready",
    action: "Extract Description",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Fetch video context and enable full description extraction when a YouTube API key is added.",
    features: ["Description API ready", "Video context", "Copy output", "SEO audit"],
    formats: ["Description", "Links", "Hashtags"]
  },
  "youtube-script-generator": {
    title: "YouTube Script Generator",
    badge: "Coming Soon",
    action: "Create Script Outline",
    placeholder: "Enter your video idea...",
    mode: "generator",
    summary: "AI script writing is paused for now. This page includes a structured outline builder ready for future AI integration.",
    features: ["Hook", "Outline", "B-roll notes", "CTA"],
    formats: ["Shorts", "Long-form", "Tutorial", "Review"]
  },
  "youtube-video-summary": {
    title: "YouTube Video Summary",
    badge: "API Ready",
    action: "Prepare Summary",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Show public video metadata now. Transcript and AI summarization can be connected later.",
    features: ["Metadata", "Transcript-ready", "Summary-ready", "Creator research"],
    formats: ["Summary", "Chapters", "Key points"]
  },
  "youtube-transcript-generator": {
    title: "YouTube Transcript Generator",
    badge: "API Ready",
    action: "Find Transcript",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Transcript extraction is prepared for a transcript provider/API. Vercel UI and metadata flow are ready.",
    features: ["Transcript-ready", "Copy text", "Language support planned", "No AI required"],
    formats: ["TXT", "SRT", "VTT"]
  },
  "youtube-subtitle-downloader": {
    title: "YouTube Subtitle Downloader",
    badge: "API Ready",
    action: "Find Subtitles",
    placeholder: "Paste YouTube video URL...",
    mode: "metadata",
    summary: "Subtitle route is ready for caption discovery and download once caption extraction is enabled.",
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
    badge: "API Ready",
    action: "Find Channel ID",
    placeholder: "Paste channel URL, video URL, or @handle...",
    mode: "metadata",
    summary: "Resolve channel IDs with YouTube API once connected; video metadata fallback works for video URLs.",
    features: ["UC ID lookup", "Handle support", "Copy ID", "API ready"],
    formats: ["Channel ID", "Handle", "Name"]
  },
  "youtube-playlist-length-calculator": {
    title: "YouTube Playlist Length Calculator",
    badge: "API Ready",
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
    body: "yt1s.video is a creator utility website focused on YouTube thumbnails, metadata, safe direct links, calculators, and workflow tools. The app is built for Vercel deployment with Cloudinary storage support."
  },
  contact: {
    title: "Contact",
    body: "For support, partnership, or removal requests, add your public contact email here before launch."
  },
  privacy: {
    title: "Privacy Policy",
    body: "We only process URLs and form inputs required to provide the selected tool. Do not submit private or sensitive information. Cloudinary may store generated files when storage is enabled."
  },
  terms: {
    title: "Terms of Service",
    body: "Use yt1s.video only for content you own, have permission to use, or are legally allowed to access. You are responsible for complying with copyright law and platform terms."
  },
  dmca: {
    title: "DMCA Disclaimer",
    body: "yt1s.video does not claim ownership of third-party content. Rights holders can submit removal requests with the affected URL and proof of ownership."
  },
  blog: {
    title: "Creator Blog",
    body: "Guides and tutorials for YouTube creators will be published here after launch."
  }
};

export function getTool(slug) {
  return tools[slug];
}

export function allToolSlugs() {
  return Object.keys(tools);
}
