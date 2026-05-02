import { useMemo, useState } from 'react'
import { defaultElectricalScenario } from '../../data/electricalPresets'
import { materials } from '../../data/materials'
import { calculateElectricalScenario } from '../../physics/electrical'
import type { DeviceLayer } from '../../types/device'
import type { ElectricalScenario } from '../../types/electrical'
import type { ProcessFlow } from '../../types/process'
import { AcknowledgableNotice } from '../common/AcknowledgableNotice'
import { BandAlignmentPreview } from './BandAlignmentPreview'
import { ElectricalCurvePlot } from './ElectricalCurvePlot'
import { ElectricalParameterEditor } from './ElectricalParameterEditor'
import { ElectricalResultSummary } from './ElectricalResultSummary'
import { ElectricalScenarioSelector } from './ElectricalScenarioSelector'
import { ElectricalWarnings } from './ElectricalWarnings'
import { parseNumericMaterialValue } from './electricalFormatting'

interface ElectricalModelPanelProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
}

export function ElectricalModelPanel({
  deviceLayers,
  flow,
}: ElectricalModelPanelProps) {
  const [scenario, setScenario] = useState<ElectricalScenario>(() =>
    structuredClone(defaultElectricalScenario),
  )
  const result = useMemo(() => calculateElectricalScenario(scenario), [scenario])

  function updateScenario(updates: Partial<ElectricalScenario>) {
    setScenario((current) => ({ ...current, ...updates }))
  }

  function selectPreset(preset: ElectricalScenario) {
    setScenario({
      ...structuredClone(preset),
      ...detectScenarioFromLayers(deviceLayers, preset),
    })
  }

  function readFromStructure() {
    updateScenario(detectScenarioFromLayers(deviceLayers, scenario))
  }

  return (
    <section className="grid min-w-0 gap-4">
      <AcknowledgableNotice
        id="electrical-integrity-notice"
        title="電性模型限制"
        type="assumption"
      >
        <p>
          此電性模型是基於簡化電容、通道電阻與接觸電阻的定性 / 半定量工具，不代表完整 TCAD、NEGF、DFT 或真實二維材料接觸輸運模擬。
        </p>
        <p className="mt-2">
          二維半導體金屬接觸可能受到 Fermi-level pinning、界面態、缺陷、穿隧、金屬誘發能隙態、污染與退火影響；本模型不應直接視為真實接觸電阻或真實 I-V 曲線。
        </p>
        <p className="mt-2">
          若材料參數、遷移率、介電常數、閾值電壓或接觸電阻缺失，結果只能作為趨勢參考，不能視為定量預測。
        </p>
      </AcknowledgableNotice>

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="grid min-w-0 gap-4">
          <ElectricalScenarioSelector
            scenario={scenario}
            onSelectPreset={selectPreset}
            onUpdateScenario={updateScenario}
          />
          <ElectricalParameterEditor
            deviceLayers={deviceLayers}
            flow={flow}
            scenario={scenario}
            onReadFromStructure={readFromStructure}
            onUpdateScenario={updateScenario}
          />
          <ElectricalWarnings result={result} scenario={scenario} />
        </div>

        <div className="grid min-w-0 gap-4">
          <ElectricalResultSummary result={result} scenario={scenario} />
          <ElectricalCurvePlot curve={result.idVdCurve} />
          <ElectricalCurvePlot curve={result.idVgCurve} />
          <BandAlignmentPreview scenario={scenario} />
        </div>
      </div>
    </section>
  )
}

function detectScenarioFromLayers(
  deviceLayers: DeviceLayer[],
  baseScenario: ElectricalScenario,
): Partial<ElectricalScenario> {
  const channelLayer =
    deviceLayers.find((layer) => layer.role === 'semiconductor') ??
    deviceLayers.find((layer) => layer.materialId === 'wse2')
  const sourceLayer = deviceLayers.find((layer) => layer.role === 'source')
  const drainLayer = deviceLayers.find((layer) => layer.role === 'drain')
  const gateLayer = deviceLayers.find((layer) => layer.role === 'gate')
  const gateDielectricLayer =
    deviceLayers.find((layer) => layer.role === 'dielectric') ??
    deviceLayers.find((layer) => layer.role === 'oxide')
  const dielectricMaterial = materials.find(
    (material) => material.id === gateDielectricLayer?.materialId,
  )
  const channelMaterial = materials.find(
    (material) => material.id === channelLayer?.materialId,
  )
  const dielectricConstant = parseNumericMaterialValue(
    dielectricMaterial?.parameters.dielectricConstant.value ?? null,
  )
  const breakdownField = parseNumericMaterialValue(
    dielectricMaterial?.parameters.breakdownField_MVcm.value ?? null,
  )
  const mobility = parseNumericMaterialValue(
    channelMaterial?.parameters.mobility_cm2Vs.value ?? null,
  )

  return {
    channelLayerId: channelLayer?.id ?? baseScenario.channelLayerId,
    sourceLayerId: sourceLayer?.id ?? baseScenario.sourceLayerId,
    drainLayerId: drainLayer?.id ?? baseScenario.drainLayerId,
    gateLayerId: gateLayer?.id ?? baseScenario.gateLayerId,
    gateDielectricLayerId:
      gateDielectricLayer?.id ?? baseScenario.gateDielectricLayerId,
    channelMaterialId: channelLayer?.materialId ?? baseScenario.channelMaterialId,
    gateDielectricMaterialId:
      gateDielectricLayer?.materialId ?? baseScenario.gateDielectricMaterialId,
    channelLength_um:
      channelLayer?.geometry.length_um ?? baseScenario.channelLength_um,
    channelWidth_um:
      channelLayer?.geometry.width_um ?? baseScenario.channelWidth_um,
    dielectricThickness_nm:
      gateDielectricLayer?.geometry.thickness_nm ??
      baseScenario.dielectricThickness_nm,
    dielectricConstant: dielectricConstant ?? baseScenario.dielectricConstant,
    breakdownField_MVcm: breakdownField ?? baseScenario.breakdownField_MVcm,
    mobility_cm2Vs: mobility ?? baseScenario.mobility_cm2Vs,
  }
}
