import { useState } from 'react'
import { deviceRoleLabels } from '../../data/deviceRoles'
import { materials } from '../../data/materials'
import type { DeviceLayer } from '../../types/device'
import type {
  OxidationConfidence,
  OxidationMethod,
  OxidationScenario,
} from '../../types/oxidation'
import type { ProcessFlow, ProcessStep } from '../../types/process'
import { formatThickness, getMaterialDisplayName } from '../device/deviceFormatting'
import {
  getMaterialLabel,
  oxidationConfidenceLabels,
  oxidationMethodLabels,
} from './oxidationFormatting'

interface OxidationParameterEditorProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
  scenario: OxidationScenario
  onUpdateScenario: (updates: Partial<OxidationScenario>) => void
}

const timeUnits = [
  { id: 's', label: '秒', factor: 1 },
  { id: 'min', label: '分鐘', factor: 60 },
  { id: 'h', label: '小時', factor: 3600 },
]

const oxidationMethods: OxidationMethod[] = [
  'o2_rie',
  'uv_ozone',
  'thermal_oxidation',
  'ambient_exposure',
  'plasma_oxidation',
  'custom',
]

export function OxidationParameterEditor({
  deviceLayers,
  flow,
  scenario,
  onUpdateScenario,
}: OxidationParameterEditorProps) {
  const [timeUnitId, setTimeUnitId] = useState('s')
  const currentUnit = timeUnits.find((unit) => unit.id === timeUnitId) ?? timeUnits[0]
  const displayedTime =
    scenario.processTime_s === null
      ? ''
      : scenario.processTime_s / currentUnit.factor
  const linkedSteps = flow.steps.filter(isRelevantProcessStep)
  const selectedStep = linkedSteps.find(
    (step) => step.id === scenario.linkedProcessStepId,
  )
  const selectedTargetLayer = deviceLayers.find(
    (layer) => layer.id === scenario.targetLayerId,
  )
  const suggestedLayers = deviceLayers.filter(
    (layer) => layer.materialId === scenario.targetMaterialId,
  )

  function handleSelectTargetLayer(layerId: string) {
    const layer = deviceLayers.find((item) => item.id === layerId)
    const updates: Partial<OxidationScenario> = {
      targetLayerId: layerId || undefined,
    }

    if (layer && scenario.initialThickness_nm === null) {
      updates.initialThickness_nm = layer.geometry.thickness_nm
    }

    if (layer) {
      updates.targetMaterialId = layer.materialId
    }

    onUpdateScenario(updates)
  }

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
        <h3 className="text-sm font-semibold text-slate-100">氧化參數</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          氧化速率是定量氧化厚度的必要參數；若尚未填入，仍可使用 Raman 解釋清單做定性判讀。
        </p>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <label className="block text-xs text-slate-400">
          目標材料
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => onUpdateScenario({ targetMaterialId: event.target.value })}
            value={scenario.targetMaterialId}
          >
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {getMaterialLabel(material.id)}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          產物材料
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({ productMaterialId: event.target.value || undefined })
            }
            value={scenario.productMaterialId ?? ''}
          >
            <option value="">尚未選擇</option>
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
            onChange={(event) => handleSelectTargetLayer(event.target.value)}
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
                confidence: event.target.value as OxidationConfidence,
              })
            }
            value={scenario.confidence}
          >
            {(['known', 'estimated', 'unknown'] as OxidationConfidence[]).map(
              (confidence) => (
                <option key={confidence} value={confidence}>
                  {oxidationConfidenceLabels[confidence]}
                </option>
              ),
            )}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          氧化方法
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              onUpdateScenario({ method: event.target.value as OxidationMethod })
            }
            value={scenario.method}
          >
            {oxidationMethods.map((method) => (
              <option key={method} value={method}>
                {oxidationMethodLabels[method]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
          <NumberField
            label="製程時間"
            onChange={(value) =>
              onUpdateScenario({
                processTime_s: value === null ? null : value * currentUnit.factor,
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

        <NumberField
          label="溫度"
          onChange={(value) => onUpdateScenario({ temperature_C: value })}
          unit="°C"
          value={scenario.temperature_C}
        />
        <NumberField
          label="功率"
          onChange={(value) => onUpdateScenario({ power_W: value })}
          unit="W"
          value={scenario.power_W}
        />
        <NumberField
          label="氧氣濃度"
          onChange={(value) =>
            onUpdateScenario({ oxygenConcentration_percent: value })
          }
          unit="%"
          value={scenario.oxygenConcentration_percent}
        />
        <NumberField
          label="濕度"
          onChange={(value) => onUpdateScenario({ humidity_percent: value })}
          unit="%"
          value={scenario.humidity_percent}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <NumberField
          label="初始厚度"
          onChange={(value) => onUpdateScenario({ initialThickness_nm: value })}
          unit="nm"
          value={scenario.initialThickness_nm}
        />
        <NumberField
          label="初始層數"
          onChange={(value) => onUpdateScenario({ initialLayerCount: value })}
          unit="層"
          value={scenario.initialLayerCount}
        />
        <NumberField
          label="氧化速率"
          onChange={(value) =>
            onUpdateScenario({ oxidationRate_nm_per_s: value })
          }
          unit="nm/s"
          value={scenario.oxidationRate_nm_per_s}
        />
        <NumberField
          label="氧化不均勻因子"
          onChange={(value) => onUpdateScenario({ nonuniformityFactor: value ?? 1 })}
          unit="×"
          value={scenario.nonuniformityFactor}
        />
        <NumberField
          label="製程損傷因子"
          onChange={(value) => onUpdateScenario({ damageFactor: value ?? 1 })}
          unit="×"
          value={scenario.damageFactor}
        />
        <NumberField
          label="Raman 探測深度"
          onChange={(value) => onUpdateScenario({ ramanProbeDepth_nm: value })}
          unit="nm"
          value={scenario.ramanProbeDepth_nm}
        />
        <NumberField
          label="雷射穿透深度"
          onChange={(value) =>
            onUpdateScenario({ laserPenetrationDepth_nm: value })
          }
          unit="nm"
          value={scenario.laserPenetrationDepth_nm}
        />
      </div>

      <label className="mt-4 block text-xs text-slate-400">
        Raman 備註
        <textarea
          className="mt-1 min-h-20 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
          onChange={(event) => onUpdateScenario({ notes_zh: event.target.value })}
          placeholder="例如：雷射功率、spot size、是否 mapping、是否低功率 Raman"
          value={scenario.notes_zh ?? ''}
        />
      </label>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/50 p-3 text-xs leading-5 text-slate-500">
        <p>氧化速率是定量氧化厚度的必要參數。</p>
        <p>Raman 探測深度會影響殘留 WSe₂ 是否仍可能被看到。</p>
        <p>nonuniformity factor 用於定性表示氧化不均勻，不是嚴格反應速率。</p>
        <p>damage factor 用於定性表示製程損傷風險，不是材料破壞程度的定量值。</p>
        <p>材料資料庫中的氧化與 Raman 相關參數仍需文獻校準；候選文獻資料庫將在後續批次獨立管理。</p>
      </div>

      {scenario.oxidationRate_nm_per_s === null ? (
        <p className="mt-3 rounded-md border border-amber-800/50 bg-amber-950/25 px-3 py-2 text-xs leading-5 text-amber-100/85">
          需要氧化速率或實驗校準，暫無法定量估算氧化厚度。
        </p>
      ) : null}

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
          尚未選擇目標材料層，因此無法直接比較氧化厚度與材料層厚度。
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

function isRelevantProcessStep(step: ProcessStep) {
  const name = step.name_zh.toLowerCase()

  return (
    ['oxidation', 'rie', 'diffusion_annealing'].includes(step.type) ||
    (step.type === 'custom' &&
      ['oxidation', 'rie', 'o2', 'o₂', 'uv ozone', '氧化'].some((keyword) =>
        name.includes(keyword),
      ))
  )
}

function mapStepToScenario(step: ProcessStep): Partial<OxidationScenario> {
  const parameterValue = (id: string) =>
    step.parameters.find((parameter) => parameter.id === id)?.value
  const updates: Partial<OxidationScenario> = {}
  const timeMinutes = parameterValue('time_min')
  const timeSeconds = parameterValue('time_s')
  const temperature = parameterValue('temperature_C') ?? parameterValue('sample_temperature_C')
  const power = parameterValue('power_W')
  const oxygenConcentration = parameterValue('oxygen_concentration')
  const humidity = parameterValue('humidity')
  const initialMaterial = parameterValue('initial_material') ?? parameterValue('target_material')
  const productMaterial = parameterValue('target_oxide')
  const method = parameterValue('oxidation_method')

  if (typeof timeSeconds === 'number') {
    updates.processTime_s = timeSeconds
  } else if (typeof timeMinutes === 'number') {
    updates.processTime_s = timeMinutes * 60
  }

  if (typeof temperature === 'number') {
    updates.temperature_C = temperature
  }

  if (typeof power === 'number') {
    updates.power_W = power
  }

  if (typeof oxygenConcentration === 'number') {
    updates.oxygenConcentration_percent = oxygenConcentration
  }

  if (typeof humidity === 'number') {
    updates.humidity_percent = humidity
  }

  if (typeof initialMaterial === 'string' && initialMaterial) {
    const matchingMaterial = findMaterialByText(initialMaterial)
    updates.targetMaterialId = matchingMaterial?.id ?? initialMaterial
  }

  if (typeof productMaterial === 'string' && productMaterial) {
    const matchingMaterial = findMaterialByText(productMaterial)
    updates.productMaterialId = matchingMaterial?.id ?? productMaterial
  }

  if (typeof method === 'string') {
    updates.method = mapMethodText(method)
  } else if (step.type === 'rie') {
    updates.method = 'o2_rie'
  } else if (step.type === 'oxidation') {
    updates.method = 'custom'
  }

  return updates
}

function findMaterialByText(text: string) {
  const normalized = text.toLowerCase().replaceAll('₂', '2').replaceAll('₃', '3')

  return materials.find((material) => {
    const candidates = [material.id, material.name, material.displayName].map((value) =>
      value.toLowerCase().replaceAll('₂', '2').replaceAll('₃', '3'),
    )

    return candidates.some((candidate) => normalized.includes(candidate))
  })
}

function mapMethodText(text: string): OxidationMethod {
  const normalized = text.toLowerCase()

  if (normalized.includes('rie')) {
    return 'o2_rie'
  }

  if (normalized.includes('uv')) {
    return 'uv_ozone'
  }

  if (normalized.includes('thermal')) {
    return 'thermal_oxidation'
  }

  if (normalized.includes('ambient') || normalized.includes('air')) {
    return 'ambient_exposure'
  }

  if (normalized.includes('plasma')) {
    return 'plasma_oxidation'
  }

  return 'custom'
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
