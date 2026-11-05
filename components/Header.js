"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { brand, navGroups, tools } from "../lib/tools";

const quickLinks = [
  ["/youtube-to-mp4", "MP4"],
  ["/youtube-audio-downloader", "Audio"],
  ["/youtube-shorts-downloader", "Shorts"]
];

function Dropdown({ group, open, onToggle, onClose }) {
  return (
    <div className="relative" onMouseEnter={() => onToggle(group.title, true)} onMouseLeave={onClose}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => onToggle(group.title)}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold hover:bg-orange-50 hover:text-flame dark:hover:bg-white/10 ${open ? "bg-orange-50 text-flame dark:bg-white/10" : "text-gray-700 dark:text-gray-300"}`}
      >
        {group.title}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-2">
          <ul className="w-72 rounded-2xl border border-orange-100 bg-white p-2 shadow-2xl shadow-orange-100/80 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
            {group.items.map((slug) => (
              <li key={slug}>
                <Link href={`/${slug}`} onClick={onClose} className="block rounded-xl px-3 py-2 text-sm font-semibold text-ink hover:bg-orange-50 hover:text-flame dark:text-gray-100 dark:hover:bg-white/10">
                  {tools[slug].title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState("");
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef(null);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobile]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") { setOpenGroup(""); setMobile(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggle(title, hover) {
    clearTimeout(closeTimer.current);
    setOpenGroup((current) => (hover ? title : current === title ? "" : title));
  }
  function closeSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenGroup(""), 120);
  }

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${brand.name} home`}>
          <Image src="/icon.svg" alt="" width={44} height={44} priority className="h-11 w-11 rounded-2xl shadow-glow" />
          <span className="font-display text-lg font-black tracking-tight text-ink dark:text-white">{brand.name}</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {quickLinks.map(([href, label]) => (
            <Link key={href} href={href} className={`rounded-full px-3 py-2 text-sm font-bold hover:bg-orange-50 hover:text-flame dark:hover:bg-white/10 ${pathname === href ? "text-flame" : "text-gray-700 dark:text-gray-300"}`}>{label}</Link>
          ))}
          {navGroups.map((group) => (
            <Dropdown key={group.title} group={group} open={openGroup === group.title} onToggle={toggle} onClose={closeSoon} />
          ))}
          <Link href="/blog" className={`rounded-full px-3 py-2 text-sm font-bold hover:bg-orange-50 hover:text-flame dark:hover:bg-white/10 ${pathname.startsWith("/blog") ? "text-flame" : "text-gray-700 dark:text-gray-300"}`}>Guides</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/" className="hidden rounded-full bg-gradient-to-r from-red-500 to-pink-600 px-5 py-2 text-sm font-black text-white shadow-lg shadow-red-500/20 hover:-translate-y-0.5 sm:inline-flex">
            Download video
          </Link>
          <button
            type="button"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            onClick={() => setMobile((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-xl border border-orange-100 text-ink dark:border-white/10 dark:text-white lg:hidden"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

    </header>
      {mobile && (
        <div onClick={(event) => { if (event.target.closest("a")) setMobile(false); }} className="fixed inset-x-0 bottom-0 top-[69px] z-40 overflow-y-auto bg-white px-4 pb-10 pt-4 dark:bg-zinc-950 lg:hidden">
          <div className="grid grid-cols-3 gap-2">
            {quickLinks.map(([href, label]) => (
              <Link key={href} href={href} className="rounded-2xl bg-orange-50 px-3 py-3 text-center text-sm font-black text-orange-950 dark:bg-zinc-800 dark:text-orange-50">{label}</Link>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {navGroups.map((group) => (
              <details key={group.title} className="group rounded-2xl border border-orange-100 dark:border-white/10">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-black text-ink dark:text-white">
                  {group.title}
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                </summary>
                <ul className="px-2 pb-2">
                  {group.items.map((slug) => (
                    <li key={slug}><Link href={`/${slug}`} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-orange-50 dark:text-gray-200 dark:hover:bg-white/10">{tools[slug].title}</Link></li>
                  ))}
                </ul>
              </details>
            ))}
            <Link href="/blog" className="block rounded-2xl border border-orange-100 px-4 py-3 font-black text-ink dark:border-white/10 dark:text-white">Guides &amp; help</Link>
          </div>
        </div>
      )}
    </>
  );
}
