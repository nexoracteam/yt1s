import Link from "next/link";
import { ArrowRight, Headphones, Image as ImageIcon, MonitorSmartphone, ShieldCheck, Smartphone, Video } from "lucide-react";
import JsonLd from "../components/JsonLd";
import { SeoContent } from "../components/SeoContent";
import ToolClient from "../components/ToolClient";
import { FAQ, HowItWorks, ToolDirectory } from "../components/Sections";
import { allBlogSlugs, blogPosts } from "../lib/blog";
import { brand, priorityToolSlugs, tools } from "../lib/tools";
import { faqSchema, toolsItemListSchema } from "../lib/seo";

const quickLinks = [
  ["/youtube-to-mp4", "YouTube to MP4", Video],
  ["/youtube-audio-downloader", "Audio M4A", Headphones],
  ["/youtube-shorts-downloader", "Shorts", Smartphone],
  ["/youtube-thumbnail-downloader", "Thumbnails", ImageIcon],
  ["/youtube-1080p-downloader", "1080p Full HD", MonitorSmartphone]
];

const trust = [
  ["Up to 1080p", "MP4 video with sound, when the source offers it"],
  ["No signup", "Paste a link and go. No account, no extension"],
  ["Streams to you", "Files are not stored on our servers"],
  ["Phone friendly", "Works in Safari on iPhone and Chrome on Android"]
];

const alsoSearched = ["yt1s", "yts1", "yst1", "y1ts", "yt1", "yt1s mp4", "yt1s video downloader"];

export default function Home() {
  const mainTool = tools["youtube-video-downloader"];
  const priorityTools = priorityToolSlugs.map((slug) => ({ slug, ...tools[slug] }));
  const latest = allBlogSlugs().map((slug) => blogPosts[slug])
    .sort((a, b) => b.dateModified.localeCompare(a.dateModified)).slice(0, 3);
  return (
    <main>
      <JsonLd data={[faqSchema(), toolsItemListSchema()]} />
      <section className="relative overflow-hidden px-4 pb-14 pt-10 text-center sm:px-6 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-4xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-flame dark:border-white/10 dark:bg-white/5">
            <ShieldCheck className="h-4 w-4" /> Free · No signup · No popups
          </p>
          <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">
            YT1s YouTube Video Downloader
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg sm:leading-8">
            Paste a public YouTube link, pick a quality and save it as MP4 or M4A audio with {brand.name}. Up to 1080p when available.
          </p>
        </div>
        <div className="mt-8"><ToolClient tool={mainTool} /></div>
        <nav aria-label="Popular downloaders" className="mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {quickLinks.map(([href, label, Icon]) => (
            <Link key={href} href={href} className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm hover:border-flame hover:text-flame dark:border-white/10 dark:bg-zinc-900 dark:text-white">
              <Icon className="h-4 w-4 text-flame" />{label}
            </Link>
          ))}
        </nav>
        <p className="mx-auto mt-5 max-w-3xl text-xs leading-6 text-gray-500 dark:text-gray-400">
          Also searched as: {alsoSearched.join(", ")}. yt1s.video is an independent service, not affiliated with YouTube or other sites with similar names.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {trust.map(([title, body]) => (
            <div key={title} className="rounded-3xl bg-white p-5 shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:shadow-none">
              <div className="font-black text-ink dark:text-white">{title}</div>
              <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
          <p className="font-black uppercase tracking-[0.28em] text-flame">Popular downloader links</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white">Choose what you want to save</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {priorityTools.map((tool) => (
              <Link key={tool.slug} href={`/${tool.slug}`} className="group rounded-3xl bg-orange-50 p-5 transition hover:-translate-y-1 hover:bg-flame hover:shadow-xl hover:shadow-orange-200/70 dark:bg-zinc-800 dark:hover:bg-flame">
                <h3 className="font-black text-orange-950 group-hover:text-white dark:text-orange-50">{tool.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-6 text-orange-900/80 group-hover:text-white/90 dark:text-orange-100/80">{tool.summary}</p>
                <span className="mt-4 inline-flex text-xs font-black text-flame group-hover:text-white">Open tool →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-black uppercase tracking-[0.28em] text-flame">Guides</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white">Help for phones, formats and errors</h2>
          </div>
          <Link href="/blog" className="hidden items-center gap-2 text-sm font-black text-flame sm:inline-flex">All guides <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {latest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group rounded-3xl border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/60 hover:-translate-y-1 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-flame">{post.readingTime}</p>
              <h3 className="mt-3 text-lg font-black text-ink group-hover:text-flame dark:text-white">{post.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{post.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <SeoContent tool={mainTool} home />
      <ToolDirectory />
      <FAQ />
    </main>
  );
}
