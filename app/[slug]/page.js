import { notFound } from "next/navigation";
import AdSlot from "../../components/AdSlot";
import JsonLd from "../../components/JsonLd";
import ToolClient from "../../components/ToolClient";
import { FAQ, FeatureGrid, HowItWorks, ToolDirectory } from "../../components/Sections";
import { allToolSlugs, getTool, legalPages, seoKeywords } from "../../lib/tools";
import { absoluteUrl, baseOpenGraph, descriptionFor, titleFor, toolSchema } from "../../lib/seo";

export function generateStaticParams() {
  return [...allToolSlugs(), ...Object.keys(legalPages)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const page = legalPages[slug];
  if (!tool && !page) return {};
  const title = tool?.title || page.title;
  const description = descriptionFor(tool?.summary || page.description);
  return {
    title: titleFor(title),
    description,
    keywords: tool ? [...seoKeywords, tool.title, ...(tool.formats || [])] : [page.title, "yt1s.video", "privacy", "dmca", "terms"],
    alternates: { canonical: absoluteUrl(slug) },
    openGraph: { ...baseOpenGraph(slug), title: titleFor(title), description },
    twitter: { card: "summary_large_image", title: titleFor(title), description }
  };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  const page = legalPages[slug];

  if (page) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <JsonLd data={{ "@context": "https://schema.org", "@type": "WebPage", name: page.title, url: absoluteUrl(slug), description: page.description, publisher: { "@type": "Organization", name: "yt1s.video" } }} />
        <div className="rounded-[2rem] bg-white p-8 shadow-2xl shadow-orange-100/80 dark:bg-zinc-900 dark:shadow-none sm:p-12">
          <p className="font-black uppercase tracking-[0.3em] text-flame">yt1s.video</p>
          <h1 className="mt-4 font-display text-5xl font-black tracking-tight text-ink dark:text-white">{page.title}</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">{page.description}</p>
          <div className="mt-8 space-y-6">
            {page.sections.map(([heading, body]) => (
              <section key={heading}>
                <h2 className="text-xl font-black text-ink dark:text-white">{heading}</h2>
                <p className="mt-2 text-sm leading-7 text-gray-600 dark:text-gray-300">{body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!tool) notFound();

  return (
    <main>
      <JsonLd data={toolSchema(slug, tool)} />
      <section className="px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-black uppercase tracking-[0.2em] text-flame">{tool.badge}</span>
          <h1 className="mt-6 font-display text-5xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">{tool.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">{tool.summary}</p>
        </div>
        <div className="mt-10"><ToolClient tool={tool} /></div>
      </section>
      <AdSlot className="pb-4" />
      <HowItWorks />
      <FeatureGrid tool={tool} />
      <AdSlot label="Advertisement" />
      <ToolDirectory />
      <FAQ />
    </main>
  );
}
