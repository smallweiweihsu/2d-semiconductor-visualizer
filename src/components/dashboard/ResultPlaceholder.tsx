export function ResultPlaceholder() {
  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30">
      <h2 className="text-sm font-medium text-slate-500">分析結果</h2>
      <p className="mt-4 text-lg font-semibold text-slate-100">
        物理分析結果會顯示在這裡
      </p>

      <div className="mt-6 space-y-3 text-sm text-slate-500">
        <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
          I-V 輸出：尚未實作
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
          能帶對齊：尚未實作
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
          製程模型：尚未實作
        </div>
      </div>
    </aside>
  )
}
