export default function AdSlot({ label = "Advertisement", className = "" }) {
  return (
    <aside className={`mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 ${className}`} aria-label={label}>
      <div className="grid min-h-24 place-items-center rounded-[1.5rem] border border-dashed border-orange-200 bg-white/70 p-4 text-center text-xs font-bold uppercase tracking-[0.22em] text-gray-400 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-500">
        {label} placeholder
      </div>
    </aside>
  );
}
