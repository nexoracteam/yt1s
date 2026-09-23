import { notFound } from "next/navigation";
import ToolClient from "../../components/ToolClient";
import { FAQ, FeatureGrid, HowItWorks, ToolDirectory } from "../../components/Sections";
import { allToolSlugs, getTool, legalPages } from "../../lib/tools";

export function generateStaticParams() {
  return [...allToolSlugs(), ...Object.keys(legalPages)].map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const tool = getTool(params.slug);
  const page = legalPages[params.slug];
  if (!tool && !page) return {};
  const title = tool?.title || page.title;
  const description = tool?.summary || page.body;
  return { title: `${title} | yt1s.video`, description };
}

export default function DynamicPage({ params }) {
  const tool = getTool(params.slug);
  const page = legalPages[params.slug];

  if (page) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-orange-100/80 sm:p-12">
          <p className="font-black uppercase tracking-[0.3em] text-flame">yt1s.video</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-ink">{page.title}</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">{page.body}</p>
        </div>
      </main>
    );
  }

  if (!tool) notFound();

  return (
    <main>
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-flame">{tool.badge}</span>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-ink sm:text-6xl">{tool.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">{tool.summary}</p>
        </div>
        <div className="mt-10"><ToolClient tool={tool} /></div>
      </section>
      <HowItWorks />
      <FeatureGrid tool={tool} />
      <ToolDirectory />
      <FAQ />
    </main>
  );
}
