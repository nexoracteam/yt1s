import MonetagPlacement from "./MonetagPlacement";

function Rail({ side }) {
  const isLeft = side === "left";
  return (
    <aside
      aria-label={`${side} advertisement rail`}
      className={`pointer-events-none fixed top-28 z-30 hidden w-[150px] min-[1360px]:block ${isLeft ? "left-4" : "right-4"}`}
    >
      <div className="pointer-events-auto overflow-hidden rounded-2xl border border-dashed border-orange-200 bg-white/85 p-2 text-center shadow-lg shadow-orange-100/40 backdrop-blur dark:border-white/10 dark:bg-zinc-950/80 dark:shadow-black/30">
        <div className="mb-2 text-[9px] font-black uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500">Advertisement</div>
        <div className="min-h-[300px]">
          <MonetagPlacement slot={`${side}-sidebar`} size="sidebar" />
        </div>
      </div>
    </aside>
  );
}

export default function SidebarAds() {
  return (
    <>
      <Rail side="left" />
      <Rail side="right" />
    </>
  );
}
