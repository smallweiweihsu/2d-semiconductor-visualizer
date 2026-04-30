export function RightInspector() {
  const resultCards = [
    {
      title: '物理假設',
      description: '未來會列出目前模型使用的近似、邊界條件與文獻依據。',
    },
    {
      title: '缺少參數',
      description: '提醒尚未輸入或仍需要查文獻確認的材料與製程參數。',
    },
    {
      title: '風險提示',
      description: '標記可能造成解讀偏差的模型限制與資料不確定性。',
    },
    {
      title: '計算摘要',
      description: '預留 I-V、能帶、擴散與氧化模擬的摘要輸出區。',
    },
  ]

  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30">
      <div>
        <h2 className="text-sm font-medium text-slate-300">分析結果</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          目前只顯示占位資訊，正式計算與圖表會在後續批次加入。
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {resultCards.map((card) => (
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
    </aside>
  )
}
