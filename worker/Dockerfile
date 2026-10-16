FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates git \
  && pip3 install --break-system-packages --no-cache-dir "yt-dlp[default] @ git+https://github.com/yt-dlp/yt-dlp.git@897341241f2bfb2439fe0367f4c7c9ccd29a3828" "bgutil-ytdlp-pot-provider==2.0.2" \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch 2.0.2 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /opt/bgutil-ytdlp-pot-provider \
  && cd /opt/bgutil-ytdlp-pot-provider/server \
  && npm ci \
  && npx tsc

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

ENV NODE_ENV=production
CMD ["sh", "-c", "node /opt/bgutil-ytdlp-pot-provider/server/build/main.js >/tmp/bgutil.log 2>&1 & sleep 2; exec npm start"]
