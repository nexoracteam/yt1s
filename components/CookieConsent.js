"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

const storageKey = "yt1s-cookie-consent";

function updateGoogleConsent(value) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  const granted = value === "all" ? "granted" : "denied";
  window.gtag("consent", "update", {
    analytics_storage: granted
  });
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try { updateGoogleConsent(JSON.parse(saved).value); } catch {}
      }
      setVisible(!saved);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function save(value) {
    localStorage.setItem(storageKey, JSON.stringify({ value, savedAt: new Date().toISOString() }));
    updateGoogleConsent(value);
    window.dispatchEvent(new CustomEvent("yt1s-cookie-consent", { detail: { value } }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[80] px-3 pb-3 sm:px-6 sm:pb-4">
      <div className="mx-auto max-w-5xl rounded-2xl border border-orange-200 bg-white p-3 shadow-2xl shadow-orange-200/50 dark:border-white/10 dark:bg-zinc-950 dark:shadow-black/60 sm:flex sm:items-center sm:gap-5">
        <div className="flex gap-3">
          <div className="mt-1 hidden h-10 w-10 shrink-0 sm:grid place-items-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-ink dark:text-white">Cookie consent</h2>
            <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-300 sm:text-sm sm:leading-6">
              We use essential storage for your preferences, analytics after approval, and an advertising partner (Monetag) that may set its own cookies to show ads. Read our <Link href="/cookie-policy" className="font-bold text-flame">Cookie Policy</Link> and <Link href="/privacy" className="font-bold text-flame">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        <div className="mt-3 flex shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:mt-0">
          <button type="button" onClick={() => save("essential")} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-black text-gray-700 hover:border-flame hover:text-flame dark:border-white/10 dark:text-gray-200">
            Essential only
          </button>
          <button type="button" onClick={() => save("all")} className="rounded-xl bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 text-sm font-black text-white shadow-lg shadow-red-500/20">
            Accept all
          </button>
          <button type="button" aria-label="Close cookie notice" onClick={() => save("dismissed")} className="grid h-10 w-10 place-items-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
