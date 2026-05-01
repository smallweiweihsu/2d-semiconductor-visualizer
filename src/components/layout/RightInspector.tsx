import type { WorkspaceTabId } from '../../data/workspaceTabs'

interface RightInspectorProps {
  activeTabId: WorkspaceTabId
}

export function RightInspector({ activeTabId }: RightInspectorProps) {
  const resultCards =
    activeTabId === 'diffusion'
      ? [
          {
            title: '製程摘要',
            description: '預留流程步驟、啟用狀態與關聯材料層的快速摘要。',
          },
          {
            title: '缺少參數',
            description: '提醒退火溫度、時間、D0、Ea、RIE 功率與量測條件等尚未填寫欄位。',
          },
          {
            title: '量測對照',
            description: '未來可將 Raman、PL、XPS、AFM 與電性量測結果連回製程步驟。',
          },
          {
            title: '後續擴散模型',
            description: '預留退火擴散、氧化與界面變化近似模型的摘要位置。',
          },
        ]
      : [
    {
      title: '物理假設',
      description: '整理目前元件結構、材料分類與幾何近似所隱含的模型假設。',
    },
    {
      title: '缺少參數',
      description: '提醒尚未輸入或仍需要查文獻確認的材料、介電層與製程參數。',
    },
    {
      title: '風險提示',
      description: '標記接觸、氧化、退火與幾何簡化可能造成的解讀限制。',
    },
    {
      title: '計算摘要',
      description: '預留後續 I-V、能帶、擴散、氧化與製程分析的摘要輸出區。',
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
