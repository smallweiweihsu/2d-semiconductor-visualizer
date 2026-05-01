import { useMemo, useState } from 'react'
import { deviceRoles } from '../../data/deviceRoles'
import { materialCategories, materialCategoryLabels } from '../../data/materialCategories'
import { materials } from '../../data/materials'
import type {
  DeviceLayer,
  DeviceLayerRole,
  LayerPlacementPreset,
} from '../../types/device'
import { getMaterialDisplayName } from './deviceFormatting'
import { placementPresetLabels } from './layerPlacement'

export interface AddLayerDraft {
  materialId: string
  role: DeviceLayerRole
  referenceLayerId: string | null
  placementPreset: LayerPlacementPreset
  length_um: number
  width_um: number
  thickness_nm: number
}

interface AddLayerPanelProps {
  layers: DeviceLayer[]
  selectedLayerId: string | null
  onAddLayer: (draft: AddLayerDraft) => void
  onCancel: () => void
}

const placementPresets: LayerPlacementPreset[] = [
  'manual',
  'fit_selected_layer',
  'above_selected_layer',
  'below_selected_layer',
  'centered_on_selected_layer',
  'left_contact',
  'right_contact',
  'source_contact',
  'drain_contact',
  'top_gate',
  'top_dielectric',
  'local_oxide',
  'full_width_base',
]

export function AddLayerPanel({
  layers,
  selectedLayerId,
  onAddLayer,
  onCancel,
}: AddLayerPanelProps) {
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId) ?? null
  const [draft, setDraft] = useState<AddLayerDraft>(() =>
    createInitialDraft(selectedLayer),
  )

  const materialOptions = useMemo(
    () =>
      materialCategories.map((category) => ({
        category,
        materials: materials.filter((material) => material.category === category.id),
      })),
    [],
  )

  function updateDraft(updates: Partial<AddLayerDraft>) {
    setDraft((current) => ({ ...current, ...updates }))
  }

  function updatePlacementDraft(updates: Partial<AddLayerDraft>) {
    setDraft((current) => {
      const nextDraft = { ...current, ...updates }
      const nextReferenceLayer =
        layers.find((layer) => layer.id === nextDraft.referenceLayerId) ??
        selectedLayer

      return inferDraftDimensions(nextDraft, nextReferenceLayer)
    })
  }

  return (
    <section className="rounded-lg border border-cyan-900/50 bg-cyan-950/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">新增材料層</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            先選材料、角色與參考層，再用放置方式建立合理的初始幾何；新增後仍可手動微調。
          </p>
        </div>
        <button
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-500"
          onClick={onCancel}
          type="button"
        >
          取消
        </button>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
        <label className="block text-xs text-slate-400">
          材料
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => {
              const material = materials.find((item) => item.id === event.target.value)
              updateDraft({
                materialId: event.target.value,
                role: inferRoleFromMaterial(currentRoleForMaterial(draft.role), material?.category),
              })
            }}
            value={draft.materialId}
          >
            {materialOptions.map(({ category, materials: categoryMaterials }) => (
              <optgroup key={category.id} label={category.label_zh}>
                {categoryMaterials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.displayName} · {materialCategoryLabels[material.category]}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          材料層角色
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              updateDraft({ role: event.target.value as DeviceLayerRole })
            }
            value={draft.role}
          >
            {deviceRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.label_zh}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          參考材料層
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              updatePlacementDraft({ referenceLayerId: event.target.value || null })
            }
            value={draft.referenceLayerId ?? ''}
          >
            <option value="">無參考層</option>
            {selectedLayer ? (
              <option value={selectedLayer.id}>
                目前選取：{selectedLayer.name}
              </option>
            ) : null}
            {layers
              .filter((layer) => layer.id !== selectedLayer?.id)
              .map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.name} · {getMaterialDisplayName(layer.materialId)}
                </option>
              ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          放置方式
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) =>
              updatePlacementDraft({
                placementPreset: event.target.value as LayerPlacementPreset,
                role: inferRoleFromPreset(
                  event.target.value as LayerPlacementPreset,
                  draft.role,
                ),
              })
            }
            value={draft.placementPreset}
          >
            {placementPresets.map((preset) => (
              <option key={preset} value={preset}>
                {placementPresetLabels[preset]}
              </option>
            ))}
          </select>
        </label>

        <NumberDraftField
          label="長度"
          onChange={(value) => updateDraft({ length_um: value })}
          unit="µm"
          value={draft.length_um}
        />
        <NumberDraftField
          label="寬度"
          onChange={(value) => updateDraft({ width_um: value })}
          unit="µm"
          value={draft.width_um}
        />
        <NumberDraftField
          label="厚度"
          onChange={(value) => updateDraft({ thickness_nm: value })}
          unit="nm"
          value={draft.thickness_nm}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-md border border-cyan-600 bg-cyan-950/50 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-400"
          onClick={() => onAddLayer(draft)}
          type="button"
        >
          新增並套用放置方式
        </button>
        <button
          className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500"
          onClick={onCancel}
          type="button"
        >
          取消
        </button>
      </div>
    </section>
  )
}

function createInitialDraft(selectedLayer: DeviceLayer | null): AddLayerDraft {
  return inferDraftDimensions(
    {
      materialId: 'wse2',
      role: 'custom',
      referenceLayerId: selectedLayer?.id ?? null,
      placementPreset: selectedLayer ? 'above_selected_layer' : 'manual',
      length_um: 5,
      width_um: 2,
      thickness_nm: 10,
    },
    selectedLayer,
  )
}

function inferDraftDimensions(
  draft: AddLayerDraft,
  referenceLayer: DeviceLayer | null,
): AddLayerDraft {
  if (!referenceLayer || draft.placementPreset === 'manual') {
    return draft
  }

  if (['source_contact', 'drain_contact', 'left_contact', 'right_contact'].includes(draft.placementPreset)) {
    return {
      ...draft,
      length_um: roundGeometry(Math.max(0.35, referenceLayer.geometry.length_um * 0.24)),
      width_um: referenceLayer.geometry.width_um,
    }
  }

  if (draft.placementPreset === 'top_gate') {
    return {
      ...draft,
      length_um: roundGeometry(referenceLayer.geometry.length_um * 0.7),
      width_um: roundGeometry(referenceLayer.geometry.width_um * 1.05),
    }
  }

  if (draft.placementPreset === 'top_dielectric') {
    return {
      ...draft,
      length_um: roundGeometry(referenceLayer.geometry.length_um * 1.15),
      width_um: roundGeometry(referenceLayer.geometry.width_um * 1.15),
    }
  }

  if (draft.placementPreset === 'local_oxide') {
    return {
      ...draft,
      length_um: roundGeometry(referenceLayer.geometry.length_um * 0.4),
      width_um: roundGeometry(referenceLayer.geometry.width_um * 0.8),
    }
  }

  return {
    ...draft,
    length_um: referenceLayer.geometry.length_um,
    width_um: referenceLayer.geometry.width_um,
  }
}

function NumberDraftField({
  label,
  value,
  unit,
  onChange,
}: {
  label: string
  value: number
  unit: string
  onChange: (value: number) => void
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <div className="mt-1 flex rounded-md border border-slate-700 bg-slate-950 focus-within:border-cyan-600">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 outline-none"
          onChange={(event) => onChange(Number(event.target.value))}
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

function inferRoleFromPreset(
  preset: LayerPlacementPreset,
  currentRole: DeviceLayerRole,
): DeviceLayerRole {
  if (preset === 'source_contact') {
    return 'source'
  }

  if (preset === 'drain_contact') {
    return 'drain'
  }

  if (preset === 'left_contact' || preset === 'right_contact') {
    return 'contact'
  }

  if (preset === 'top_gate') {
    return 'gate'
  }

  if (preset === 'top_dielectric') {
    return 'dielectric'
  }

  if (preset === 'local_oxide') {
    return 'oxide'
  }

  return currentRole
}

function inferRoleFromMaterial(
  currentRole: DeviceLayerRole,
  category?: string,
): DeviceLayerRole {
  if (currentRole !== 'custom') {
    return currentRole
  }

  if (category === 'metal') {
    return 'contact'
  }

  if (category === 'two_d_semiconductor') {
    return 'semiconductor'
  }

  if (category === 'dielectric') {
    return 'dielectric'
  }

  if (category === 'oxide') {
    return 'oxide'
  }

  if (category === 'bulk_conductor') {
    return 'bulk'
  }

  return currentRole
}

function currentRoleForMaterial(role: DeviceLayerRole) {
  return role
}

function roundGeometry(value: number) {
  return Math.round(value * 1000) / 1000
}
