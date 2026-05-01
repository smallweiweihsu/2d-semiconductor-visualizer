import type { ElectricalResult, ElectricalScenario } from '../../types/electrical'

interface ElectricalWarningsProps {
  result: ElectricalResult
  scenario: ElectricalScenario
}

export function ElectricalWarnings({
  result,
  scenario,
}: ElectricalWarningsProps) {
  const warnings = [
    ...result.warnings_zh,
    'WSe₂ 與金屬接觸不應直接視為理想 Ohmic。',
    '二維半導體接觸可能受到 Fermi-level pinning、界面態、缺陷、穿隧與污染影響。',
    '低溫電性尚未建模，不能直接解釋低溫輸運。',
    '關態電流下限是人為設定，不代表真實漏電。',
  ]

  if (scenario.gateDielectricMaterialId === 'sb2o3') {
    warnings.push('Sb₂O₃ 介電常數或崩潰電場缺失時，gate control 與漏電風險需校準。')
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
