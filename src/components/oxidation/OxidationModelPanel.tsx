import { useMemo, useState } from 'react'
import { defaultOxidationScenario } from '../../data/oxidationPresets'
import { calculateOxidationScenario } from '../../physics/oxidation'
import type { DeviceLayer } from '../../types/device'
import type { OxidationScenario } from '../../types/oxidation'
import type { ProcessFlow } from '../../types/process'
import { AcknowledgableNotice } from '../common/AcknowledgableNotice'
import { OxidationParameterEditor } from './OxidationParameterEditor'
import { OxidationProgressSchematic } from './OxidationProgressSchematic'
import { OxidationResultSummary } from './OxidationResultSummary'
import { OxidationScenarioSelector } from './OxidationScenarioSelector'
import { OxidationWarnings } from './OxidationWarnings'
import { RamanInterpretationPanel } from './RamanInterpretationPanel'

interface OxidationModelPanelProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
}

export function OxidationModelPanel({
  deviceLayers,
  flow,
}: OxidationModelPanelProps) {
  const [scenario, setScenario] = useState<OxidationScenario>(() =>
    structuredClone(defaultOxidationScenario),
  )
  const targetLayer =
    deviceLayers.find((layer) => layer.id === scenario.targetLayerId) ?? null
  const targetLayerThickness_nm =
    targetLayer && Number.isFinite(targetLayer.geometry.thickness_nm)
      ? targetLayer.geometry.thickness_nm
      : null
  const result = useMemo(
    () => calculateOxidationScenario(scenario),
    [scenario],
  )

  function updateScenario(updates: Partial<OxidationScenario>) {
    setScenario((current) => ({ ...current, ...updates }))
  }

  function selectPreset(preset: OxidationScenario) {
    const suggestedTargetLayer = deviceLayers.find(
      (layer) => layer.materialId === preset.targetMaterialId,
    )

    setScenario({
      ...structuredClone(preset),
      targetLayerId: suggestedTargetLayer?.id,
      initialThickness_nm:
        suggestedTargetLayer?.geometry.thickness_nm ?? preset.initialThickness_nm,
    })
  }

  return (
    <section className="grid min-w-0 gap-4">
      <AcknowledgableNotice
        id="oxidation-integrity-notice"
        title="氧化模型限制"
        type="assumption"
      >
        <p>
          此氧化模型是定性 / 半定量的製程解釋工具，用於整理氧化條件、殘留材料與 Raman 可見性的可能原因；目前不代表真實反應動力學、完整化學計量、Raman 定量強度或 TCAD / DFT / MD 模擬。
        </p>
        <p className="mt-2">
          若氧化速率、Raman 穿透深度、反應能障或材料吸收參數缺失，結果只能作為趨勢判讀，不能視為定量預測。
        </p>
      </AcknowledgableNotice>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid min-w-0 gap-4">
          <OxidationScenarioSelector
            scenario={scenario}
            onSelectPreset={selectPreset}
            onUpdateScenario={updateScenario}
          />
          <OxidationParameterEditor
            deviceLayers={deviceLayers}
            flow={flow}
            scenario={scenario}
            onUpdateScenario={updateScenario}
          />
          <OxidationWarnings result={result} scenario={scenario} />
        </div>

        <div className="grid min-w-0 gap-4">
          <OxidationResultSummary
            result={result}
            scenario={scenario}
            targetLayerThickness_nm={targetLayerThickness_nm}
          />
          <OxidationProgressSchematic result={result} scenario={scenario} />
          <RamanInterpretationPanel result={result} />
        </div>
      </div>
    </section>
  )
}
