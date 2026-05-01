interface DiffusionWarningsProps {
  warnings: string[]
}

export function DiffusionWarnings({ warnings }: DiffusionWarningsProps) {
  const uniqueWarnings = [...new Set(warnings)]

  return (
    <section className="rounded-lg border border-amber-900/50 bg-amber-950/15 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-amber-100">模型提醒</h3>
        <span className="rounded-full border border-amber-800/60 px-2 py-1 text-xs text-amber-100/80">
          {uniqueWarnings.length} 則
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {uniqueWarnings.map((warning) => (
          <div
            className="rounded-md border border-amber-900/40 bg-slate-950/35 px-3 py-2 text-xs leading-5 text-amber-100/90"
            key={warning}
          >
            {warning}
          </div>
        ))}
      </div>
    </section>
  )
}
