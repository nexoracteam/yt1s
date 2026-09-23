import { notFound } from "next/navigation";
import ToolClient from "../../components/ToolClient";
import { FAQ, FeatureGrid, HowItWorks, ToolDirectory } from "../../components/Sections";
import { allToolSlugs, getTool, legalPages } from "../../lib/tools";

export function generateStaticParams() {
  return [...allToolSlugs(), ...Object.keys(legalPages)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const page = legalPages[slug];
  if (!tool && !page) return {};
  const title = tool?.title || page.title;
  const description = tool?.summary || page.body;
  return { title: `${title} | yt1s.video`, description };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const page = legalPages[slug];

  if (page) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-orange-100/80 dark:bg-zinc-900 dark:shadow-none sm:p-12">
          <p className="font-black uppercase tracking-[0.3em] text-flame">yt1s.video</p>
          <h1 className="mt-4 font-display text-5xl font-black tracking-tight text-ink dark:text-white">{page.title}</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">{page.body}</p>
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
          <h1 className="mt-6 font-display text-5xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">{tool.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">{tool.summary}</p>
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
