import Link from "next/link";
import { ArrowRight } from "lucide-react";
import JsonLd from "../../components/JsonLd";
import { allBlogSlugs, blogPosts } from "../../lib/blog";
import { absoluteUrl, baseOpenGraph, siteUrl, titleFor } from "../../lib/seo";

export const metadata = {
  title: titleFor("Creator Blog"),
  description: "SEO guides for YouTube downloader searches, YT1s keywords, audio workflows, MP4 converter intent, Shorts and creator tools.",
  alternates: { canonical: absoluteUrl("/blog") },
  openGraph: {
    ...baseOpenGraph("/blog"),
    title: titleFor("Creator Blog"),
    description: "Guides for YouTube downloader, audio, MP4 converter and creator search workflows."
  }
};

export default function BlogIndex() {
  const posts = allBlogSlugs().map((slug) => blogPosts[slug]);
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Blog", name: "yt1s.video Creator Blog", url: `${siteUrl}/blog`, publisher: { "@type": "Organization", name: "yt1s.video" } }} />
      <section className="text-center">
        <p className="font-black uppercase tracking-[0.3em] text-flame">Creator Blog</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tight text-ink dark:text-white sm:text-6xl">YouTube downloader SEO and creator guides</h1>
        <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">Read practical guides about YT1s searches, audio workflows, MP4 downloads, Shorts, thumbnails, metadata and responsible creator tools.</p>
      </section>
      <section className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-flame">{post.readingTime}</p>
            <h2 className="mt-3 text-2xl font-black text-ink dark:text-white">{post.title}</h2>
            <p className="mt-4 text-sm leading-7 text-gray-600 dark:text-gray-300">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white hover:bg-flame dark:bg-white dark:text-ink dark:hover:bg-flame dark:hover:text-white">
              Read guide <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
