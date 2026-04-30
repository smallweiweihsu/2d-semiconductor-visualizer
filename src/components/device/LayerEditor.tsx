import type { ReactNode } from 'react'
import { deviceRoles } from '../../data/deviceRoles'
import {
  materialCategories,
  materialCategoryLabels,
} from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type { DeviceLayer, VoltageMode } from '../../types/device'
import { parseNumberInput, voltageModeLabels } from './deviceFormatting'
import { validateLayer } from './deviceValidation'

interface LayerEditorProps {
  layer: DeviceLayer | null
  onUpdateLayer: (layer: DeviceLayer) => void
}

const voltageModes: VoltageMode[] = ['none', 'grounded', 'biased', 'floating']

export function LayerEditor({ layer, onUpdateLayer }: LayerEditorProps) {
  if (!layer) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
        <h3 className="text-sm font-medium text-slate-200">材料層設定</h3>
        <p className="mt-3 text-sm text-slate-500">請先選擇或新增一個材料層。</p>
      </section>
    )
  }

  const activeLayer = layer
  const layerWarnings = validateLayer(activeLayer)

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

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
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
        <section className="grid gap-3 md:grid-cols-2">
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

          <div className="grid grid-cols-[1fr_120px] gap-3">
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
      <div className="mt-3 grid gap-3 md:grid-cols-3">{children}</div>
    </section>
  )
}
