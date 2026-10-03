import Link from "next/link";
import Image from "next/image";
import { brand } from "../lib/tools";

const headerLinks = [
  ["/yt1s-youtube-downloader", "YT1s Downloader"],
  ["/youtube-to-mp4", "YouTube to MP4"],
  ["/youtube-mp4-downloader", "MP4 Downloader"],
  ["/youtube-audio-downloader", "Audio"],
  ["/youtube-shorts-downloader", "Shorts"],
  ["/blog", "Blog"]
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/icon.svg" alt="yt1s.video logo" width={48} height={48} priority className="h-12 w-12 rounded-2xl shadow-glow" />
          <span>
            <span className="block font-display text-lg font-black tracking-tight text-ink dark:text-white">{brand.name}</span>
            <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">YT downloader, no clutter</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300 lg:flex">
          {headerLinks.map(([href, label]) => (
            <Link key={href} href={href} className="hover:text-flame">
              {label}
            </Link>
          ))}
        </nav>
        <Link href="/youtube-video-downloader" className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white shadow-lg shadow-gray-300 transition hover:bg-flame dark:bg-white dark:text-ink dark:shadow-none dark:hover:bg-flame dark:hover:text-white">
          Start Free
        </Link>
      </div>
    </header>
  );
}
