import Link from "next/link";
import { brand, seoKeywords, toolCategories, tools } from "../lib/tools";

export default function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-ink text-white dark:border-white/10 dark:bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-8">
        <div>
          <div className="font-display text-2xl font-black">{brand.name}</div>
          <p className="mt-4 max-w-md text-sm leading-6 text-gray-300">{brand.description}</p>
          <p className="mt-4 text-sm text-gray-300"><a href={`mailto:${brand.email}`} className="hover:text-white">{brand.email}</a></p>
          <p className="mt-6 text-xs text-gray-400">Use these tools only for content you own or are allowed to process.</p>
          <p className="mt-4 max-w-md text-xs leading-6 text-gray-500">Popular searches: {seoKeywords.slice(0, 5).join(", ")}.</p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {toolCategories.map((category) => (
            <div key={category.title}>
              <h3 className="font-bold text-white">{category.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-gray-300">
                {category.tools.slice(0, 6).map((slug) => (
                  <li key={slug}>
                    <Link href={`/${slug}`} className="hover:text-white">{tools[slug].title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-gray-400">
        © 2026 {brand.name}. <Link href="/privacy" className="hover:text-white">Privacy Policy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link> · <Link href="/dmca" className="hover:text-white">DMCA</Link> · <Link href="/contact" className="hover:text-white">Contact</Link>
      </div>
    </footer>
  );
}
