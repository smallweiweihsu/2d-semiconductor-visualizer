interface SidebarProps {
  isCollapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ isCollapsed, onToggleCollapsed }: SidebarProps) {
  const controlCards = [
    {
      title: '元件模板',
      description: '未來可選擇常見 2D 元件堆疊作為起始結構。',
    },
    {
      title: '幾何尺寸',
      description: '預留長度、寬度、厚度與層間距離等輸入欄位。',
    },
    {
      title: '材料選擇',
      description: '未來連接材料資料庫，標記 WSe₂、Sb₂O₃、Pd 等材料。',
    },
    {
      title: '電極設定',
      description: '預留源極、汲極、上閘極與接觸區域設定。',
    },
  ]

  if (isCollapsed) {
    return (
      <aside className="flex min-h-16 w-16 justify-self-start rounded-lg border border-slate-800 bg-slate-900/80 p-2 shadow-2xl shadow-slate-950/30 transition-all duration-200 ease-in-out xl:min-h-0 xl:w-auto">
        <div className="flex w-full flex-row items-center justify-between gap-2 xl:flex-col">
          <button
            aria-label="展開元件控制側欄"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-700 bg-slate-950/60 text-sm text-cyan-100 transition hover:border-cyan-600"
            onClick={onToggleCollapsed}
            title="展開元件控制側欄"
            type="button"
          >
            →
          </button>
          <div className="text-xs font-medium tracking-wide text-slate-300 xl:[writing-mode:vertical-rl]">
            元件控制
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="min-w-0 rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30 transition-all duration-200 ease-in-out">
      <div className="flex h-full min-h-72 flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-slate-300">元件控制</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              這裡會逐步加入元件結構、材料與製程條件的設定介面。
            </p>
          </div>
          <button
            aria-label="收合元件控制側欄"
            className="shrink-0 rounded-md border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-cyan-600 hover:text-cyan-100"
            onClick={onToggleCollapsed}
            title="收合元件控制側欄"
            type="button"
          >
            收合
          </button>
        </div>

        <div className="space-y-3">
          {controlCards.map((card) => (
            <section
              className="rounded-md border border-slate-800 bg-slate-950/45 p-3"
              key={card.title}
            >
              <h3 className="text-sm font-medium text-slate-100">
                {card.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {card.description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </aside>
  )
}
