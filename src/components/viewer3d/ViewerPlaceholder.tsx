export function ViewerPlaceholder() {
  return (
    <section className="flex min-h-[25rem] items-center justify-center rounded-lg border border-slate-800 bg-[linear-gradient(135deg,rgba(15,23,42,0.8),rgba(2,6,23,0.92))] p-6">
      <div className="w-full max-w-2xl rounded-lg border border-dashed border-cyan-900/70 bg-slate-950/60 p-8 text-center">
        <div className="mx-auto mb-5 grid h-24 w-40 place-items-center rounded-lg border border-slate-800 bg-slate-900/70">
          <div className="h-10 w-28 rounded-sm border border-cyan-800/70 bg-cyan-950/30 shadow-[0_0_30px_rgba(34,211,238,0.08)]" />
        </div>
        <h2 className="text-xl font-semibold text-slate-100">
          3D 元件視覺化區域將顯示在這裡
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          目前只放置靜態占位區塊，尚未加入真實 3D 場景。
        </p>
      </div>
    </section>
  )
}
