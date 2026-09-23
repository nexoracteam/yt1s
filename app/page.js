import { DownloadCloud, Gauge, Globe2, ShieldCheck } from "lucide-react";
import ToolClient from "../components/ToolClient";
import { FAQ, HowItWorks, Pricing, ToolDirectory } from "../components/Sections";
import { brand, tools } from "../lib/tools";

export default function Home() {
  const mainTool = tools["youtube-video-downloader"];
  return (
    <main>
      <section className="relative overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="font-black uppercase tracking-[0.35em] text-flame">YouTube downloader and creator utilities</p>
          <h1 className="mt-5 font-display text-5xl font-black tracking-tight text-ink dark:text-white sm:text-7xl">
            Turn YouTube links into useful assets with {brand.name}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">{brand.description}</p>
        </div>
        <div className="mt-10"><ToolClient tool={mainTool} /></div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 text-center md:grid-cols-4">
          {[["Fast Downloads", DownloadCloud], ["Secure Links", ShieldCheck], ["20+ Tools", Globe2], ["Smooth UX", Gauge]].map(([item, Icon]) => (
            <div key={item} className="rounded-3xl bg-white p-5 font-black text-ink shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:text-white dark:shadow-none"><Icon className="mx-auto mb-3 h-5 w-5 text-flame" />{item}</div>
          ))}
        </div>
      </section>
      <HowItWorks />
      <ToolDirectory />
      <Pricing />
      <FAQ />
    </main>
  );
}
