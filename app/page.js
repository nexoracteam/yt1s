import { DownloadCloud, Gauge, Globe2, ShieldCheck } from "lucide-react";
import AdSlot from "../components/AdSlot";
import JsonLd from "../components/JsonLd";
import ToolClient from "../components/ToolClient";
import { FAQ, HowItWorks, Pricing, ToolDirectory } from "../components/Sections";
import { brand, tools } from "../lib/tools";
import { faqSchema, toolsItemListSchema } from "../lib/seo";

export default function Home() {
  const mainTool = tools["youtube-video-downloader"];
  return (
    <main>
      <JsonLd data={[faqSchema(), toolsItemListSchema()]} />
      <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-black uppercase tracking-[0.35em] text-flame">YouTube downloader and creator utilities</p>
          <h1 className="mt-5 font-display text-5xl font-black tracking-tight text-ink dark:text-white sm:text-7xl">
            YouTube Video Downloader for HD, Shorts, 4K-ready links and audio
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">
            {brand.name} is a fast yt downloader for public videos, a short downloader for YouTube Shorts, and a clean video downloader for MP4, M4A, full HD and 4K-ready workflows.
          </p>
        </div>
        <div className="mt-10"><ToolClient tool={mainTool} /></div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[["Fast Downloads", DownloadCloud], ["Direct Links", ShieldCheck], ["20+ Tools", Globe2], ["Smooth UX", Gauge]].map(([item, Icon]) => (
            <div key={item} className="rounded-3xl bg-white p-5 font-black text-ink shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:text-white dark:shadow-none"><Icon className="mx-auto mb-3 h-5 w-5 text-flame" />{item}</div>
          ))}
        </div>
      </section>
      <AdSlot className="pb-4" />
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
          <h2 className="text-3xl font-black tracking-tight text-ink dark:text-white">Fast yt video downloader with a no-clutter workflow</h2>
          <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Use yt1s.video as a youtube video downloader, yt video downloader, yt short downloader, full HD video downloader or 4K video downloader for public content. The tool keeps ad placeholders away from the form so the download journey remains focused.
          </p>
        </div>
      </section>
      <HowItWorks />
      <ToolDirectory />
      <AdSlot label="Sponsored placement" />
      <Pricing />
      <FAQ />
    </main>
  );
}
