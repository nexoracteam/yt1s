// New landing pages, nav groups and indexability rules. Merged into `tools` by lib/tools.js.
export const extraTools = {
  "youtube-downloader-for-iphone": {
    title: "YouTube Downloader for iPhone & iPad",
    badge: "iPhone Guide",
    action: "Download Video",
    placeholder: "Paste a YouTube link to save on iPhone...",
    mode: "download",
    summary: "Save public YouTube videos and Shorts on iPhone or iPad from Safari. No app needed; files go to the Files app.",
    features: ["Works in Safari", "No app to install", "MP4 up to 1080p", "Audio as M4A"],
    formats: ["MP4", "720p", "1080p", "Audio M4A"],
    seoTitle: "Download YouTube videos on iPhone without an app",
    seoIntro: "On iOS 13 and later, Safari downloads the prepared file straight to your device. Paste a public YouTube link, choose a quality and save it to the Files app, then move it to Photos if you want.",
    seoSections: [
      ["Use Safari, not an in-app browser", "Downloads work best in Safari. Links opened inside social or messaging apps often block file downloads, so copy the address and open it in Safari."],
      ["Where the file goes", "Open Files and then Downloads. To place a video in your camera roll, touch and hold the file, choose Share and tap Save Video. Audio saved as M4A plays from Files."],
      ["Pick a size that fits your phone", "720p is a good balance for iPhone screens. Choose 360p to save storage or Audio M4A when you only need sound."]
    ],
    steps: [
      ["01", "Copy the YouTube link", "In YouTube tap Share, then Copy Link."],
      ["02", "Paste it in Safari", "Open yt1s.video in Safari, paste the link and choose a quality."],
      ["03", "Save from Files", "Tap Download, then find the file in Files > Downloads."]
    ],
    faqs: [
      ["Do I need an app on iPhone?", "No. Safari on iOS 13 or later can download the file."],
      ["Where do iPhone downloads go?", "They are saved in the Files app, in the Downloads folder."],
      ["Can I save the video to Photos?", "Yes. Share the file from Files and choose Save Video."]
    ]
  },
  "youtube-downloader-for-android": {
    title: "YouTube Downloader for Android",
    badge: "Android Guide",
    action: "Download Video",
    placeholder: "Paste a YouTube link to save on Android...",
    mode: "download",
    summary: "Save public YouTube videos and Shorts on an Android phone using Chrome. No APK or app required.",
    features: ["Works in Chrome", "No APK needed", "MP4 up to 1080p", "Audio as M4A"],
    formats: ["MP4", "360p", "720p", "Audio M4A"],
    seoTitle: "Download YouTube videos on Android without an APK",
    seoIntro: "Use Chrome on your Android phone: paste a public YouTube link, choose a quality and the file saves to your Downloads folder like any other download.",
    seoSections: [
      ["No APK or extension", "Installing unknown APK files is a common way to pick up malware. This tool runs entirely in your browser, so there is nothing to install."],
      ["Finding your file", "Open Files or My Files and look in Downloads. Videos normally show up in the gallery shortly after; audio plays in the Files app or your music player."],
      ["Control data use", "Use Wi-Fi for 720p and 1080p. 360p or Audio M4A keeps downloads small on a mobile plan."]
    ],
    steps: [
      ["01", "Copy the link", "In the YouTube app tap Share, then Copy."],
      ["02", "Paste in Chrome", "Open yt1s.video, paste the link and choose a quality."],
      ["03", "Open Downloads", "Tap Download and find the file in your Downloads folder."]
    ],
    faqs: [
      ["Do I need to install an app?", "No. Chrome or any modern mobile browser works."],
      ["Why does the download pause?", "Some phones pause transfers when Chrome is in the background or battery saver is on. Keep the tab open."],
      ["Can I download Shorts on Android?", "Yes, paste a public Shorts link."]
    ]
  },
  "youtube-1080p-downloader": {
    title: "YouTube 1080p Video Downloader (Full HD)",
    badge: "Full HD",
    action: "Download 1080p",
    placeholder: "Paste a YouTube link for 1080p...",
    mode: "download",
    defaultQuality: "1080p",
    summary: "Download public YouTube videos in Full HD 1080p MP4 when the original is uploaded at that resolution. Maximum quality is 1080p.",
    features: ["Up to 1080p MP4", "Video and audio merged", "No signup", "Direct stream to device"],
    formats: ["1080p", "MP4", "Full HD"],
    seoTitle: "Full HD 1080p YouTube downloads, with honest limits",
    seoIntro: "Choose 1080p when your screen is large and the original video was uploaded in Full HD. If the source is lower resolution, you receive the best available version instead.",
    seoSections: [
      ["Merged video and audio", "Full HD video and audio are separate streams on YouTube. They are joined into one MP4 while the file is delivered to you."],
      ["Know the limits", "1080p is the top option. 4K is not supported. Videos longer than 30 minutes or above 500 MB are refused, so choose 720p for long videos."],
      ["Bigger files, longer waits", "A 1080p file is much larger than 720p. Use Wi-Fi and keep the page open until it finishes."]
    ],
    steps: [
      ["01", "Paste a public video link", "Use a standard video or Shorts URL."],
      ["02", "Keep 1080p selected", "The default is Full HD. Lower it if the file would be too large."],
      ["03", "Save the MP4", "Wait for preparation, then download before the link expires."]
    ],
    faqs: [
      ["Is 4K supported?", "No. The maximum is 1080p."],
      ["Why did I get 720p?", "The original video may not offer 1080p."],
      ["Is there a size limit?", "Yes: 500 MB and 30 minutes per video."]
    ]
  },
  "yt1s-mp4-converter": {
    title: "YT1s MP4 Converter - YouTube to MP4",
    badge: "MP4 Tool",
    action: "Convert to MP4",
    placeholder: "Paste a YouTube link to convert to MP4...",
    mode: "download",
    summary: "A simple YT1s-style YouTube to MP4 converter for public videos and Shorts. Pick 360p to 1080p, no account needed.",
    features: ["YouTube to MP4", "360p to 1080p", "Shorts supported", "No account required"],
    formats: ["MP4", "360p", "480p", "720p", "1080p"],
    seoTitle: "Looking for a YT1s MP4 converter?",
    seoIntro: "People search for this as yt1s mp4, yts1 mp4, yst1 or y1ts. Whichever spelling you used, this page does one job: turn a public YouTube link into an MP4 file you can save. yt1s.video is an independent service and is not affiliated with other sites that use a similar name.",
    seoSections: [
      ["How it differs from other YT1s sites", "This site is independent. It shows no pop-up ads, asks for no extension and never asks for your Google login."],
      ["What you get", "MP4 video up to 1080p, or M4A audio. It does not create MP3 files or 4K video."],
      ["Misspellings are fine", "yts1, yst1, y1ts, yt 1s and yt1 all lead to the same idea: a quick YouTube downloader. You are in the right place."]
    ],
    steps: [
      ["01", "Paste the link", "Copy a public YouTube or Shorts link."],
      ["02", "Choose MP4 quality", "720p suits most devices; 1080p suits large screens."],
      ["03", "Download", "Save the file before the temporary link expires."]
    ],
    faqs: [
      ["Is yt1s.video the same as yt1s.com?", "No. It is an independent site and is not affiliated with yt1s.com."],
      ["Does it convert to MP3?", "No. Audio is delivered as M4A."],
      ["Is it free?", "Yes, with no account."]
    ]
  }
};

// Pages that only preview data or say "API ready" are not useful search results yet.
// They stay reachable but are kept out of the menu, sitemap and search index.
export const thinSlugs = [
  "youtube-profile-downloader", "youtube-banner-downloader", "youtube-tag-extractor",
  "youtube-description-extractor", "youtube-video-summary", "youtube-transcript-generator",
  "youtube-subtitle-downloader", "youtube-monetization-checker", "youtube-channel-id-finder",
  "youtube-playlist-length-calculator"
];

export const navGroups = [
  {
    title: "Downloaders",
    items: [
      "youtube-video-downloader", "youtube-to-mp4", "youtube-audio-downloader", "youtube-shorts-downloader",
      "youtube-1080p-downloader", "youtube-downloader-for-iphone", "youtube-downloader-for-android",
      "yt1s-mp4-converter"
    ]
  },
  {
    title: "Thumbnails",
    items: ["youtube-thumbnail-downloader", "youtube-shorts-thumbnail-downloader"]
  },
  {
    title: "Creator tools",
    items: [
      "youtube-title-generator", "youtube-description-generator", "youtube-tag-generator",
      "youtube-script-generator", "youtube-engagement-calculator", "youtube-timestamp-link-generator"
    ]
  }
];
