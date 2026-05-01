import { useMemo, useState } from 'react'
import { defaultDiffusionScenario } from '../../data/diffusionPresets'
import { calculateDiffusionScenario } from '../../physics/diffusion'
import type { DeviceLayer } from '../../types/device'
import type { DiffusionScenario } from '../../types/diffusion'
import type { ProcessFlow } from '../../types/process'
import { DiffusionParameterEditor } from './DiffusionParameterEditor'
import { DiffusionProfilePlot } from './DiffusionProfilePlot'
import { DiffusionResultSummary } from './DiffusionResultSummary'
import { DiffusionScenarioSelector } from './DiffusionScenarioSelector'
import { DiffusionSchematic } from './DiffusionSchematic'
import { DiffusionWarnings } from './DiffusionWarnings'

interface DiffusionModelPanelProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
}

export function DiffusionModelPanel({
  deviceLayers,
  flow,
}: DiffusionModelPanelProps) {
  const [scenario, setScenario] = useState<DiffusionScenario>(() =>
    structuredClone(defaultDiffusionScenario),
  )
  const targetLayer =
    deviceLayers.find((layer) => layer.id === scenario.targetLayerId) ?? null
  const targetLayerThickness_nm =
    targetLayer && Number.isFinite(targetLayer.geometry.thickness_nm)
      ? targetLayer.geometry.thickness_nm
      : null
  const result = useMemo(
    () => calculateDiffusionScenario(scenario, targetLayerThickness_nm),
    [scenario, targetLayerThickness_nm],
  )

  function updateScenario(updates: Partial<DiffusionScenario>) {
    setScenario((current) => ({ ...current, ...updates }))
  }

  function selectPreset(preset: DiffusionScenario) {
    const suggestedTargetLayer = deviceLayers.find(
      (layer) => layer.materialId === preset.hostMaterialId,
    )

    setScenario({
      ...structuredClone(preset),
      targetLayerId: suggestedTargetLayer?.id,
    })
  }

  return (
    <section className="grid min-w-0 gap-4">
      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/90">
        <p>
          此擴散模型是基於 Arrhenius 擴散係數與 Fick 擴散近似的定性 / 半定量工具，不代表真實製程中的完整界面反應、晶界擴散、缺陷輔助擴散、沉積損傷或化學反應。
        </p>
        <p className="mt-2">
          若 D0 或 Ea 來自估計值或尚未填入，計算結果只能作為趨勢參考，不能視為定量預測。
        </p>
        {scenario.diffusingSpecies.toLowerCase() === 'in' ? (
          <p className="mt-2">
            In 可作為候選緩衝金屬，但是否降低 Sb₂O₃ 介面衝擊需要文獻與實驗驗證。
          </p>
        ) : null}
      </aside>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid min-w-0 gap-4">
          <DiffusionScenarioSelector
            scenario={scenario}
            onSelectPreset={selectPreset}
            onUpdateScenario={updateScenario}
          />
          <DiffusionParameterEditor
            deviceLayers={deviceLayers}
            flow={flow}
            scenario={scenario}
            onUpdateScenario={updateScenario}
          />
          <DiffusionWarnings warnings={result.warnings_zh} />
        </div>

        <div className="grid min-w-0 gap-4">
          <DiffusionResultSummary
            result={result}
            scenario={scenario}
            targetLayerThickness_nm={targetLayerThickness_nm}
          />
          <DiffusionProfilePlot result={result} scenario={scenario} />
          <DiffusionSchematic result={result} scenario={scenario} />
          <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
            <h3 className="text-sm font-semibold text-slate-100">模型假設</h3>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
              {result.assumptions_zh.map((assumption) => (
                <li className="flex gap-2" key={assumption}>
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                  <span>{assumption}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </section>
  )
}
