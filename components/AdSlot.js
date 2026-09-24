const sizes = {
  banner: "min-h-[96px] sm:min-h-[120px]",
  inArticle: "min-h-[160px] sm:min-h-[220px]",
  rectangle: "min-h-[250px]"
};

export default function AdSlot({ label = "Advertisement", slot = "pending-slot", size = "banner", className = "" }) {
  return (
    <aside className={`mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 ${className}`} aria-label={label}>
      <div className={`relative grid place-items-center overflow-hidden rounded-[1.5rem] border border-dashed border-orange-200 bg-white/75 p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/[0.03] ${sizes[size] || sizes.banner}`}>
        <span className="pointer-events-none absolute left-4 top-3 text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">{label}</span>
        <ins
          className="adsbygoogle block min-h-20 w-full"
          style={{ display: "block" }}
          data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ""}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <div className="pointer-events-none rounded-full bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-gray-400 dark:bg-white/5 dark:text-gray-500">
          Google AdSense placeholder
        </div>
      </div>
    </aside>
  );
}
