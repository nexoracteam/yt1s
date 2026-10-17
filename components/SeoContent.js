import { brand } from "../lib/tools";

export function SeoContent({ tool, home = false }) {
  const title = tool?.title || "YouTube Video Downloader";
  const intro = home
    ? "yt1s.video is built for people who need a clear downloader and creator workflow without confusing popups, misleading buttons, or hidden steps."
    : tool?.seoIntro || `${title} is designed for people who want a focused tool page with clear actions, readable options, and practical guidance before they save or process public video content.`;
  const sections = tool?.seoSections || [];
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <article className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-10">
        <h2 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">
          {tool?.seoTitle || "A smooth downloader experience for public YouTube videos, Shorts and audio"}
        </h2>
        <div className="mt-6 space-y-6 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base sm:leading-8">
          <p>{intro}</p>
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h3 className="text-xl font-black text-ink dark:text-white">{heading}</h3>
              <p className="mt-2">{body}</p>
            </section>
          ))}
          {(home || tool?.mode === "download") && <>
            <section>
              <h3 className="text-xl font-black text-ink dark:text-white">If your download does not start</h3>
              <p className="mt-2">Check that the video is public and still available on YouTube. Try a lower quality if the selected format fails. Private, removed, live or region-restricted videos may not be supported. Current limits are 30 minutes and 500 MB per download.</p>
            </section>
            <section>
              <h3 className="text-xl font-black text-ink dark:text-white">Save the file before the link expires</h3>
              <p className="mt-2">Prepared links are temporary. If a link expires, paste the original video URL again to prepare a new one. On a phone, check your browser downloads or Files app for the saved MP4 or M4A file.</p>
            </section>
          </>}
          <p>Only process content you own, have permission to use, or are legally allowed to access. Downloading a file does not grant permission to republish it.</p>
        </div>
      </article>
    </section>
  );
}

export function LegalLongContent({ page, slug }) {
  return (
    <section className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-orange-100 bg-white p-6 shadow-xl shadow-orange-100/70 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none sm:p-10">
      <p className="font-black uppercase tracking-[0.28em] text-flame">Policy details</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-ink dark:text-white">Detailed {page.title}</h2>
      <div className="mt-6 space-y-6 text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base sm:leading-8">
        <p>yt1s.video publishes this {page.title.toLowerCase()} to make the service easier to understand before you paste a URL, prepare a download link, view a thumbnail, generate metadata, or use a creator utility. The website is designed around public YouTube resources and user-provided inputs. We try to keep the downloader journey simple, but legal and privacy information still matters because users, search engines and rights holders need clear expectations.</p>
        <p>The service may process a video URL, Shorts URL, video ID, selected quality, temporary job status, request timing, browser information and technical logs required to operate and protect the platform. Completed video files are not intended to remain on local server disk in the current streaming workflow. Temporary stream links expire, and job data is kept only as long as needed for the feature, troubleshooting, abuse prevention and reliability. We avoid displaying internal provider errors, secret names or infrastructure details to public users.</p>
        <p>Cookies and local storage may be used for essential preferences such as cookie consent, interface choices and session-safe status recovery. Privacy-conscious analytics may be used after approval to measure visits and understand performance. The site does not load third-party promotion scripts or reserve paid placement blocks. Users can choose essential-only consent from the cookie banner.</p>
        <p>Users are responsible for their own actions. You should only download, convert, inspect or reuse content that you own, have permission to use, or are legally allowed to access. yt1s.video does not claim ownership of third-party content and does not grant copyright permissions. If a rights holder believes a page, tool result, URL or use of the service affects their rights, they can contact {brand.email} with enough detail to review the request.</p>
        <p>For DMCA or copyright notices, include the affected URL, identification of the copyrighted work, proof that you are the rights holder or authorized representative, contact information, a good-faith statement, and a statement that the information is accurate. Incomplete requests may need clarification. Fraudulent notices may be rejected. The review process can include restricting access to a reported URL or taking other reasonable action where appropriate.</p>
        <p>For privacy or cookie questions, include the email address you used to contact us, the specific page or feature involved, and a clear description of the request. We do not ask users to submit private account passwords, YouTube login data, payment information, or sensitive personal material through the downloader form. If you accidentally submit sensitive information, contact us quickly so we can review what can reasonably be removed from operational logs.</p>
        <p>The service can change over time. Source platforms can update delivery rules, videos can disappear, formats can become unavailable, network conditions can change, and analytics or infrastructure tools may require additional disclosures. We may update this policy page to reflect product, legal or operational changes. The latest version published on yt1s.video controls the public explanation of the service.</p>
        <p>Because yt1s.video includes downloader pages, creator tools and legal pages, policy language needs to cover more than one feature. A visitor might use the YouTube video downloader, a short downloader, a thumbnail tool, a title generator or a metadata helper during the same session. Each feature can involve different inputs, but the same basic principles apply: keep only what is needed for the feature, show clear public messages, avoid requesting sensitive account information, and keep the primary action easy to find.</p>
        <p>For cookies, the consent banner records whether the visitor selected essential-only storage, accepted analytics, or dismissed the notice. Essential storage helps remember that choice so the banner does not appear on every page view. If analytics code is enabled later, additional cookies may be used by that provider according to its own policies. Users can reset choices by clearing site data in the browser, then revisiting yt1s.video to see the consent notice again.</p>
        <p>For the page experience, the website is intentionally free of paid promotion scripts, popups, sidebar rails and reserved placement blocks. This keeps the downloader button, input field, status area and help content visually clear for mobile and desktop visitors.</p>
        <p>For security, the site publishes security.txt and uses common protective headers such as frame protection, content type protection, referrer limits, permissions policy and HTTPS strict transport security where the hosting platform supports them. These controls do not make any public tool immune to abuse, but they reduce avoidable browser risks and give researchers a clear contact path. Reports should include enough detail to reproduce the issue without sending secrets or private user data.</p>
        <p>For search and AI crawlers, the site publishes sitemap.xml, robots.txt and llms.txt so crawlers can discover public pages and understand the scope of the website. These files describe public resources only. They do not authorize scraping private systems, bypassing API routes, or ignoring the disallow rules for technical endpoints. The public pages are written to explain how the tools work, what limitations exist, and how users can contact the site for policy matters.</p>
        <p>For minors and sensitive content, users should follow local laws and platform rules. yt1s.video does not intentionally ask for age, government identifiers, financial information or private account credentials through the downloader form. If a source platform blocks a video because of age, privacy, availability or rights restrictions, the tool may fail gracefully rather than attempting to force access. That behavior protects the service and sets better expectations for visitors.</p>
        <p>For data retention, temporary operational data may exist in memory, logs, hosting systems or third-party infrastructure for reliability and abuse prevention. The exact retention window can vary by provider and operational need, but the service is not designed as a permanent media locker. Visitors should not treat temporary links, generated outputs or status pages as long-term storage. If a user needs a copy of their own work, they should save it directly to their device using a lawful workflow.</p>
        <p>For international visitors, laws and rights can vary by country. A video that appears public in one region may be unavailable or restricted in another. Users are responsible for checking whether their intended download, reuse, quotation, editing, backup or research activity is allowed where they live. yt1s.video provides tools and information; it does not provide legal advice, copyright clearance, platform permission or professional compliance review.</p>
        <p>If you do not agree with the relevant policies, do not use the website. Continued use of yt1s.video means you understand that the tools are provided for lawful, permission-based workflows and that no downloader can guarantee every video, every quality, or every source will work forever. For support, policy questions, privacy requests, cookie concerns, DMCA notices or partnership questions, contact {brand.email}.</p>
      </div>
    </section>
  );
}
