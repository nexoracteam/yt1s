"use client";

import { useEffect } from "react";

const consentKey = "yt1s-cookie-consent";
const sessionKey = "yt1s-monetag-loaded";
const scriptId = "monetag-controlled-tag";
const provider = process.env.NEXT_PUBLIC_AD_PROVIDER || "placeholder";
const zone = process.env.NEXT_PUBLIC_MONETAG_ZONE || "11939243";
const src = process.env.NEXT_PUBLIC_MONETAG_SRC || "https://n6wxm.com/vignette.min.js";

function hasAdConsent() {
  try {
    return JSON.parse(localStorage.getItem(consentKey) || "null")?.value === "all";
  } catch { return false; }
}

function isDesktopViewport() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function canLoad() {
  return Boolean(provider !== "monetag" && zone && src && isDesktopViewport() && hasAdConsent() && !document.getElementById(scriptId) && !sessionStorage.getItem(sessionKey));
}

function appendTag() {
  if (!canLoad()) return;
  sessionStorage.setItem(sessionKey, "true");
  const script = document.createElement("script");
  script.id = scriptId;
  script.async = true;
  script.dataset.zone = zone;
  script.dataset.cfasync = "false";
  script.src = src;
  script.referrerPolicy = "no-referrer-when-downgrade";
  document.body.appendChild(script);
}

function scheduleTag() {
  if (!canLoad()) return;
  const load = () => window.setTimeout(appendTag, 12000);
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(load, { timeout: 15000 });
  } else {
    load();
  }
}

export default function MonetagControlledTag() {
  useEffect(() => {
    scheduleTag();
    window.addEventListener("yt1s-cookie-consent", scheduleTag);
    window.addEventListener("resize", scheduleTag);
    return () => {
      window.removeEventListener("yt1s-cookie-consent", scheduleTag);
      window.removeEventListener("resize", scheduleTag);
    };
  }, []);

  return null;
}
