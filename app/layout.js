import { Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import CookieConsent from "../components/CookieConsent";
import Header from "../components/Header";
import Footer from "../components/Footer";
import JsonLd from "../components/JsonLd";
import { brand, seoKeywords } from "../lib/tools";
import { organizationSchema, siteUrl, websiteSchema } from "../lib/seo";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const googleAnalyticsId = "G-0NZ5W4C28E";
const googleSiteVerification = "KGQZY9TuxjDpCHzABv7mXt1cJ8e580-KG-Evsybccp4";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YouTube Video Downloader - HD, Shorts, 4K & Audio | yt1s.video",
    template: "%s | yt1s.video"
  },
  description: "Fast yt downloader for public YouTube videos, Shorts, full HD video downloader links, 4K-ready formats, thumbnails and audio tools.",
  keywords: [...seoKeywords, "youtube shorts downloader", "youtube to mp3", "youtube thumbnail downloader", "download youtube video"],
  verification: {
    google: googleSiteVerification
  },
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: "YouTube Video Downloader - HD, Shorts, 4K & Audio",
    description: brand.description,
    url: siteUrl,
    siteName: brand.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Video Downloader - yt1s.video",
    description: brand.description
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1
    }
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg"
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${space.variable} antialiased`}>
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            (function(){
              var saved = null;
              try { saved = JSON.parse(localStorage.getItem('yt1s-cookie-consent') || 'null'); } catch (e) {}
              var granted = saved && saved.value === 'all' ? 'granted' : 'denied';
              gtag('consent', 'default', {
                analytics_storage: granted,
                ad_storage: granted,
                ad_user_data: granted,
                ad_personalization: granted
              });
            })();
            gtag('js', new Date());
          `}
        </Script>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`gtag('config', '${googleAnalyticsId}', { anonymize_ip: true });`}
        </Script>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Header />
        {children}
        <CookieConsent />
        <Footer />
      </body>
    </html>
  );
}
