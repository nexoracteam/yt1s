export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "";
  const publisher = client.replace(/^ca-/, "");
  const body = publisher
    ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
    : "# Add your Google AdSense publisher ID as NEXT_PUBLIC_ADSENSE_CLIENT to generate ads.txt.\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
