#!/bin/sh
# Starts the PO-token provider and, best effort, the free Cloudflare WARP tunnel (see warp.sh).
# If WARP cannot be set up the worker simply runs without it.
node /opt/bgutil-ytdlp-pot-provider/server/build/main.js >/tmp/bgutil.log 2>&1 &

if [ "${WARP_ENABLED:-true}" = "true" ]; then
  sh /app/warp.sh &
  # The tunnel needs a few seconds to register; the worker checks it lazily before each job.
  export WARP_PROXY=http://127.0.0.1:40000
  # One-line status for the logs (no keys).
  ( sleep 20; echo "warp status: $(curl -s -m 6 -x http://127.0.0.1:40000 https://www.cloudflare.com/cdn-cgi/trace 2>&1 | grep -E '^(warp|ip)=' | tr '\n' ' ')" ) &
fi

exec npm start
