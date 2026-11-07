#!/bin/sh
# Starts the PO-token provider and, best effort, a free Cloudflare WARP tunnel that exposes an HTTP proxy
# on 127.0.0.1:40000 (userspace WireGuard via wireproxy, so no TUN device or root privileges are needed).
# If WARP cannot be set up the worker simply runs without it.
node /opt/bgutil-ytdlp-pot-provider/server/build/main.js >/tmp/bgutil.log 2>&1 &

if [ "${WARP_ENABLED:-true}" = "true" ]; then
  (
    mkdir -p /tmp/warp && cd /tmp/warp || exit 0
    if [ -n "$WGCF_ACCOUNT_B64" ]; then printf '%s' "$WGCF_ACCOUNT_B64" | base64 -d > wgcf-account.toml; fi
    [ -f wgcf-account.toml ] || timeout 30 wgcf register --accept-tos >/tmp/warp/register.log 2>&1
    timeout 30 wgcf generate >>/tmp/warp/register.log 2>&1 || { echo "warp: wgcf failed"; exit 0; }
    {
      sed -n '/^\[Interface\]/,/^\[Peer\]/{/^\[Peer\]/!p}' wgcf-profile.conf | grep -v '^DNS'
      sed -n '/^\[Peer\]/,$p' wgcf-profile.conf
      printf '\n[http]\nBindAddress = 127.0.0.1:40000\n'
    } > wireproxy.conf
    wireproxy -c wireproxy.conf >/tmp/warp/wireproxy.log 2>&1 &
    echo "warp: wireproxy started"
  ) &
  # The tunnel needs a few seconds to register; the worker checks it lazily before each job.
  export WARP_PROXY=http://127.0.0.1:40000
  # One-line status for the logs (no keys): did registration work and does the trace report WARP?
  ( sleep 20; echo "warp status: $(curl -s -m 6 -x http://127.0.0.1:40000 https://www.cloudflare.com/cdn-cgi/trace 2>&1 | grep -E '^(warp|ip)=' | tr '
' ' ') | register: $(tail -c 160 /tmp/warp/register.log 2>/dev/null | tr '
' ' ') | wireproxy: $(tail -c 200 /tmp/warp/wireproxy.log 2>/dev/null | tr '
' ' ')" ) &
fi

exec npm start
