import type { OxidationResult, OxidationScenario } from '../../types/oxidation'
import {
  formatNumber,
  formatPercent,
  getRiskClass,
  oxidationRiskLabels,
  ramanVisibilityLabels,
} from './oxidationFormatting'

interface OxidationResultSummaryProps {
  result: OxidationResult
  scenario: OxidationScenario
  targetLayerThickness_nm: number | null
}

export function OxidationResultSummary({
  result,
  scenario,
  targetLayerThickness_nm,
}: OxidationResultSummaryProps) {
  const facts = [
    ['估計氧化厚度', `${formatNumber(result.estimatedOxidizedThickness_nm, 3)} nm`],
    ['剩餘材料厚度', `${formatNumber(result.estimatedRemainingThickness_nm, 3)} nm`],
    ['氧化比例', formatPercent(result.oxidationFraction)],
    ['剩餘比例', formatPercent(result.remainingFraction)],
    ['Raman 可見性', ramanVisibilityLabels[result.ramanVisibility]],
    ['製程損傷風險', oxidationRiskLabels[result.damageRisk]],
    ['氧化不均勻風險', oxidationRiskLabels[result.nonuniformityRisk]],
    [
      '目標層厚度',
      targetLayerThickness_nm ? `${formatNumber(targetLayerThickness_nm, 2)} nm` : '尚未選擇',
    ],
  ]

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">氧化結果摘要</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            此結果是輔助判讀，不代表真實 Raman 強度或完整化學反應。
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${getRiskClass(
            result.damageRisk,
          )}`}
        >
          損傷風險：{oxidationRiskLabels[result.damageRisk]}
        </span>
      </div>

      {scenario.oxidationRate_nm_per_s === null ? (
        <p className="mt-4 rounded-md border border-amber-800/50 bg-amber-950/25 px-3 py-2 text-xs leading-5 text-amber-100/85">
          缺少氧化速率或校準資料，無法定量估算氧化厚度；仍可使用 Raman 解釋清單作定性判讀。
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {facts.map(([label, value]) => (
          <div
            className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2"
            key={label}
          >
            <div className="text-[11px] text-slate-500">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold text-slate-100">
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
