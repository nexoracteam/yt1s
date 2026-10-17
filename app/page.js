import Link from "next/link";
import { DownloadCloud, Gauge, Globe2, ShieldCheck } from "lucide-react";
import JsonLd from "../components/JsonLd";
import { SeoContent } from "../components/SeoContent";
import ToolClient from "../components/ToolClient";
import { FAQ, HowItWorks, Pricing, ToolDirectory } from "../components/Sections";
import { brand, priorityToolSlugs, tools } from "../lib/tools";
import { faqSchema, toolsItemListSchema } from "../lib/seo";

export default function Home() {
  const mainTool = tools["youtube-video-downloader"];
  const priorityTools = priorityToolSlugs.map((slug) => ({ slug, ...tools[slug] }));
  return (
    <main>
      <JsonLd data={[faqSchema(), toolsItemListSchema()]} />
      <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-black uppercase tracking-[0.35em] text-flame">YouTube downloader and creator utilities</p>
          <h1 className="mt-5 font-display text-5xl font-black tracking-tight text-ink dark:text-white sm:text-7xl">
            YT1s YouTube Downloader
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            Save public YouTube videos and Shorts as MP4 or M4A audio with {brand.name}. Choose up to 1080p when available. No signup required.
          </p>
        </div>
        <div className="mt-10"><ToolClient tool={mainTool} /></div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[["Fast Downloads", DownloadCloud], ["Direct Links", ShieldCheck], ["20+ Tools", Globe2], ["Smooth UX", Gauge]].map(([item, Icon]) => (
            <div key={item} className="rounded-3xl bg-white p-5 font-black text-ink shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:text-white dark:shadow-none"><Icon className="mx-auto mb-3 h-5 w-5 text-flame" />{item}</div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
          <h2 className="text-3xl font-black tracking-tight text-ink dark:text-white">Choose a format before downloading</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Choose MP4 for video or M4A for audio only. Start with 720p for a balance of detail and file size, or select 360p for a smaller download. Available quality depends on the source; MP3 and 4K output are not currently supported.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
          <div className="max-w-3xl">
            <p className="font-black uppercase tracking-[0.28em] text-flame">Popular downloader links</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white">Choose what you want to save</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
              Download a video, save its audio, process a Short, or get a thumbnail using the tools below.
            </p>
          </div>
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
      <SeoContent tool={mainTool} home />
      <ToolDirectory />
      <Pricing />
      <FAQ />
    </main>
  );
}
