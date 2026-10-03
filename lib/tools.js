export const brand = {
  name: "yt1s.video",
  url: "https://yt1s.video",
  email: "info@yt1s.video",
  tagline: "Fast YouTube tools for creators, editors, and students",
  description:
    "yt1s.video is a fast yt1s YouTube downloader for public videos, Shorts, HD MP4, 4K-ready links, thumbnails, audio, metadata, and creator utilities."
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

export const priorityToolSlugs = [
  "yt1s-youtube-downloader",
  "youtube-to-mp4",
  "youtube-mp4-downloader",
  "youtube-audio-downloader",
  "youtube-video-downloader",
  "youtube-shorts-downloader",
  "youtube-to-mp3",
  "youtube-4k-downloader"
];

export const defaultHowToSteps = [
  ["01", "Paste a YouTube link", "Enter a public YouTube URL, Shorts URL, video ID, channel URL, or the supported input requested by the selected tool."],
  ["02", "Choose the right option", "Pick an available MP4 quality, audio option, thumbnail size, metadata action, or creator workflow depending on the page."],
  ["03", "Use the result", "Open the prepared stream, copy the generated output, or save the creator asset while following the source content permissions."]
];

export const defaultFaqs = [
  ["Is yt1s.video free to use?", "Yes. Core downloader, thumbnail, timestamp, and creator tools are available without account signup."],
  ["Which formats are supported?", "Supported public videos can be prepared as MP4 video or M4A audio, with available quality depending on the source."],
  ["Can I use this as a YouTube Shorts downloader?", "Yes. Paste a public Shorts URL and choose a video or audio format when source delivery is available."],
  ["Is this a youtube video downloader no ads workflow?", "The main downloader flow stays clean and focused. Ad placeholders are reserved outside the form area."],
  ["Can I download thumbnails?", "Yes. MaxRes, standard, high, medium, and default YouTube thumbnail sizes are available instantly."],
  ["What content can I download?", "Only download content you own, have permission to use, or are legally allowed to access."]
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
      "youtube-to-mp4",
      "youtube-mp4-downloader",
      "youtube-audio-downloader",
      "youtube-video-converter",
      "yt1s-youtube-downloader",
      "youtube-4k-downloader",
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
    defaultQuality: "audio",
    summary: "Create audio-ready M4A links from public YouTube videos for offline listening, study, and editing workflows.",
    features: ["Audio stream detection", "M4A/WebA options", "No account required", "Fast cloud delivery"],
    formats: ["M4A", "WebA", "Opus", "Audio-only"],
    seoTitle: "Convert YouTube to MP3-style audio without clutter",
    seoIntro: "The yt1s YouTube to MP3 page is built for users who want an audio-first workflow from public videos. The delivery format is M4A when available because it is widely supported and avoids pretending every source can become a true MP3 instantly.",
    seoSections: [
      ["Audio-first workflow", "Paste a public YouTube URL, select Audio M4A, and prepare a short-lived stream that saves directly to your device when the source allows audio delivery."],
      ["Useful for study and editing", "Audio downloads can help with permitted lecture review, creator drafts, rough cuts, research and personal offline listening where you have the right to use the content."],
      ["Format honesty", "Some websites promise 320kbps MP3 for every video. yt1s.video keeps the copy honest: source quality varies, audio may be delivered as M4A/WebA, and unavailable content fails with a clear public message."]
    ],
    steps: [
      ["01", "Paste a video link", "Use a public YouTube URL or video ID from content you can lawfully process."],
      ["02", "Choose Audio M4A", "The tool prepares an audio-first stream instead of forcing a fake MP3 promise."],
      ["03", "Save the audio", "Open the temporary download link and save the file directly to your device."]
    ],
    faqs: [
      ["Is this a real YouTube to MP3 converter?", "The page is optimized for MP3-style audio intent, but delivery may use M4A/WebA depending on the source because those formats are commonly provided by YouTube."],
      ["Can I download long videos as audio?", "The worker has duration and file-size limits for reliability. Very long videos may need a shorter source or lower-quality workflow."],
      ["Does yt1s.video ask for my YouTube login?", "No. The downloader form only accepts a public URL or video ID and never asks for private account credentials."]
    ]
  },
  "youtube-to-mp4": {
    title: "YouTube to MP4 Converter",
    badge: "MP4 Tool",
    action: "Convert to MP4",
    placeholder: "Paste a YouTube link to prepare MP4...",
    mode: "download",
    summary: "Convert public YouTube videos into MP4-style download links with selectable 360p, 480p, 720p and 1080p options when available.",
    features: ["MP4 video workflow", "HD quality choices", "Short-lived stream links", "Mobile-friendly download UI"],
    formats: ["MP4", "360p", "480p", "720p", "1080p"],
    seoTitle: "YouTube to MP4 converter for clean video downloads",
    seoIntro: "This yt1s YouTube to MP4 page focuses on the common task: paste a public video URL, choose a practical MP4 quality, and save the prepared stream without hunting through misleading buttons.",
    seoSections: [
      ["MP4-focused choices", "Choose 360p, 480p, 720p or 1080p depending on what the public source video can provide. If a requested quality is not available, the page guides you back to another option."],
      ["No permanent video locker", "Prepared links are temporary and stream through the worker instead of turning yt1s.video into long-term media storage."],
      ["Made for everyday devices", "The MP4 flow is designed for phones, tablets and desktops, with large controls, readable status messages and a direct download action when processing completes."]
    ],
    steps: [
      ["01", "Paste the YouTube URL", "Use a regular video, Shorts link, or valid video ID."],
      ["02", "Pick MP4 quality", "Start with 720p or 1080p for HD sources, or choose a lower option for smaller files."],
      ["03", "Download the stream", "Open the generated link before it expires and save the MP4-style file locally."]
    ],
    faqs: [
      ["Can every video be converted to MP4?", "No. Availability depends on the source video, region, privacy settings, format availability and service limits."],
      ["Does the page support 1080p MP4?", "Supported public videos can be prepared up to 1080p when the source provides compatible video and audio streams."],
      ["Why do some MP4 requests fail?", "Private, removed, region-restricted, live, too-long or unsupported-format videos can fail gracefully with a safe public message."]
    ]
  },
  "youtube-mp4-downloader": {
    title: "YouTube MP4 Downloader",
    badge: "Video Tool",
    action: "Download MP4",
    placeholder: "Paste a YouTube video URL...",
    mode: "download",
    summary: "A focused YouTube MP4 downloader page for public videos, Shorts and HD-ready MP4 workflows on mobile or desktop.",
    features: ["MP4 download intent", "Public video support", "HD source checks", "Direct save workflow"],
    formats: ["MP4", "HD", "720p", "1080p", "Audio M4A"],
    seoTitle: "YouTube MP4 downloader with HD-ready links",
    seoIntro: "The YouTube MP4 Downloader page gives MP4 search traffic a dedicated destination while keeping the same safe yt1s.video workflow: clear input, quality choice, temporary stream link and responsible use guidance.",
    seoSections: [
      ["Built around MP4 intent", "Visitors searching for a YouTube MP4 downloader usually want a video file, not a wall of unrelated converter claims. This page keeps the format choice and download action visible."],
      ["Quality depends on the source", "MP4 output can vary by video. Some sources provide combined streams, while others require separate video and audio streams that the worker prepares for delivery."],
      ["Safe public messaging", "The UI avoids exposing provider diagnostics, infrastructure names or internal errors. Users see clear guidance when a video is unavailable or a format cannot be prepared."]
    ],
    faqs: [
      ["Is this different from YouTube to MP4?", "It targets the same MP4 workflow but matches users who search specifically for a YouTube MP4 downloader."],
      ["Can I download Shorts as MP4?", "Public Shorts links can be processed through the same downloader when source delivery is available."],
      ["Are files stored on the server?", "No permanent local video storage is intended. Prepared links are temporary and stream to the user device."]
    ]
  },
  "youtube-audio-downloader": {
    title: "YouTube Audio Downloader",
    badge: "Audio Tool",
    action: "Download Audio",
    placeholder: "Paste a YouTube URL for audio...",
    mode: "download",
    defaultQuality: "audio",
    summary: "Download audio-ready streams from public YouTube videos as M4A-style files for permitted listening, review and editing workflows.",
    features: ["Audio-first download", "M4A delivery", "No login required", "Clear source limits"],
    formats: ["Audio M4A", "WebA", "Opus", "Public videos"],
    seoTitle: "YouTube audio downloader for public videos",
    seoIntro: "Use this yt1s YouTube Audio Downloader when your goal is the sound track rather than the full video. It keeps audio controls simple and avoids fake quality guarantees.",
    seoSections: [
      ["Audio-only by default", "The page opens with the audio workflow selected so users do not accidentally prepare a video format when they searched for audio."],
      ["Creator-friendly use cases", "Save permitted reference audio, lectures, drafts or your own public uploads for editing and review."],
      ["Transparent limits", "Audio availability can change by source, region, video status and platform delivery rules. The tool reports safe retry or unavailable states without leaking internal errors."]
    ],
    faqs: [
      ["What audio format does yt1s use?", "The browser receives an audio-ready stream, commonly M4A when available from the source."],
      ["Can I use it on mobile?", "Yes. The form and download states are mobile-friendly, but browser download behavior can vary by device."],
      ["Can I download copyrighted music?", "Only process content you own, have permission to use, or are legally allowed to access."]
    ]
  },
  "youtube-video-converter": {
    title: "YouTube Video Converter",
    badge: "Converter",
    action: "Convert Video",
    placeholder: "Paste a YouTube video to convert...",
    mode: "download",
    summary: "Convert public YouTube video links into practical MP4 or M4A download workflows with clear quality choices and temporary links.",
    features: ["Video and audio options", "Quality selector", "Temporary stream links", "Responsible-use guidance"],
    formats: ["MP4", "M4A", "360p", "720p", "1080p"],
    seoTitle: "YouTube video converter for MP4 and audio workflows",
    seoIntro: "The YouTube Video Converter page covers visitors who search broadly for conversion rather than one exact format. It routes them into the same clean yt1s.video flow for MP4 video or audio-only delivery.",
    seoSections: [
      ["One converter, clear choices", "Instead of scattering users across fake download buttons, the page presents one URL field and one quality selector for practical video or audio workflows."],
      ["Works with public links", "The converter is designed for public videos and Shorts. Private, removed, live or restricted videos may not be available."],
      ["Conversion without clutter", "Status messages explain checking, retrying and completion states so the visitor knows what is happening while the worker prepares the stream."]
    ],
    faqs: [
      ["Which formats can I choose?", "The current workflow supports common MP4 video choices and audio M4A-style delivery when source formats are available."],
      ["Is this a cloud converter?", "The worker prepares a short-lived stream link and avoids keeping completed video files as permanent storage."],
      ["Can I convert playlists?", "This page is focused on single video or Shorts URLs, not full playlist downloading."]
    ]
  },
  "yt1s-youtube-downloader": {
    title: "YT1s YouTube Downloader",
    badge: "YT1s Tool",
    action: "Start Download",
    placeholder: "Paste a YouTube URL into yt1s...",
    mode: "download",
    summary: "Use yt1s.video as a clean YT1s YouTube downloader for public videos, Shorts, MP4-style links, thumbnails and audio workflows.",
    features: ["YT1s downloader intent", "Video and audio options", "Shorts support", "No-clutter interface"],
    formats: ["YT1s", "MP4", "M4A", "HD", "Shorts"],
    seoTitle: "YT1s YouTube downloader for public video links",
    seoIntro: "This page is a direct answer for users searching YT1s YouTube downloader. It clarifies the official yt1s.video workflow and points visitors to the right public video, audio or Shorts options.",
    seoSections: [
      ["Brand-intent clarity", "Searches like yt1s download, YT1s org download and yt1s YouTube downloader often mean the user wants a familiar downloader page without suspicious popups or unrelated software."],
      ["Official domain signal", "The canonical public site is yt1s.video. The page uses HTTPS, legal pages, contact links, security metadata and clear download controls."],
      ["Fast path to the tool", "The form stays in the first viewport so brand-intent visitors can paste a link immediately, then review format and safety guidance below."]
    ],
    faqs: [
      ["Is yt1s.video the official domain for this site?", "Yes. This project uses yt1s.video as the canonical public domain in metadata, sitemap and structured data."],
      ["Does YT1s require an account?", "No account signup is required for the core public downloader workflow."],
      ["What can I download with yt1s?", "Only process content you own, have permission to use, or are legally allowed to access."]
    ]
  },
  "youtube-4k-downloader": {
    title: "YouTube 4K Downloader",
    badge: "HD Tool",
    action: "Check HD Formats",
    placeholder: "Paste a YouTube URL to check HD formats...",
    mode: "download",
    summary: "Check public YouTube videos for HD and 4K-ready source availability, then prepare the best supported download option the service can safely deliver.",
    features: ["HD source checks", "1080p workflow", "4K-ready guidance", "Lower-quality fallback"],
    formats: ["1080p", "720p", "480p", "360p", "Audio"],
    seoTitle: "YouTube 4K downloader search page with honest quality guidance",
    seoIntro: "Users often search for a YouTube 4K downloader when they want the best quality available. This page keeps that intent while being honest: actual delivered quality depends on source formats, worker limits and browser-compatible streams.",
    seoSections: [
      ["Quality-first intent", "Start with 1080p for public HD videos and use lower qualities when file size, format availability or source delivery requires it."],
      ["4K-ready, not fake promises", "Some source videos include higher-resolution streams, but not every browser delivery path can safely prepare every 4K format. The page explains this clearly instead of promising impossible results."],
      ["Fallbacks that help", "When the highest quality is unavailable, users can retry at 720p, 480p, 360p or audio rather than getting stuck in a loader."]
    ],
    faqs: [
      ["Does yt1s.video always download 4K?", "No. The page targets 4K downloader search intent, but current selectable delivery focuses on supported public formats such as 1080p and lower when available."],
      ["Why choose 720p instead of 1080p?", "720p often produces smaller files and can be more reliable on slower networks or mobile devices."],
      ["Can restricted videos be downloaded in HD?", "Private, region-restricted, live or unavailable videos cannot be forced through the downloader."]
    ]
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
