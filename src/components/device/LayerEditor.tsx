import type { ReactNode } from 'react'
import { useState } from 'react'
import { deviceRoles } from '../../data/deviceRoles'
import {
  materialCategories,
  materialCategoryLabels,
} from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type { DeviceLayer, LayerPlacementPreset, VoltageMode } from '../../types/device'
import { parseNumberInput, voltageModeLabels } from './deviceFormatting'
import {
  alignLayerToReference,
  applyPlacementPreset,
  fitLayerToReference,
  placementPresetLabels,
} from './layerPlacement'
import { validateLayer } from './deviceValidation'

interface LayerEditorProps {
  layers: DeviceLayer[]
  layer: DeviceLayer | null
  onUpdateLayer: (layer: DeviceLayer) => void
}

const voltageModes: VoltageMode[] = ['none', 'grounded', 'biased', 'floating']
const quickPlacementPresets: LayerPlacementPreset[] = [
  'fit_selected_layer',
  'above_selected_layer',
  'below_selected_layer',
  'centered_on_selected_layer',
  'source_contact',
  'drain_contact',
  'top_gate',
  'top_dielectric',
  'local_oxide',
]

export function LayerEditor({ layers, layer, onUpdateLayer }: LayerEditorProps) {
  const [referenceLayerId, setReferenceLayerId] = useState<string>('')
  const [placementPreset, setPlacementPreset] =
    useState<LayerPlacementPreset>('centered_on_selected_layer')

  if (!layer) {
    return (
      <section className="min-w-0 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-medium text-slate-200">材料層設定</h3>
        <p className="mt-3 text-sm text-slate-500">請先選擇或新增一個材料層。</p>
      </section>
    )
  }

  const activeLayer = layer
  const layerWarnings = validateLayer(activeLayer)
  const referenceLayer =
    layers.find((item) => item.id === referenceLayerId) ??
    layers.find((item) => item.id !== activeLayer.id && item.role === 'semiconductor') ??
    layers.find((item) => item.id !== activeLayer.id) ??
    null

  function updateLayer(updates: Partial<DeviceLayer>) {
    onUpdateLayer({ ...activeLayer, ...updates })
  }

  function updateGeometry(
    key: keyof DeviceLayer['geometry'],
    value: number,
  ) {
    onUpdateLayer({
      ...activeLayer,
      geometry: {
        ...activeLayer.geometry,
        [key]: value,
      },
    })
  }

  function applyQuickPlacement() {
    if (!referenceLayer) {
      return
    }

    onUpdateLayer(applyPlacementPreset(activeLayer, referenceLayer, placementPreset))
  }

  return (
    <section className="min-w-0 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/40 p-4 min-[1800px]:max-h-[calc(100vh-14rem)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-200">材料層設定</h3>
          <p className="mt-1 text-xs text-slate-500">
            編輯目前選取材料層的幾何、材料、角色與偏壓標籤。
          </p>
        </div>
        {layerWarnings.length > 0 ? (
          <span className="rounded-full border border-amber-800 bg-amber-950/30 px-2 py-1 text-xs text-amber-100">
            {layerWarnings.length} 項提醒
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4">
        <section className="rounded-md border border-cyan-900/40 bg-cyan-950/10 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="text-xs font-medium text-cyan-100">快速放置</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                選擇參考層後，可快速建立接觸、上閘極、介電層或對齊目前材料層。
              </p>
            </div>
            <button
              className="rounded-md border border-cyan-700 bg-cyan-950/40 px-3 py-2 text-xs text-cyan-100 hover:border-cyan-500"
              disabled={!referenceLayer}
              onClick={applyQuickPlacement}
              type="button"
            >
              套用放置方式
            </button>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2 min-[1800px]:grid-cols-1">
            <label className="block text-xs text-slate-400">
              參考材料層
              <select
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
                onChange={(event) => setReferenceLayerId(event.target.value)}
                value={referenceLayer?.id ?? ''}
              >
                {layers
                  .filter((item) => item.id !== activeLayer.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block text-xs text-slate-400">
              放置方式
              <select
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
                onChange={(event) =>
                  setPlacementPreset(event.target.value as LayerPlacementPreset)
                }
                value={placementPreset}
              >
                {quickPlacementPresets.map((preset) => (
                  <option key={preset} value={preset}>
                    {placementPresetLabels[preset]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <QuickPlacementButton
              disabled={!referenceLayer}
              label="靠左對齊"
              onClick={() =>
                referenceLayer &&
                onUpdateLayer(alignLayerToReference(activeLayer, referenceLayer, 'left'))
              }
            />
            <QuickPlacementButton
              disabled={!referenceLayer}
              label="置中對齊"
              onClick={() =>
                referenceLayer &&
                onUpdateLayer(alignLayerToReference(activeLayer, referenceLayer, 'center'))
              }
            />
            <QuickPlacementButton
              disabled={!referenceLayer}
              label="靠右對齊"
              onClick={() =>
                referenceLayer &&
                onUpdateLayer(alignLayerToReference(activeLayer, referenceLayer, 'right'))
              }
            />
            <QuickPlacementButton
              disabled={!referenceLayer}
              label="符合參考層尺寸"
              onClick={() =>
                referenceLayer && onUpdateLayer(fitLayerToReference(activeLayer, referenceLayer))
              }
            />
          </div>
        </section>

        <section className="grid min-w-0 gap-3 md:grid-cols-2 min-[1800px]:grid-cols-1">
          <TextField
            label="材料層名稱"
            onChange={(value) => updateLayer({ name: value })}
            value={activeLayer.name}
          />

          <label className="block text-xs text-slate-400">
            材料
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
              onChange={(event) => updateLayer({ materialId: event.target.value })}
              value={activeLayer.materialId}
            >
              {materialCategories.map((category) => (
                <optgroup
                  key={category.id}
                  label={category.label_zh}
                >
                  {materials
                    .filter((material) => material.category === category.id)
                    .map((material) => (
                      <option key={material.id} value={material.id}>
                        {material.displayName} ·{' '}
                        {materialCategoryLabels[material.category]}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className="block text-xs text-slate-400">
            角色
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
              onChange={(event) =>
                updateLayer({ role: event.target.value as DeviceLayer['role'] })
              }
              value={activeLayer.role}
            >
              {deviceRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label_zh}
                </option>
              ))}
            </select>
          </label>

          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px] md:col-span-2 min-[1800px]:col-span-1">
            <label className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
              <input
                checked={activeLayer.visible}
                onChange={(event) => updateLayer({ visible: event.target.checked })}
                type="checkbox"
              />
              顯示此層
            </label>

            <label className="block text-xs text-slate-400">
              透明度
              <input
                className="mt-2 w-full"
                max="1"
                min="0.15"
                onChange={(event) =>
                  updateLayer({
                    opacity: parseNumberInput(event.target.value, activeLayer.opacity),
                  })
                }
                step="0.05"
                type="range"
                value={activeLayer.opacity}
              />
            </label>
          </div>
        </section>

        <FormSection title="幾何尺寸與位置">
          <div className="rounded-md border border-slate-800 bg-slate-900/50 p-3 text-xs leading-5 text-slate-500 md:col-span-3 min-[1800px]:col-span-2">
            目前 x / y 位置是以元件中心為座標原點的示意位置。若不確定數值，可先使用快速放置，例如「源極接觸」、「汲極接觸」或「置中於參考層」，再微調尺寸。
          </div>
          <NumberField
            label="長度"
            onChange={(value) => updateGeometry('length_um', value)}
            unit="µm"
            value={activeLayer.geometry.length_um}
          />
          <NumberField
            label="寬度"
            onChange={(value) => updateGeometry('width_um', value)}
            unit="µm"
            value={activeLayer.geometry.width_um}
          />
          <NumberField
            label="厚度"
            onChange={(value) => updateGeometry('thickness_nm', value)}
            unit="nm"
            value={activeLayer.geometry.thickness_nm}
          />
          <NumberField
            label="X 位置"
            onChange={(value) => updateGeometry('x_um', value)}
            unit="µm"
            value={activeLayer.geometry.x_um}
          />
          <NumberField
            label="Y 位置"
            onChange={(value) => updateGeometry('y_um', value)}
            unit="µm"
            value={activeLayer.geometry.y_um}
          />
          <NumberField
            label="旋轉角度"
            onChange={(value) => updateGeometry('rotation_deg', value)}
            unit="deg"
            value={activeLayer.geometry.rotation_deg ?? 0}
          />
        </FormSection>

        <FormSection title="偏壓標籤">
          <label className="block text-xs text-slate-400">
            偏壓模式
            <select
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
              onChange={(event) =>
                updateLayer({ voltageMode: event.target.value as VoltageMode })
              }
              value={activeLayer.voltageMode}
            >
              {voltageModes.map((mode) => (
                <option key={mode} value={mode}>
                  {voltageModeLabels[mode]}
                </option>
              ))}
            </select>
          </label>
          <TextField
            label="電壓標籤"
            onChange={(value) => updateLayer({ voltageLabel: value })}
            placeholder="Vs、Vd、Vg 或自訂文字"
            value={activeLayer.voltageLabel ?? ''}
          />
          <label className="block text-xs text-slate-400">
            電壓值
            <div className="mt-1 flex rounded-md border border-slate-700 bg-slate-950 focus-within:border-cyan-600">
              <input
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none"
                onChange={(event) =>
                  updateLayer({
                    voltageValue_V:
                      event.target.value === ''
                        ? null
                        : parseNumberInput(event.target.value, 0),
                  })
                }
                placeholder="可留空"
                type="number"
                value={activeLayer.voltageValue_V ?? ''}
              />
              <span className="border-l border-slate-800 px-3 py-2 text-sm text-slate-500">
                V
              </span>
            </div>
          </label>
        </FormSection>

        <label className="block text-xs text-slate-400">
          備註
          <textarea
            className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm leading-6 text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => updateLayer({ notes_zh: event.target.value })}
            placeholder="記錄此材料層的用途、實驗條件或不確定性。"
            value={activeLayer.notes_zh ?? ''}
          />
        </label>

        {layerWarnings.length > 0 ? (
          <div className="rounded-md border border-amber-900/50 bg-amber-950/20 p-3 text-xs leading-5 text-amber-100">
            {layerWarnings.map((warning) => (
              <div key={warning.id}>• {warning.message_zh}</div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function QuickPlacementButton({
  disabled = false,
  label,
  onClick,
}: {
  disabled?: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

interface TextFieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function TextField({ label, value, placeholder, onChange }: TextFieldProps) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

interface NumberFieldProps {
  label: string
  value: number
  unit: string
  onChange: (value: number) => void
}

function NumberField({ label, value, unit, onChange }: NumberFieldProps) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <div className="mt-1 flex rounded-md border border-slate-700 bg-slate-950 focus-within:border-cyan-600">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none"
          onChange={(event) => onChange(parseNumberInput(event.target.value, value))}
          type="number"
          value={value}
        />
        <span className="border-l border-slate-800 px-3 py-2 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </label>
  )
}

interface FormSectionProps {
  title: string
  children: ReactNode
}

function FormSection({ title, children }: FormSectionProps) {
  return (
    <section>
      <h4 className="text-xs font-medium text-slate-300">{title}</h4>
      <div className="mt-3 grid min-w-0 gap-3 md:grid-cols-3 min-[1800px]:grid-cols-2">{children}</div>
    </section>
  )
}
