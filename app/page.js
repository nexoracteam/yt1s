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
          <h1 className="mt-5 text-5xl font-black tracking-tight text-ink sm:text-7xl">
            Turn YouTube links into useful assets with {brand.name}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600">{brand.description}</p>
        </div>
        <div className="mt-10"><ToolClient tool={mainTool} /></div>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 text-center md:grid-cols-4">
          {["Cloudinary Ready", "Vercel Hosted", "20+ Tools", "No AI Keys Yet"].map((item) => (
            <div key={item} className="rounded-3xl bg-white p-5 font-black text-ink shadow-xl shadow-orange-100/70">{item}</div>
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
