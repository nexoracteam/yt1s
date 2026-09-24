# yt1s.video Project Handoff

## September 24 recovery update (supersedes older download notes below)

- Current managed frontend: https://yt1s-iota.vercel.app, Vercel project `yt1s` in `nexora-team4`.
- The older `yt1s-azure.vercel.app` frontend is not in the currently authenticated Vercel scope. It still uses the same Railway worker.
- Railway worker health version: `download-recovery-v2`.
- Public downloads try maintained yt-dlp default clients anonymously, then a cookie session, with bounded retries. No hard-coded browser client/user-agent.
- Cookie snapshots are isolated per job; refreshed cookies survive between jobs within a running container. Environment cookies seed the store on startup. No cookie values are logged.
- Jobs are serialized; identical in-flight requests are deduplicated and completed results cached for one hour in memory. Restarting the worker clears this cache.
- Extraction JSON is reused for the download with the requested format selector. MP4 remux / M4A extraction makes the final extension predictable.
- Cloudinary attachment URLs trigger automatic browser download, with a manual Download File fallback.
- Worker, proxy and UI use allowlisted public errors; internal instructions and subprocess errors are never shown to users. UI supports retry/status recovery and download progress.
- Docker pins `yt-dlp[default]==2026.8.19` to include its JS challenge solver. Review/update the pin when extractor changes are needed.
- Verification: `node --test worker/download.test.js`, lint and build passed. Headless Chrome mobile checks passed, including hiding a simulated legacy internal error and a real automatic download.
- Live tests: `RpJ4UWDjyeU` 360p completed on retry 2 in ~22s (52,245,799 bytes); `dQw4w9WgXcQ` 360p completed in ~9.5s, cached response ~1.2s. These are observed tests, not guaranteed timings or permanent immunity to YouTube throttling.
- A valid cookie-file format does not prove a valid YouTube login session. Diagnostic command `node scripts/cookie-status.mjs` prints only counts/booleans.

## Current Production URLs

- Frontend: https://yt1s-azure.vercel.app
- Railway worker: https://yt1s-production.up.railway.app
- GitHub repo: https://github.com/nexoracteam/yt1s

## High-Level Architecture

The project is now a two-service app.

1. Next.js frontend/API on Vercel.
2. Railway worker for real video downloading.
3. Cloudinary for final media storage and public download URLs.

Flow:

```text
Browser
  -> Vercel Next.js app
  -> /api/worker-download
  -> Railway worker
  -> yt-dlp + ffmpeg
  -> Cloudinary upload
  -> Cloudinary download URL returned to browser
```

## Services

### Vercel

Project is linked locally to Vercel project `yt1s` under `zamad-hassans-projects`.

Important Vercel env vars currently configured:

```env
CLOUDINARY_URL=hidden
DOWNLOAD_WORKER_URL=https://yt1s-production.up.railway.app
WORKER_SECRET=hidden
```

Note: `WORKER_SECRET` remains configured in Vercel, but Railway auth is currently disabled with `ENFORCE_WORKER_AUTH=false` to avoid user-facing `Unauthorized` errors.

### Railway

Project: `reasonable-peace`

Service: `yt1s`

Public domain: https://yt1s-production.up.railway.app

Important Railway env vars currently configured:

```env
CLOUDINARY_URL=hidden
WORKER_SECRET=hidden
ENFORCE_WORKER_AUTH=false
YOUTUBE_COOKIES_B64=hidden
MAX_DURATION_SECONDS=1800
MAX_FILE_MB=500
```

`YOUTUBE_COOKIES_B64` was added from a local cookies file saved outside the repo. Do not commit cookies.

## Repo Structure

```text
app/                         Next.js app routes and API routes
app/[slug]/page.js           Dynamic tool/legal pages
app/api/info/route.js        Metadata/preview extraction fallback API
app/api/worker-download/     Vercel proxy to Railway worker
app/robots.js                SEO robots.txt route
app/sitemap.js               SEO sitemap.xml route
components/                  UI components
components/ToolClient.js     Main interactive tool/download UI
components/Sections.js       Homepage/tool sections
components/Reveal.js         Framer Motion reveal wrapper
lib/tools.js                 Tool metadata/copy/routes
lib/youtube.js               YouTube URL parsing/thumbnail helpers
worker/                      Railway worker app
worker/server.js             Express worker using yt-dlp/ffmpeg/Cloudinary
Dockerfile                   Root Railway Dockerfile that builds worker service
railway.json                 Railway build/deploy config
RAILWAY.md                   Railway setup notes
```

## Main Packages Added

Frontend:

- `next`
- `react`
- `react-dom`
- `framer-motion`
- `lucide-react`
- `@distube/ytdl-core`
- `cloudinary`

Worker:

- `express`
- `cloudinary`
- `nanoid`

Worker Docker image installs:

- `yt-dlp`
- `ffmpeg`
- `python3`

## Features Implemented

### Frontend/UI

- Built a branded `yt1s.video` site.
- Added homepage with hero, downloader form, how-it-works, tool directory, feature sections, FAQ, and footer.
- Added dark/light mode via device `prefers-color-scheme`.
- Added premium fonts using Google fonts: Manrope and Space Grotesk.
- Added `framer-motion` reveal animations.
- Added `lucide-react` icons.
- Added loader states and status transitions for downloads.
- Removed user-facing dummy/internal copy mentioning Vercel/Railway/Cloudinary/yt-dlp/ffmpeg.
- Added production-facing copy for tools.

### Routes/Pages

Dynamic routes generated for:

- `/youtube-video-downloader`
- `/youtube-shorts-downloader`
- `/youtube-to-mp3`
- `/youtube-thumbnail-downloader`
- `/youtube-shorts-thumbnail-downloader`
- `/youtube-profile-downloader`
- `/youtube-banner-downloader`
- `/youtube-title-generator`
- `/youtube-description-generator`
- `/youtube-tag-generator`
- `/youtube-tag-extractor`
- `/youtube-description-extractor`
- `/youtube-script-generator`
- `/youtube-video-summary`
- `/youtube-transcript-generator`
- `/youtube-subtitle-downloader`
- `/youtube-monetization-checker`
- `/youtube-channel-id-finder`
- `/youtube-playlist-length-calculator`
- `/youtube-engagement-calculator`
- `/youtube-timestamp-link-generator`
- `/about`
- `/contact`
- `/privacy`
- `/terms`
- `/dmca`
- `/blog`

Important fix: `app/[slug]/page.js` awaits `params` for Next 16 compatibility. Without this, dynamic tool pages returned 404.

### Working Tools

- Thumbnail downloader: derives YouTube thumbnail URLs.
- Shorts thumbnail downloader: same thumbnail extraction flow.
- Timestamp link generator.
- Engagement calculator.
- Template-based title generator.
- Template-based description generator.
- Template-based tag generator.
- Script outline builder.
- Video preview/title/thumbnail extraction.
- Secure video download through Railway worker.

### SEO

- Added metadata in `app/layout.js`.
- Added canonical URL.
- Added Open Graph basics.
- Added robots route: `/robots.txt`.
- Added sitemap route: `/sitemap.xml`.

## Download Worker Details

Worker endpoints:

```text
GET /health
POST /download
GET /job/:id
```

Vercel proxy endpoints:

```text
POST /api/worker-download
GET /api/worker-download?jobId=...
```

The worker:

1. Accepts YouTube URL and quality.
2. Runs `yt-dlp --dump-json` for info.
3. Downloads selected format with `yt-dlp`.
4. Uses `ffmpeg` merge through yt-dlp when needed.
5. Uploads file to Cloudinary.
6. Returns job status and final Cloudinary `downloadUrl`.

Supported quality values in UI:

```text
360p
480p
720p
1080p
```

## YouTube Bot Protection Work Done

YouTube blocked Railway IP at times with:

```text
Sign in to confirm you're not a bot
HTTP Error 429: Too Many Requests
```

Mitigations added in `worker/server.js`:

- Added browser-like user agent.
- Added `Accept-Language` header.
- Forced IPv4.
- Added Node JS runtime for challenge handling.
- Enabled remote EJS components:

```text
--remote-components ejs:github
```

- Added cookie support via Railway env var:

```env
YOUTUBE_COOKIES_B64=
```

- When cookies exist, worker uses YouTube clients:

```text
web, web_safari
```

## Auth / Unauthorized Issue

Earlier Railway direct access returned:

```text
401 Unauthorized
```

That was expected because Railway worker was protected by `WORKER_SECRET`, but it confused testing/user flow. To stop the user from seeing `Unauthorized`, worker auth was made optional.

Current setting:

```env
ENFORCE_WORKER_AUTH=false
```

Current behavior:

- Direct Railway invalid job URL returns 404, not 401.
- Vercel proxy still works.

If auth should be re-enabled later:

```env
ENFORCE_WORKER_AUTH=true
```

Then make sure `WORKER_SECRET` is identical on Railway and Vercel.

## Tests Already Performed

### Build/Lint

Passed repeatedly:

```bash
npm run lint
npm run build
```

Worker syntax passed:

```bash
node --check worker/server.js
```

### Live Route Checks

Passed:

```text
GET https://yt1s-azure.vercel.app/youtube-video-downloader -> 200
GET https://yt1s-azure.vercel.app/robots.txt -> 200
GET https://yt1s-azure.vercel.app/sitemap.xml -> 200
GET https://yt1s-production.up.railway.app/health -> ok
```

### Live Download Tests

Successfully downloaded and uploaded this video multiple times:

```text
https://youtu.be/RpJ4UWDjyeU?si=3bb967uTda6GO8k8
```

Successful final result example:

```json
{
  "status": "completed",
  "title": "SAMANID EMPIRE: The Rise & Fall of Persia's Forgotten Golden Age",
  "quality": "360p",
  "duration": 869,
  "bytes": 52245799,
  "downloadUrl": "https://res.cloudinary.com/wsbtywle/video/upload/..."
}
```

## Known Issues / Not Fully Working

### Reliability of YouTube Downloads

Downloads work after adding cookies and challenge handling, but YouTube can still rate-limit or block Railway IPs. This is an external platform issue.

If failures return:

- Refresh `YOUTUBE_COOKIES_B64` with fresh cookies.
- Use a burner YouTube account for cookies.
- Consider residential proxy support.
- Consider moving worker to a VPS/IP with better reputation.

### Cookies Security

YouTube cookies are sensitive. They are stored only in Railway env as `YOUTUBE_COOKIES_B64`, not in GitHub.

Do not commit:

```text
youtube-cookies.txt
YOUTUBE_COOKIES_B64
```

### MP3 Conversion

The UI says audio/M4A. True MP3 conversion is not fully implemented as a separate conversion flow. Current worker uses best audio and `m4a` extension for `quality=audio`.

Next agent can add explicit MP3 conversion by downloading audio and running ffmpeg manually:

```bash
ffmpeg -i input -vn -codec:a libmp3lame -b:a 192k output.mp3
```

### 1080p/4K Large Files

Worker supports 1080p selector, but Cloudinary limits/Railway time/memory and YouTube throttling can still fail on large files.

Current file size limit:

```env
MAX_FILE_MB=500
```

Current max duration:

```env
MAX_DURATION_SECONDS=1800
```

### Tool Pages Are Not All Fully Functional

Some pages are UI/template/metadata-oriented and not connected to real APIs yet:

- Profile downloader
- Banner downloader
- Tag extractor with official YouTube tags
- Description extractor
- Video summary
- Transcript generator
- Subtitle downloader
- Monetization checker
- Channel ID finder
- Playlist length calculator

They have pages and forms, but need YouTube Data API or a transcript provider for real data.

### OpenAI/AI Features

OpenAI was intentionally skipped per user instruction. Current title/description/tag/script tools are template-based only.

## Useful Commands

### Local Frontend

```bash
npm install
npm run dev
npm run lint
npm run build
```

### Deploy Vercel

```bash
vercel --prod --yes
```

### Deploy Railway Worker

```bash
railway up --service yt1s --environment production --detach --message "deploy worker"
```

### Railway Health

```bash
curl https://yt1s-production.up.railway.app/health
```

### Test Download Through Vercel

PowerShell example:

```powershell
$body = @{ url = 'https://youtu.be/RpJ4UWDjyeU?si=3bb967uTda6GO8k8'; quality = '360p' } | ConvertTo-Json -Compress
$start = Invoke-RestMethod -Uri "https://yt1s-azure.vercel.app/api/worker-download" -Method Post -ContentType "application/json" -Body $body
$start
Invoke-RestMethod -Uri "https://yt1s-azure.vercel.app/api/worker-download?jobId=$($start.jobId)"
```

## Recent Important Commits

```text
3b15807 Make worker auth optional
ac1f30e Enable YouTube JS challenge handling
35503c0 Harden YouTube worker extraction
aa1cc8b Fix dynamic tool pages on Next 16
29f576d Polish downloader UX and secure worker fallback
66973d5 Force Railway Docker build
130a043 Use Docker worker on Railway
a1fb913 Add Railway download worker
```

## Recommended Next Steps

1. Add real MP3 conversion in worker.
2. Add proper download progress/events instead of polling only status strings.
3. Add rate limiting to Vercel `/api/worker-download` route.
4. Add automatic cleanup policy in Cloudinary or scheduled cleanup job.
5. Add real YouTube Data API support for channel/profile/banner/tag/description/playlist tools.
6. Add transcript provider integration.
7. Add better error messages in UI for YouTube 429/cookie expiration.
8. Consider proxy support for yt-dlp if Railway IP gets blocked again.
9. Add custom domain `yt1s.video` in Vercel when DNS is ready.
10. Replace placeholder contact text with real support email.
