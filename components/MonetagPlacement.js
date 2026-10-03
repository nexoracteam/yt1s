"use client";

import { useEffect, useRef } from "react";

const consentKey = "yt1s-cookie-consent";
const zones = {
  top: process.env.NEXT_PUBLIC_MONETAG_ZONE_TOP || "11939387",
  mid: process.env.NEXT_PUBLIC_MONETAG_ZONE_MID || "11939388",
  left: process.env.NEXT_PUBLIC_MONETAG_ZONE_LEFT || "11939390",
  right: process.env.NEXT_PUBLIC_MONETAG_ZONE_RIGHT || "11939395"
};

function zoneForSlot(slot) {
  const value = String(slot || "");
  if (value.includes("left-sidebar")) return zones.left;
  if (value.includes("right-sidebar")) return zones.right;
  if (value.includes("mid") || value.includes("bottom")) return zones.mid;
  return zones.top;
}

function hasAdConsent() {
  try {
    return JSON.parse(localStorage.getItem(consentKey) || "null")?.value === "all";
  } catch { return false; }
}

function safeScriptSrc(value) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : "";
  } catch { return ""; }
}

function placementScriptSrc(src, slot) {
  try {
    const url = new URL(src);
    url.searchParams.set("yt1s_slot", slot || "ad");
    return url.href;
  } catch { return src; }
}

function isVisiblePlacement(root) {
  const rect = root.getBoundingClientRect();
  const style = getComputedStyle(root);
  const aside = root.closest("aside");
  const asideStyle = aside ? getComputedStyle(aside) : null;
  return rect.width > 0 && rect.height > 0
    && style.display !== "none"
    && style.visibility !== "hidden"
    && (!asideStyle || (asideStyle.display !== "none" && asideStyle.visibility !== "hidden"));
}

function containInjectedFrames(root) {
  if (root.querySelector("iframe")) return;
  for (const frame of document.querySelectorAll("iframe")) {
    if (frame.closest('[data-monetag-placement="true"]')) continue;
    const rect = frame.getBoundingClientRect();
    const style = getComputedStyle(frame);
    const looksLikeOverlay = style.position === "fixed"
      && rect.width > window.innerWidth * 0.7
      && rect.height > window.innerHeight * 0.5
      && Number(style.zIndex || 0) > 100000;
    if (!looksLikeOverlay) continue;
    frame.removeAttribute("style");
    frame.className = "h-full min-h-24 w-full border-0";
    frame.style.position = "static";
    frame.style.inset = "auto";
    frame.style.zIndex = "auto";
    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.minHeight = "96px";
    frame.style.border = "0";
    root.appendChild(frame);
  }
}

export default function MonetagPlacement({ slot, size }) {
  const ref = useRef(null);

  useEffect(() => {
    function loadPlacement() {
      const root = ref.current;
      const zone = zoneForSlot(slot);
      const src = safeScriptSrc(process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC || process.env.NEXT_PUBLIC_MONETAG_SRC || "https://n6wxm.com/vignette.min.js");
      if (!root || !src || !zone || root.dataset.loaded === "true" || !hasAdConsent() || !isVisiblePlacement(root)) return;
      root.dataset.loaded = "true";
      const script = document.createElement("script");
      script.async = true;
      script.dataset.cfasync = "false";
      script.dataset.zone = zone;
      script.src = placementScriptSrc(src, slot);
      script.referrerPolicy = "no-referrer-when-downgrade";
      const delay = String(slot).includes("sidebar") ? 6000 : 1500;
      window.setTimeout(() => {
        if (!isVisiblePlacement(root)) { root.dataset.loaded = ""; return; }
        root.appendChild(script);
        const observer = new MutationObserver(() => containInjectedFrames(root));
        observer.observe(document.documentElement, { childList: true, subtree: true });
        const interval = window.setInterval(() => containInjectedFrames(root), 500);
        window.setTimeout(() => { observer.disconnect(); window.clearInterval(interval); containInjectedFrames(root); }, 12000);
      }, 2000);
    }

    loadPlacement();
    window.addEventListener("yt1s-cookie-consent", loadPlacement);
    window.addEventListener("resize", loadPlacement);
    return () => {
      window.removeEventListener("yt1s-cookie-consent", loadPlacement);
      window.removeEventListener("resize", loadPlacement);
    };
  }, [slot]);

  return (
    <div
      ref={ref}
      className="min-h-24 w-full"
      data-monetag-placement="true"
      data-monetag-slot={slot}
      data-monetag-size={size}
    />
  );
}
