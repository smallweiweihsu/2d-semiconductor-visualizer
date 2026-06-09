import type { OxidationResult, OxidationScenario } from '../../types/oxidation'

interface OxidationWarningsProps {
  result: OxidationResult
  scenario: OxidationScenario
}

export function OxidationWarnings({
  result,
  scenario,
}: OxidationWarningsProps) {
  const warnings = [
    ...result.warnings_zh,
    'O₂ RIE 可能同時造成氧化、缺陷與蝕刻，不能只視為單純氧化。',
    'Raman 仍看到 WSe₂ 不代表完全沒有氧化。',
    'Raman 看不到 WSe₂ 也不代表完全氧化。',
    '若氧化不均勻，單點 Raman 可能不代表整片樣品。',
  ]

  if (scenario.productMaterialId === 'sb2o3') {
    warnings.push('Sb 表面可能在空氣中形成氧化層，但厚度與化學態需 AFM/XPS 確認。')
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">模型提醒</h3>
          <p className="mt-1 text-xs text-slate-500">
            以下提醒不會阻止編輯，只用於避免過度解讀。
          </p>
        </div>
        <span className="rounded-full border border-amber-700/50 bg-amber-950/30 px-2 py-1 text-xs text-amber-100">
          {[...new Set(warnings)].length} 則
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {[...new Set(warnings)].map((warning) => (
          <div
            className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2 text-xs leading-5 text-amber-100/85"
            key={warning}
          >
            {warning}
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-500">
        {result.assumptions_zh.map((assumption) => (
          <p key={assumption}>{assumption}</p>
        ))}
      </div>
    </section>
  )
}
