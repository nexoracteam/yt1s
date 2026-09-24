import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import AdSlot from "../../../components/AdSlot";
import JsonLd from "../../../components/JsonLd";
import { allBlogSlugs, blogBreadcrumbSchema, blogFaqSchema, blogPostSchema, blogPostUrl, getBlogPost } from "../../../lib/blog";
import { baseOpenGraph, titleFor } from "../../../lib/seo";

export function generateStaticParams() {
  return allBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: titleFor(post.title),
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: blogPostUrl(post) },
    openGraph: { ...baseOpenGraph(`/blog/${post.slug}`), title: titleFor(post.title), description: post.description, type: "article" },
    twitter: { card: "summary_large_image", title: titleFor(post.title), description: post.description }
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main>
      <JsonLd data={[blogPostSchema(post), blogFaqSchema(post), blogBreadcrumbSchema(post)]} />
      <article className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <nav className="text-sm font-bold text-gray-500 dark:text-gray-400">
          <Link href="/" className="hover:text-flame">Home</Link> <span>/</span> <Link href="/blog" className="hover:text-flame">Blog</Link>
        </nav>
        <header className="mt-8 rounded-[2rem] bg-white p-6 shadow-2xl shadow-orange-100/80 dark:bg-zinc-900 dark:shadow-none sm:p-10">
          <p className="font-black uppercase tracking-[0.3em] text-flame">SEO guide</p>
          <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">{post.title}</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">{post.description}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            <span>Published {post.datePublished}</span>
            <span>Updated {post.dateModified}</span>
            <span>{post.readingTime}</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            {post.keywords.slice(0, 10).map((keyword) => (
              <span key={keyword} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-black text-gray-700 dark:border-white/10 dark:bg-zinc-950 dark:text-gray-200">{keyword}</span>
            ))}
          </div>
        </header>

        <AdSlot label="Advertisement" slot={`${post.slug}-top-responsive`} className="mt-10 px-0" />

        <section className="mt-10 rounded-[2rem] border border-orange-100 bg-orange-50/70 p-6 dark:border-white/10 dark:bg-zinc-900/70 sm:p-8">
          <h2 className="text-2xl font-black text-ink dark:text-white">Quick internal links</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {post.relatedTools.map((tool) => (
              <Link key={tool.href} href={tool.href} className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-black text-gray-700 shadow-sm hover:bg-flame hover:text-white dark:bg-zinc-950 dark:text-gray-200 dark:hover:bg-flame">
                {tool.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 space-y-8">
          {post.sections.map((section) => (
            <section key={section.heading} className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
              <h2 className="text-3xl font-black tracking-tight text-ink dark:text-white">{section.heading}</h2>
              <div className="mt-5 space-y-5 text-base leading-8 text-gray-600 dark:text-gray-300">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.links?.length ? (
                <div className="mt-6 flex flex-wrap gap-3">
                  {section.links.map((link) => (
                    <Link key={link.href} href={link.href} className="rounded-full border border-orange-200 px-4 py-2 text-sm font-black text-flame hover:bg-flame hover:text-white dark:border-white/10">
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-[2rem] bg-ink p-6 text-white shadow-2xl shadow-gray-300 dark:bg-black dark:shadow-none sm:p-8">
          <h2 className="text-3xl font-black">Conclusion</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-gray-300">
            {post.conclusion.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-black text-ink hover:bg-flame hover:text-white">
            Start from yt1s.video
          </Link>
        </section>

        <section className="mt-10 rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
          <h2 className="text-3xl font-black text-ink dark:text-white">FAQ</h2>
          <div className="mt-6 space-y-4">
            {post.faqs.map(([question, answer]) => (
              <details key={question} className="rounded-3xl bg-orange-50 p-5 dark:bg-zinc-950">
                <summary className="cursor-pointer font-black text-ink dark:text-white">{question}</summary>
                <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
