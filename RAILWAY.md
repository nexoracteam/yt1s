# Railway Worker Setup

This repo contains two services:

- Vercel frontend/API: repo root
- Railway download worker: `worker/`

## Railway GitHub Repo Not Showing

If `nexoracteam/yt1s` does not show in Railway after logging in with GitHub:

1. Go to GitHub settings.
2. Open `Settings > Applications > Authorized OAuth Apps`.
3. Open Railway.
4. Grant access to the `nexoracteam` organization or specifically to `nexoracteam/yt1s`.
5. If Railway still does not show it, remove the Railway GitHub authorization and connect GitHub again from Railway.
6. Make sure your GitHub user has admin/write access to `nexoracteam/yt1s`.

## Deploy Worker on Railway

1. Create a new Railway project from GitHub repo `nexoracteam/yt1s`.
2. Railway should detect the root `Dockerfile` automatically.
3. The root `Dockerfile` builds the `worker/` service only.
4. Add environment variables:

```env
CLOUDINARY_URL=cloudinary://...
WORKER_SECRET=use-a-long-random-secret
MAX_DURATION_SECONDS=1800
MAX_FILE_MB=500
```

5. Deploy.
6. Open the Railway service domain. Health check should return:

```txt
/health
```

## Connect Vercel to Railway

Add these Vercel environment variables to the `yt1s` project:

```env
DOWNLOAD_WORKER_URL=https://your-railway-service.up.railway.app
WORKER_SECRET=same-secret-as-railway
```

Redeploy Vercel after adding the variables.

## Flow

1. User starts download on Vercel frontend.
2. Vercel calls Railway `/download` with `WORKER_SECRET`.
3. Railway runs `yt-dlp` and `ffmpeg`.
4. Worker uploads the file to Cloudinary.
5. Frontend polls `/job/:id` and shows the Cloudinary download link.
