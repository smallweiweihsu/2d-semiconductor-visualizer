import { useState } from 'react'
import { deviceRoleLabels } from '../../data/deviceRoles'
import { materials } from '../../data/materials'
import type { DeviceLayer } from '../../types/device'
import type {
  DiffusionConfidence,
  DiffusionDimensionality,
  DiffusionScenario,
  DiffusionSourceModel,
} from '../../types/diffusion'
import type { ProcessFlow, ProcessStep } from '../../types/process'
import { formatThickness, getMaterialDisplayName } from '../device/deviceFormatting'
import { confidenceLabels, dimensionalityLabels, getMaterialLabel } from './diffusionFormatting'

interface DiffusionParameterEditorProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
  scenario: DiffusionScenario
  onUpdateScenario: (updates: Partial<DiffusionScenario>) => void
}

const timeUnits = [
  { id: 's', label: '秒', factor: 1 },
  { id: 'min', label: '分鐘', factor: 60 },
  { id: 'h', label: '小時', factor: 3600 },
]

export function DiffusionParameterEditor({
  deviceLayers,
  flow,
  scenario,
  onUpdateScenario,
}: DiffusionParameterEditorProps) {
  const [timeUnitId, setTimeUnitId] = useState('min')
  const linkedSteps = flow.steps.filter((step) =>
    ['diffusion_annealing', 'metal_deposition', 'oxidation'].includes(step.type),
  )
  const selectedStep = linkedSteps.find(
    (step) => step.id === scenario.linkedProcessStepId,
  )
  const selectedTargetLayer = deviceLayers.find(
    (layer) => layer.id === scenario.targetLayerId,
  )
  const suggestedLayers = deviceLayers.filter(
    (layer) => layer.materialId === scenario.hostMaterialId,
  )
  const currentUnit = timeUnits.find((unit) => unit.id === timeUnitId) ?? timeUnits[1]
  const displayedTime =
    scenario.time_s === null ? '' : scenario.time_s / currentUnit.factor

  function handleSelectProcessStep(stepId: string) {
    const step = linkedSteps.find((item) => item.id === stepId)

    onUpdateScenario({
      linkedProcessStepId: stepId || undefined,
      ...(step ? mapStepToScenario(step) : {}),
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">擴散參數</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          D0 與 Ea 是定量計算必要參數。若尚未填入，結果只會顯示缺參數提醒。
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <TextField
          label="擴散物種"
          onChange={(value) => onUpdateScenario({ diffusingSpecies: value })}
          value={scenario.diffusingSpecies}
        />

        <label className="block text-xs text-slate-400">
          主材料（host）
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => onUpdateScenario({ hostMaterialId: event.target.value })}
            value={scenario.hostMaterialId}
          >
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {getMaterialLabel(material.id)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          目標材料層
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({ targetLayerId: event.target.value || undefined })
            }
            value={scenario.targetLayerId ?? ''}
          >
            <option value="">尚未選擇</option>
            {suggestedLayers.length > 0 ? (
              <optgroup label="建議目標層">
                {suggestedLayers.map((layer) => (
                  <LayerOption key={layer.id} layer={layer} />
                ))}
              </optgroup>
            ) : null}
            <optgroup label="所有材料層">
              {deviceLayers
                .filter((layer) => !suggestedLayers.some((item) => item.id === layer.id))
                .map((layer) => (
                  <LayerOption key={layer.id} layer={layer} />
                ))}
            </optgroup>
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          關聯製程步驟
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => handleSelectProcessStep(event.target.value)}
            value={scenario.linkedProcessStepId ?? ''}
          >
            <option value="">不關聯</option>
            {linkedSteps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name_zh}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          信心等級
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({
                confidence: event.target.value as DiffusionConfidence,
              })
            }
            value={scenario.confidence}
          >
            {(['known', 'estimated', 'unknown'] as DiffusionConfidence[]).map(
              (confidence) => (
                <option key={confidence} value={confidence}>
                  {confidenceLabels[confidence]}
                </option>
              ),
            )}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <NumberField
          label="退火溫度"
          onChange={(value) => onUpdateScenario({ temperature_C: value })}
          unit="°C"
          value={scenario.temperature_C}
        />
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
          <NumberField
            label="退火時間"
            onChange={(value) =>
              onUpdateScenario({
                time_s: value === null ? null : value * currentUnit.factor,
              })
            }
            unit={currentUnit.label}
            value={displayedTime === '' ? null : Number(displayedTime)}
          />
          <label className="block text-xs text-slate-400">
            單位
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
              onChange={(event) => setTimeUnitId(event.target.value)}
              value={timeUnitId}
            >
              {timeUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <NumberField
          label="D0"
          onChange={(value) => onUpdateScenario({ D0_m2s: value })}
          unit="m²/s"
          value={scenario.D0_m2s}
        />
        <NumberField
          label="Ea"
          onChange={(value) => onUpdateScenario({ Ea_eV: value })}
          unit="eV"
          value={scenario.Ea_eV}
        />
        <label className="block text-xs text-slate-400">
          擴散維度
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({
                dimensionality: event.target.value as DiffusionDimensionality,
              })
            }
            value={scenario.dimensionality}
          >
            {(['one_d', 'two_d', 'three_d'] as DiffusionDimensionality[]).map(
              (dimensionality) => (
                <option key={dimensionality} value={dimensionality}>
                  {dimensionalityLabels[dimensionality]}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="block text-xs text-slate-400">
          擴散源模型（剖面邊界條件）
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({
                sourceModel: event.target.value as DiffusionSourceModel,
              })
            }
            value={scenario.sourceModel ?? 'instantaneous'}
          >
            <option value="instantaneous">瞬時有限源（高斯剖面）</option>
            <option value="constant_source">定濃度表面源（erfc 剖面）</option>
          </select>
          <span className="mt-1 block text-[11px] leading-4 text-slate-600">
            Fick 第二定律解析解（Crank 1975）：金屬層持續供應時建議用 erfc。
          </span>
        </label>
        <NumberField
          label="界面障礙因子"
          onChange={(value) =>
            onUpdateScenario({ interfaceBarrierFactor: value ?? 1 })
          }
          unit="×"
          value={scenario.interfaceBarrierFactor}
        />
        <NumberField
          label="晶界倍率"
          onChange={(value) =>
            onUpdateScenario({ grainBoundaryMultiplier: value ?? 1 })
          }
          unit="×"
          value={scenario.grainBoundaryMultiplier}
        />
        <NumberField
          label="缺陷倍率"
          onChange={(value) => onUpdateScenario({ defectMultiplier: value ?? 1 })}
          unit="×"
          value={scenario.defectMultiplier}
        />
        <NumberField
          label="初始混入深度"
          onChange={(value) =>
            onUpdateScenario({ initialMixingDepth_nm: value ?? 0 })
          }
          unit="nm"
          value={scenario.initialMixingDepth_nm}
        />
      </div>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-500">
        <p>D0 與 Ea 是定量計算必要參數。</p>
        <p>界面障礙因子 &gt; 1 會降低有效擴散。</p>
        <p>晶界 / 缺陷倍率 &gt; 1 會增加有效擴散。</p>
        <p>初始混入深度可用來近似金屬沉積造成的界面混合。</p>
        <p>材料資料庫中的擴散參數仍需文獻校準；候選文獻資料庫將在後續批次獨立管理。</p>
      </div>

      {selectedStep ? (
        <p className="mt-3 rounded-md border border-cyan-900/40 bg-cyan-950/15 px-3 py-2 text-xs leading-5 text-cyan-100/80">
          目前已嘗試讀取製程參數；缺少欄位仍需手動補齊。
        </p>
      ) : null}

      {selectedTargetLayer ? (
        <p className="mt-3 text-xs text-slate-500">
          已選擇目標層：{selectedTargetLayer.name} ·{' '}
          {getMaterialDisplayName(selectedTargetLayer.materialId)} ·{' '}
          {deviceRoleLabels[selectedTargetLayer.role]} ·{' '}
          {formatThickness(selectedTargetLayer.geometry.thickness_nm)}
        </p>
      ) : (
        <p className="mt-3 text-xs text-amber-200/80">
          尚未選擇目標材料層，因此無法比較受影響深度與層厚。
        </p>
      )}
    </section>
  )
}

function LayerOption({ layer }: { layer: DeviceLayer }) {
  return (
    <option value={layer.id}>
      {layer.name} · {getMaterialDisplayName(layer.materialId)} ·{' '}
      {deviceRoleLabels[layer.role]} · {formatThickness(layer.geometry.thickness_nm)}
    </option>
  )
}

function mapStepToScenario(step: ProcessStep): Partial<DiffusionScenario> {
  const parameterValue = (id: string) =>
    step.parameters.find((parameter) => parameter.id === id)?.value
  const updates: Partial<DiffusionScenario> = {}
  const temperature = parameterValue('temperature_C')
  const time = parameterValue('time_min')
  const species = parameterValue('diffusing_species')
  const host = parameterValue('host_material')
  const d0 = parameterValue('D0_m2s')
  const ea = parameterValue('Ea_eV')

  if (typeof temperature === 'number') {
    updates.temperature_C = temperature
  }

  if (typeof time === 'number') {
    updates.time_s = time * 60
  }

  if (typeof species === 'string' && species) {
    updates.diffusingSpecies = species
  }

  if (typeof host === 'string' && host) {
    const matchingMaterial = materials.find((material) =>
      material.displayName.toLowerCase().includes(host.toLowerCase()),
    )
    updates.hostMaterialId = matchingMaterial?.id ?? host
  }

  if (typeof d0 === 'number') {
    updates.D0_m2s = d0
  }

  if (typeof ea === 'number') {
    updates.Ea_eV = ea
  }

  return updates
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </label>
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
