FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates git curl procps \
  && pip3 install --break-system-packages --no-cache-dir "yt-dlp[default] @ git+https://github.com/yt-dlp/yt-dlp.git@897341241f2bfb2439fe0367f4c7c9ccd29a3828" "bgutil-ytdlp-pot-provider==2.0.2" \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 --branch 2.0.2 https://github.com/Brainicism/bgutil-ytdlp-pot-provider.git /opt/bgutil-ytdlp-pot-provider \
  && cd /opt/bgutil-ytdlp-pot-provider/server \
  && npm ci \
  && npx tsc

# Free Cloudflare WARP via userspace WireGuard: wgcf creates the WARP profile, wireproxy exposes it as an HTTP proxy.
RUN curl -fsSL --retry 6 --retry-all-errors --retry-delay 4 -o /usr/local/bin/wgcf https://github.com/ViRb3/wgcf/releases/download/v2.3.1/wgcf_2.3.1_linux_amd64   && chmod +x /usr/local/bin/wgcf   && curl -fsSL --retry 6 --retry-all-errors --retry-delay 4 https://github.com/pufferffish/wireproxy/releases/download/v1.0.9/wireproxy_linux_amd64.tar.gz | tar -xz -C /usr/local/bin wireproxy

WORKDIR /app
COPY worker/package*.json ./
RUN npm ci --omit=dev
COPY worker/ ./

ENV NODE_ENV=production
CMD ["sh", "/app/start.sh"]
