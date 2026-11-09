#!/bin/sh
# (Re)builds the free Cloudflare WARP tunnel. A fresh wgcf registration gives a fresh identity and usually a
# different exit IP, so running this again is how a blocked WARP IP is rotated.
# Exposes an HTTP proxy on 127.0.0.1:40000 using userspace WireGuard (wireproxy), no root or TUN needed.
mkdir -p /tmp/warp && cd /tmp/warp || exit 1
pkill wireproxy 2>/dev/null; sleep 1
rm -f wgcf-account.toml wgcf-profile.conf wireproxy.conf
timeout 30 wgcf register --accept-tos >register.log 2>&1
timeout 30 wgcf generate >>register.log 2>&1 || { echo "warp: wgcf failed"; exit 1; }
{
  sed -n '/^\[Interface\]/,/^\[Peer\]/{/^\[Peer\]/!p}' wgcf-profile.conf
  sed -n '/^\[Peer\]/,$p' wgcf-profile.conf
  printf '\n[http]\nBindAddress = 127.0.0.1:40000\n'
} > wireproxy.conf
nohup wireproxy -c wireproxy.conf >wireproxy.log 2>&1 &
echo "warp: wireproxy started"
