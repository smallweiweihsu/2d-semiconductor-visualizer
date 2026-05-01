import type { DiffusionResult, DiffusionScenario } from '../../types/diffusion'
import {
  confidenceLabels,
  formatNumber,
  formatScientific,
  getRiskClass,
  riskLabels,
} from './diffusionFormatting'

interface DiffusionResultSummaryProps {
  result: DiffusionResult
  scenario: DiffusionScenario
  targetLayerThickness_nm: number | null
}

export function DiffusionResultSummary({
  result,
  scenario,
  targetLayerThickness_nm,
}: DiffusionResultSummaryProps) {
  const facts = [
    ['溫度 K', formatNumber(result.temperature_K, 2)],
    ['D(T)', `${formatScientific(result.D_m2s)} m²/s`],
    ['有效 D', `${formatScientific(result.effectiveD_m2s)} m²/s`],
    ['擴散長度', `${formatNumber(result.diffusionLength_nm, 3)} nm`],
    [
      '擴散長度（µm）',
      result.diffusionLength_nm && result.diffusionLength_nm >= 1000
        ? `${formatNumber(result.diffusionLength_nm / 1000, 3)} µm`
        : '尚未達 µm 尺度',
    ],
    ['初始混入深度', `${formatNumber(scenario.initialMixingDepth_nm, 2)} nm`],
    ['估計受影響深度', `${formatNumber(result.affectedDepth_nm, 3)} nm`],
    ['目標層厚度', targetLayerThickness_nm ? `${formatNumber(targetLayerThickness_nm, 2)} nm` : '尚未選擇'],
    [
      '受影響深度 / 層厚',
      result.affectedDepthToLayerThicknessRatio === null
        ? '無法計算'
        : `${formatNumber(result.affectedDepthToLayerThicknessRatio * 100, 1)}%`,
    ],
    ['信心等級', confidenceLabels[scenario.confidence]],
  ]

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">結果摘要</h3>
          <p className="mt-1 text-xs text-slate-500">
            風險分級只是輔助判讀，不代表真實實驗結果。
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${getRiskClass(
            result.riskLevel,
          )}`}
        >
          風險分級：{riskLabels[result.riskLevel]}
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
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
