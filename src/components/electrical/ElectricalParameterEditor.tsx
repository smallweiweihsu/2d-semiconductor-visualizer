import type { ReactNode } from 'react'
import { deviceRoleLabels } from '../../data/deviceRoles'
import { materials } from '../../data/materials'
import type { DeviceLayer } from '../../types/device'
import type {
  CarrierType,
  ElectricalConfidence,
  ElectricalContactModel,
  ElectricalScenario,
} from '../../types/electrical'
import type { ProcessFlow, ProcessStep } from '../../types/process'
import { formatThickness, getMaterialDisplayName } from '../device/deviceFormatting'
import {
  carrierTypeLabels,
  contactModelLabels,
  electricalConfidenceLabels,
  parseNumericMaterialValue,
} from './electricalFormatting'

interface ElectricalParameterEditorProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
  scenario: ElectricalScenario
  onReadFromStructure: () => void
  onUpdateScenario: (updates: Partial<ElectricalScenario>) => void
}

const carrierTypes: CarrierType[] = ['electron', 'hole', 'ambipolar', 'unknown']
const contactModels: ElectricalContactModel[] = [
  'ideal_ohmic',
  'manual_contact_resistance',
  'schottky_like',
  'tunneling_assisted',
  'unknown',
]

export function ElectricalParameterEditor({
  deviceLayers,
  flow,
  scenario,
  onReadFromStructure,
  onUpdateScenario,
}: ElectricalParameterEditorProps) {
  const measurementSteps = flow.steps.filter((step) =>
    ['electrical_measurement', 'low_temperature_electrical_measurement'].includes(
      step.type,
    ),
  )
  const channelMaterial = materials.find(
    (material) => material.id === scenario.channelMaterialId,
  )
  const dielectricMaterial = materials.find(
    (material) => material.id === scenario.gateDielectricMaterialId,
  )

  function handleLayerUpdate(
    key:
      | 'channelLayerId'
      | 'sourceLayerId'
      | 'drainLayerId'
      | 'gateLayerId'
      | 'gateDielectricLayerId',
    layerId: string,
  ) {
    const layer = deviceLayers.find((item) => item.id === layerId)
    const updates: Partial<ElectricalScenario> = { [key]: layerId || undefined }

    if (layer && key === 'channelLayerId') {
      updates.channelMaterialId = layer.materialId
      updates.channelLength_um = layer.geometry.length_um
      updates.channelWidth_um = layer.geometry.width_um
    }

    if (layer && key === 'gateDielectricLayerId') {
      updates.gateDielectricMaterialId = layer.materialId
      updates.dielectricThickness_nm = layer.geometry.thickness_nm
      const material = materials.find((item) => item.id === layer.materialId)
      const dielectricConstant = parseNumericMaterialValue(
        material?.parameters.dielectricConstant.value ?? null,
      )
      const breakdownField = parseNumericMaterialValue(
        material?.parameters.breakdownField_MVcm.value ?? null,
      )

      if (dielectricConstant !== null && scenario.dielectricConstant === null) {
        updates.dielectricConstant = dielectricConstant
      }

      if (breakdownField !== null && scenario.breakdownField_MVcm == null) {
        updates.breakdownField_MVcm = breakdownField
      }
    }

    onUpdateScenario(updates)
  }

  function handleMeasurementStep(stepId: string) {
    const step = measurementSteps.find((item) => item.id === stepId)
    onUpdateScenario({
      linkedMeasurementStepId: stepId || undefined,
      ...(step ? mapMeasurementStepToScenario(step) : {}),
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">電性參數</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            接觸電阻建議由量測擬合或 TLM 取得；若沒有接觸電阻，I-V 只能看趨勢。
          </p>
        </div>
        <button
          className="rounded-md border border-cyan-700/60 bg-cyan-950/35 px-3 py-2 text-xs text-cyan-100 transition hover:border-cyan-500"
          onClick={onReadFromStructure}
          type="button"
        >
          從目前元件結構讀取
        </button>
      </div>

      <EditorBlock title="元件層選擇">
        <LayerSelect
          label="通道層"
          layers={deviceLayers}
          onChange={(layerId) => handleLayerUpdate('channelLayerId', layerId)}
          value={scenario.channelLayerId}
        />
        <LayerSelect
          label="源極層"
          layers={deviceLayers}
          onChange={(layerId) => handleLayerUpdate('sourceLayerId', layerId)}
          value={scenario.sourceLayerId}
        />
        <LayerSelect
          label="汲極層"
          layers={deviceLayers}
          onChange={(layerId) => handleLayerUpdate('drainLayerId', layerId)}
          value={scenario.drainLayerId}
        />
        <LayerSelect
          label="閘極層"
          layers={deviceLayers}
          onChange={(layerId) => handleLayerUpdate('gateLayerId', layerId)}
          value={scenario.gateLayerId}
        />
        <LayerSelect
          label="閘極介電層"
          layers={deviceLayers}
          onChange={(layerId) => handleLayerUpdate('gateDielectricLayerId', layerId)}
          value={scenario.gateDielectricLayerId}
        />
        <label className="block text-xs text-slate-400">
          關聯量測步驟
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => handleMeasurementStep(event.target.value)}
            value={scenario.linkedMeasurementStepId ?? ''}
          >
            <option value="">不關聯</option>
            {measurementSteps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name_zh}
              </option>
            ))}
          </select>
        </label>
      </EditorBlock>

      <EditorBlock title="材料與通道參數">
        <label className="block text-xs text-slate-400">
          載子型態
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({ carrierType: event.target.value as CarrierType })
            }
            value={scenario.carrierType}
          >
            {carrierTypes.map((carrierType) => (
              <option key={carrierType} value={carrierType}>
                {carrierTypeLabels[carrierType]}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label="遷移率"
          onChange={(value) => onUpdateScenario({ mobility_cm2Vs: value })}
          unit="cm²/Vs"
          value={scenario.mobility_cm2Vs}
        />
        <NumberField
          label="閾值電壓"
          onChange={(value) => onUpdateScenario({ thresholdVoltage_V: value })}
          unit="V"
          value={scenario.thresholdVoltage_V}
        />
        <NumberField
          label="溫度"
          onChange={(value) => onUpdateScenario({ temperature_K: value ?? 300 })}
          unit="K"
          value={scenario.temperature_K}
        />
        <NumberField
          label="關態電流下限"
          onChange={(value) => onUpdateScenario({ offCurrentFloor_A: value ?? 0 })}
          unit="A"
          value={scenario.offCurrentFloor_A}
        />
        <label className="block text-xs text-slate-400">
          信心等級
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({
                confidence: event.target.value as ElectricalConfidence,
              })
            }
            value={scenario.confidence}
          >
            {(['known', 'estimated', 'unknown'] as ElectricalConfidence[]).map(
              (confidence) => (
                <option key={confidence} value={confidence}>
                  {electricalConfidenceLabels[confidence]}
                </option>
              ),
            )}
          </select>
        </label>
      </EditorBlock>

      <div className="mt-3 flex flex-wrap gap-2">
        <LoadButton
          disabled={!channelMaterial}
          label="從材料資料庫帶入遷移率"
          onClick={() =>
            loadMobility(channelMaterial, scenario, onUpdateScenario)
          }
        />
        <LoadButton
          disabled={!dielectricMaterial}
          label="從材料資料庫帶入介電常數"
          onClick={() =>
            loadDielectric(dielectricMaterial, scenario, onUpdateScenario)
          }
        />
      </div>

      <EditorBlock title="幾何與介電層">
        <NumberField
          label="通道長度"
          onChange={(value) => onUpdateScenario({ channelLength_um: value })}
          unit="µm"
          value={scenario.channelLength_um}
        />
        <NumberField
          label="通道寬度"
          onChange={(value) => onUpdateScenario({ channelWidth_um: value })}
          unit="µm"
          value={scenario.channelWidth_um}
        />
        <NumberField
          label="介電層厚度"
          onChange={(value) => onUpdateScenario({ dielectricThickness_nm: value })}
          unit="nm"
          value={scenario.dielectricThickness_nm}
        />
        <NumberField
          label="介電常數"
          onChange={(value) => onUpdateScenario({ dielectricConstant: value })}
          unit="k"
          value={scenario.dielectricConstant}
        />
        <NumberField
          label="崩潰電場"
          onChange={(value) => onUpdateScenario({ breakdownField_MVcm: value })}
          unit="MV/cm"
          value={scenario.breakdownField_MVcm ?? null}
        />
      </EditorBlock>

      <EditorBlock title="接觸模型">
        <label className="block text-xs text-slate-400">
          接觸模型
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({
                contactModel: event.target.value as ElectricalContactModel,
              })
            }
            value={scenario.contactModel}
          >
            {contactModels.map((model) => (
              <option key={model} value={model}>
                {contactModelLabels[model]}
              </option>
            ))}
          </select>
        </label>
        <NumberField
          label="源極接觸電阻"
          onChange={(value) =>
            onUpdateScenario({ sourceContactResistance_ohm: value })
          }
          unit="Ω"
          value={scenario.sourceContactResistance_ohm}
        />
        <NumberField
          label="汲極接觸電阻"
          onChange={(value) =>
            onUpdateScenario({ drainContactResistance_ohm: value })
          }
          unit="Ω"
          value={scenario.drainContactResistance_ohm}
        />
      </EditorBlock>

      <EditorBlock title="掃描設定">
        <NumberField
          label="Vd 起始"
          onChange={(value) => onUpdateScenario({ drainVoltageStart_V: value ?? 0 })}
          unit="V"
          value={scenario.drainVoltageStart_V}
        />
        <NumberField
          label="Vd 結束"
          onChange={(value) => onUpdateScenario({ drainVoltageStop_V: value ?? 0 })}
          unit="V"
          value={scenario.drainVoltageStop_V}
        />
        <NumberField
          label="Vd 步階"
          onChange={(value) => onUpdateScenario({ drainVoltageStep_V: value ?? 0.1 })}
          unit="V"
          value={scenario.drainVoltageStep_V}
        />
        <NumberField
          label="Vg 起始"
          onChange={(value) => onUpdateScenario({ gateVoltageStart_V: value ?? 0 })}
          unit="V"
          value={scenario.gateVoltageStart_V}
        />
        <NumberField
          label="Vg 結束"
          onChange={(value) => onUpdateScenario({ gateVoltageStop_V: value ?? 0 })}
          unit="V"
          value={scenario.gateVoltageStop_V}
        />
        <NumberField
          label="Vg 步階"
          onChange={(value) => onUpdateScenario({ gateVoltageStep_V: value ?? 0.1 })}
          unit="V"
          value={scenario.gateVoltageStep_V}
        />
      </EditorBlock>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-500">
        <p>WSe₂ 與金屬接觸不應直接視為理想 Ohmic。</p>
        <p>mobility 與 Vth 會受製程、介面、缺陷、溫度與量測條件影響。</p>
        <p>材料資料庫中尚缺的參數需文獻或實驗校準。</p>
      </div>
    </section>
  )
}

function EditorBlock({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-slate-200">{title}</h4>
      <div className="mt-3 grid gap-4 xl:grid-cols-2">{children}</div>
    </div>
  )
}

function LayerSelect({
  label,
  layers,
  value,
  onChange,
}: {
  label: string
  layers: DeviceLayer[]
  value?: string
  onChange: (layerId: string) => void
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <select
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
        onChange={(event) => onChange(event.target.value)}
        value={value ?? ''}
      >
        <option value="">尚未選擇</option>
        {layers.map((layer) => (
          <option key={layer.id} value={layer.id}>
            {layer.name} · {getMaterialDisplayName(layer.materialId)} ·{' '}
            {deviceRoleLabels[layer.role]} · {formatThickness(layer.geometry.thickness_nm)}
          </option>
        ))}
      </select>
    </label>
  )
}

function LoadButton({
  disabled,
  label,
  onClick,
}: {
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="rounded-md border border-slate-700 bg-slate-950/60 px-3 py-2 text-xs text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-45"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function NumberField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string
  value: number | null
  unit: string
  onChange: (value: number | null) => void
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <div className="mt-1 flex rounded-md border border-slate-700 bg-slate-950 focus-within:border-cyan-600">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none"
          onChange={(event) =>
            onChange(event.target.value === '' ? null : Number(event.target.value))
          }
          type="number"
          value={value ?? ''}
        />
        <span className="border-l border-slate-800 px-3 py-2 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </label>
  )
}

function loadMobility(
  material: (typeof materials)[number] | undefined,
  scenario: ElectricalScenario,
  onUpdateScenario: (updates: Partial<ElectricalScenario>) => void,
) {
  const mobility = parseNumericMaterialValue(
    material?.parameters.mobility_cm2Vs.value ?? null,
  )

  if (mobility !== null || scenario.mobility_cm2Vs === null) {
    onUpdateScenario({ mobility_cm2Vs: mobility })
  }
}

function loadDielectric(
  material: (typeof materials)[number] | undefined,
  scenario: ElectricalScenario,
  onUpdateScenario: (updates: Partial<ElectricalScenario>) => void,
) {
  const dielectricConstant = parseNumericMaterialValue(
    material?.parameters.dielectricConstant.value ?? null,
  )
  const breakdownField = parseNumericMaterialValue(
    material?.parameters.breakdownField_MVcm.value ?? null,
  )

  onUpdateScenario({
    dielectricConstant:
      dielectricConstant ?? scenario.dielectricConstant,
    breakdownField_MVcm: breakdownField ?? scenario.breakdownField_MVcm,
  })
}

function mapMeasurementStepToScenario(
  step: ProcessStep,
): Partial<ElectricalScenario> {
  const value = (id: string) =>
    step.parameters.find((parameter) => parameter.id === id)?.value
  const updates: Partial<ElectricalScenario> = {}

  applySweepRange(value('vd_sweep_range'), 'drain', updates)
  applySweepRange(value('vg_sweep_range'), 'gate', updates)

  if (step.type === 'low_temperature_electrical_measurement') {
    const temperatureText = value('temperature_range_K')
    if (typeof temperatureText === 'string') {
      const match = temperatureText.match(/[0-9]+(?:\.[0-9]+)?/)
      if (match) {
        updates.temperature_K = Number(match[0])
      }
    }
  }

  return updates
}

function applySweepRange(
  rawValue: unknown,
  axis: 'drain' | 'gate',
  updates: Partial<ElectricalScenario>,
) {
  if (typeof rawValue !== 'string') {
    return
  }

  const numbers = rawValue.match(/-?[0-9]+(?:\.[0-9]+)?/g)?.map(Number) ?? []

  if (numbers.length < 2) {
    return
  }

  if (axis === 'drain') {
    updates.drainVoltageStart_V = numbers[0]
    updates.drainVoltageStop_V = numbers[1]
  } else {
    updates.gateVoltageStart_V = numbers[0]
    updates.gateVoltageStop_V = numbers[1]
  }
}
