import type { OxidationResult } from '../../types/oxidation'

interface RamanInterpretationPanelProps {
  result: OxidationResult
}

const followUpChecks = [
  '低功率 Raman',
  'Raman mapping',
  'AFM 厚度',
  'XPS 氧化態',
  'PL 是否消失或變弱',
  '電性是否導通改變',
  'SEM / optical contrast 只能作為形貌輔助，不能單獨證明氧化',
]

export function RamanInterpretationPanel({
  result,
}: RamanInterpretationPanelProps) {
  const extendedExplanations = [
    ...result.explanations_zh,
    '雷射功率可能造成局部加熱，使訊號解讀變複雜。',
    '若材料在 PDMS、SiO₂、Sb₂O₃ 或金屬附近，背景與界面效應可能影響 Raman。',
  ]

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">Raman 解釋</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          這是解釋助手，不是最終診斷；單點 Raman 不能代表整片樣品。
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <ol className="space-y-2 text-sm text-slate-300">
          {[...new Set(extendedExplanations)].map((explanation, index) => (
            <li className="flex gap-2" key={explanation}>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-cyan-700/50 bg-cyan-950/30 text-xs text-cyan-100">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-6">{explanation}</span>
            </li>
          ))}
        </ol>

        <aside className="rounded-md border border-slate-800 bg-slate-950/50 p-3">
          <h4 className="text-xs font-semibold text-slate-200">建議後續檢查</h4>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-400">
            {followUpChecks.map((check) => (
              <li className="flex gap-2" key={check}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
                <span>{check}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  )
}
