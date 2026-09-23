import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { brand } from "../lib/tools";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata = {
  metadataBase: new URL("https://yt1s.video"),
  title: `${brand.name} - Free YouTube Downloader & Creator Tools`,
  description: brand.description,
  openGraph: {
    title: `${brand.name} - Free YouTube Downloader & Creator Tools`,
    description: brand.description,
    url: "https://yt1s.video",
    siteName: brand.name,
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${space.variable} antialiased`}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
