import Link from "next/link";
import { brand, toolCategories } from "../lib/tools";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-flame to-ember font-black text-white shadow-glow">Y</span>
          <span>
            <span className="block font-display text-lg font-black tracking-tight text-ink dark:text-white">{brand.name}</span>
            <span className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">YouTube tools, no clutter</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-gray-700 dark:text-gray-300 lg:flex">
          {toolCategories.map((category) => (
            <Link key={category.title} href={category.href} className="hover:text-flame">
              {category.title}
            </Link>
          ))}
          <Link href="/#pricing" className="hover:text-flame">Pricing</Link>
          <Link href="/blog" className="hover:text-flame">Blog</Link>
        </nav>
        <Link href="/youtube-video-downloader" className="rounded-full bg-ink px-5 py-2 text-sm font-bold text-white shadow-lg shadow-gray-300 transition hover:bg-flame dark:bg-white dark:text-ink dark:shadow-none dark:hover:bg-flame dark:hover:text-white">
          Start Free
        </Link>
      </div>
    </header>
  );
}
