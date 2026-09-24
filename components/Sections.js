import Link from "next/link";
import { ArrowRight, BadgeCheck, DownloadCloud, Layers3, ShieldCheck, Zap } from "lucide-react";
import { toolCategories, tools } from "../lib/tools";
import Reveal from "./Reveal";

export function HowItWorks() {
  const steps = [
    ["01", "Paste a URL", "Drop in a public YouTube video, Short, channel, playlist, or creator topic."],
    ["02", "Pick Your Format", "Choose 360p, 480p, 720p, 1080p, audio, thumbnails or creator tools."],
    ["03", "Save the Result", "Open the direct stream download, copy metadata, or use the generated creator asset instantly."]
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="font-black uppercase tracking-[0.3em] text-flame">How it works</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-ink dark:text-white">From URL to download-ready links</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map(([number, title, body]) => (
          <Reveal key={number} className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
            <div className="text-5xl font-black text-orange-100">{number}</div>
            <h3 className="mt-4 text-xl font-black text-ink dark:text-white">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function FeatureGrid({ tool }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tool.features.map((feature, index) => (
          <div key={feature} className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:shadow-none">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-flame dark:bg-flame/10">{[<Zap key="z" />, <ShieldCheck key="s" />, <DownloadCloud key="d" />, <BadgeCheck key="b" />][index % 4]}</div>
            <h3 className="font-black text-ink dark:text-white">{feature}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Built into the {tool.title} workflow with a fast, mobile-friendly interface.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ToolDirectory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="font-black uppercase tracking-[0.3em] text-flame">All Tools</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-ink dark:text-white">Everything yt1s.video includes</h2>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-4">
        {toolCategories.map((category) => (
          <div key={category.title} className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none">
            <h3 className="text-xl font-black text-ink dark:text-white">{category.title}</h3>
            <div className="mt-5 space-y-3">
              {category.tools.map((slug) => (
                <Link key={slug} href={`/${slug}`} className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-flame hover:text-white dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-flame">
                  {tools[slug].title}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Pricing() {
  const plans = [
    ["Fast", "Direct", "Paste a link and prepare public video, Shorts, full HD and audio downloads without clutter."],
    ["Secure", "Stream", "Prepared links stream to your device with no account required and no video file kept on local server disk."],
    ["Creator", "Toolkit", "Use downloader, SEO, thumbnails, timestamps, and analytics tools from one polished workspace."]
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(([name, price, text]) => (
          <div key={name} className="rounded-[2rem] bg-ink p-8 text-white shadow-2xl shadow-gray-300">
            <h3 className="text-2xl font-black">{name}</h3>
            <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange-200">{name === "Fast" ? <Zap /> : name === "Secure" ? <ShieldCheck /> : <Layers3 />}</div>
            <div className="mt-4 text-4xl font-black text-orange-200">{price}</div>
            <p className="mt-4 text-sm leading-6 text-gray-300">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FAQ() {
  const questions = [
    ["Is yt1s.video free to use?", "Yes. Core downloader, thumbnail, timestamp, and creator tools are available without account signup."],
    ["Which formats are supported?", "Supported public videos can be prepared as MP4 video or M4A audio, with available quality depending on the source."],
    ["Can I use this as a YouTube Shorts downloader?", "Yes. Paste a public Shorts URL and choose a video or audio format when source delivery is available."],
    ["Is this a youtube video downloader no ads workflow?", "The main downloader flow stays clean and focused. Ad placeholders are reserved outside the form area."],
    ["Can I download thumbnails?", "Yes. MaxRes, standard, high, medium, and default YouTube thumbnail sizes are available instantly."],
    ["What content can I download?", "Only download content you own, have permission to use, or are legally allowed to access." ]
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center text-4xl font-black text-ink dark:text-white">Frequently asked questions</h2>
      <div className="mt-10 space-y-4">
        {questions.map(([q, a]) => (
          <details key={q} className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70 dark:bg-zinc-900 dark:shadow-none">
            <summary className="cursor-pointer font-black text-ink dark:text-white">{q}</summary>
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
