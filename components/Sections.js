import Link from "next/link";
import { toolCategories, tools } from "../lib/tools";

export function HowItWorks() {
  const steps = [
    ["01", "Paste a URL", "Drop in a public YouTube video, Shorts, channel, playlist, or a plain topic depending on the tool."],
    ["02", "Process Safely", "Vercel API routes fetch lightweight metadata and only attempt Cloudinary storage when the file is suitable."],
    ["03", "Download or Copy", "Use thumbnails, direct stream links, generated text, calculators, or API-ready metadata outputs instantly."]
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="font-black uppercase tracking-[0.3em] text-flame">How it works</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight text-ink">From URL to results in seconds</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map(([number, title, body]) => (
          <div key={number} className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/70">
            <div className="text-5xl font-black text-orange-100">{number}</div>
            <h3 className="mt-4 text-xl font-black text-ink">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-600">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FeatureGrid({ tool }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {tool.features.map((feature) => (
          <div key={feature} className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-xl font-black text-flame">✓</div>
            <h3 className="font-black text-ink">{feature}</h3>
            <p className="mt-2 text-sm leading-6 text-gray-600">Built into the {tool.title} workflow with a fast, mobile-friendly interface.</p>
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
        <h2 className="mt-3 text-4xl font-black tracking-tight text-ink">Everything yt1s.video includes</h2>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-4">
        {toolCategories.map((category) => (
          <div key={category.title} className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70">
            <h3 className="text-xl font-black text-ink">{category.title}</h3>
            <div className="mt-5 space-y-3">
              {category.tools.map((slug) => (
                <Link key={slug} href={`/${slug}`} className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-flame hover:text-white">
                  {tools[slug].title}
                  <span>→</span>
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
    ["Free", "$0", "All public tools, thumbnails, generators, calculators, and Vercel-safe metadata."],
    ["Cloudinary", "API", "Connect your Cloudinary keys to store supported direct files and return CDN links."],
    ["Pro Backend", "Later", "Add a worker later for ffmpeg merge, long videos, MP3 conversion, and 4K reliability."]
  ];
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map(([name, price, text]) => (
          <div key={name} className="rounded-[2rem] bg-ink p-8 text-white shadow-2xl shadow-gray-300">
            <h3 className="text-2xl font-black">{name}</h3>
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
    ["Does yt1s.video work on Vercel only?", "Yes. The current app is built for Vercel. Heavy downloads are handled with safeguards because serverless functions are limited."],
    ["Why use Cloudinary?", "Cloudinary gives CDN delivery and storage links for supported media without turning Vercel into permanent file storage."],
    ["Is every 1080p or 4K download guaranteed?", "No. Many high quality YouTube formats require merging video and audio with ffmpeg, which is not reliable on Vercel-only hosting."],
    ["Are AI tools active?", "Not yet. The AI/OpenAI part is intentionally left out for now; template tools are included until keys are added."]
  ];
  return (
    <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="text-center text-4xl font-black text-ink">Frequently asked questions</h2>
      <div className="mt-10 space-y-4">
        {questions.map(([q, a]) => (
          <details key={q} className="rounded-3xl bg-white p-6 shadow-xl shadow-orange-100/70">
            <summary className="cursor-pointer font-black text-ink">{q}</summary>
            <p className="mt-3 text-sm leading-6 text-gray-600">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
