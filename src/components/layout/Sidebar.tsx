export function Sidebar() {
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

  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30">
      <div className="flex h-full min-h-72 flex-col gap-4">
        <div>
          <h2 className="text-sm font-medium text-slate-300">元件控制</h2>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            這裡會逐步加入元件結構、材料與製程條件的設定介面。
          </p>
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
