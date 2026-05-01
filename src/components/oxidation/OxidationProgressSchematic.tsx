import type { ReactNode } from 'react'
import type { OxidationResult, OxidationScenario } from '../../types/oxidation'
import { formatNumber, getMaterialLabel } from './oxidationFormatting'

interface OxidationProgressSchematicProps {
  result: OxidationResult
  scenario: OxidationScenario
}

export function OxidationProgressSchematic({
  result,
  scenario,
}: OxidationProgressSchematicProps) {
  const oxidizedPercent =
    result.oxidationFraction === null
      ? 28
      : Math.max(result.oxidationFraction * 100, 8)
  const remainingPercent =
    result.remainingFraction === null
      ? 72
      : Math.max(result.remainingFraction * 100, result.remainingFraction > 0 ? 8 : 0)
  const isSbTarget = scenario.targetMaterialId === 'sb-bulk'

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">氧化進度示意</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          此圖為示意，不代表實際 TEM、AFM、XPS 或 Raman mapping 結果。
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SchematicPanel title="氧化前">
          <div className="flex h-44 flex-col justify-end rounded-md border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 text-center text-xs text-slate-400">
              初始材料：{getMaterialLabel(scenario.targetMaterialId)}
            </div>
            <div
              className={`rounded-md border px-3 py-8 text-center text-sm font-semibold ${
                isSbTarget
                  ? 'border-emerald-500/40 bg-emerald-500/25 text-emerald-100'
                  : 'border-cyan-500/40 bg-cyan-500/25 text-cyan-100'
              }`}
            >
              {isSbTarget ? 'Sb substrate / bulk' : 'WSe₂ / 2D 材料'}
            </div>
          </div>
        </SchematicPanel>

        <SchematicPanel title="氧化後">
          <div className="flex h-44 flex-col justify-end overflow-hidden rounded-md border border-slate-800 bg-slate-950/70 p-4">
            <div className="mb-2 text-center text-xs text-slate-400">
              Raman 可能探測區
            </div>
            <div
              className="flex items-center justify-center rounded-t-md border border-orange-500/40 bg-orange-500/30 px-3 text-center text-xs font-semibold text-orange-100"
              style={{ minHeight: `${Math.min(oxidizedPercent, 78)}%` }}
            >
              氧化區：{getMaterialLabel(scenario.productMaterialId)}
            </div>
            <div className="border-x border-dashed border-amber-300/40 bg-amber-300/10 px-3 py-2 text-center text-[11px] text-amber-100">
              可能缺陷區
            </div>
            {remainingPercent > 0 ? (
              <div
                className={`flex items-center justify-center rounded-b-md border px-3 text-center text-xs font-semibold ${
                  isSbTarget
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-100'
                    : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-100'
                }`}
                style={{ minHeight: `${Math.min(remainingPercent, 70)}%` }}
              >
                殘留材料
              </div>
            ) : null}
          </div>
        </SchematicPanel>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
        <p>估計氧化厚度：{formatNumber(result.estimatedOxidizedThickness_nm, 3)} nm</p>
        <p>剩餘厚度：{formatNumber(result.estimatedRemainingThickness_nm, 3)} nm</p>
        <p>Raman 可見性只是啟發式判斷。</p>
      </div>
    </section>
  )
}

function SchematicPanel({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-slate-300">{title}</div>
      {children}
    </div>
  )
}
