import {
  lazy,
  Suspense,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  createDeviceStructureFromTemplate,
  deviceTemplates,
  initialDeviceStructure,
} from '../../data/deviceStructures'
import { materials } from '../../data/materials'
import type { DeviceLayer, DeviceStructure } from '../../types/device'
import { AddLayerPanel, type AddLayerDraft } from './AddLayerPanel'
import { DeviceSummary } from './DeviceSummary'
import { DeviceTemplateSelector } from './DeviceTemplateSelector'
import { DeviceValidationPanel } from './DeviceValidationPanel'
import { LayerEditor } from './LayerEditor'
import { LayerStackList } from './LayerStackList'
import { LayerStackPreview } from './LayerStackPreview'
import {
  createDefaultLayerFromPlacement,
  getInsertionIndex,
} from './layerPlacement'
import { validateDeviceStructure } from './deviceValidation'

const Device3DViewer = lazy(() =>
  import('../viewer3d/Device3DViewer').then((module) => ({
    default: module.Device3DViewer,
  })),
)

interface DeviceStructureEditorProps {
  structure: DeviceStructure
  onChangeStructure: Dispatch<SetStateAction<DeviceStructure>>
}

export function DeviceStructureEditor({
  structure,
  onChangeStructure: setStructure,
}: DeviceStructureEditorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    initialDeviceStructure.templateId ?? deviceTemplates[0].id,
  )
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    getInitialSelectedLayerId(initialDeviceStructure),
  )
  const [visualizationMode, setVisualizationMode] = useState<'3d' | '2d'>('3d')
  const [showAddLayerPanel, setShowAddLayerPanel] = useState(false)

  const warnings = useMemo(
    () => validateDeviceStructure(structure),
    [structure],
  )
  const selectedTemplate =
    deviceTemplates.find((template) => template.id === selectedTemplateId) ??
    deviceTemplates[0]
  const templateBaseline = useMemo(
    () => createDeviceStructureFromTemplate(selectedTemplate),
    [selectedTemplate],
  )
  const hasUnsavedEdits = useMemo(
    () => getStructureSignature(structure) !== getStructureSignature(templateBaseline),
    [structure, templateBaseline],
  )
  const selectedLayer =
    structure.layers.find((layer) => layer.id === selectedLayerId) ?? null

  function handleSelectTemplate(templateId: string) {
    if (templateId === selectedTemplateId) {
      return
    }

    if (
      hasUnsavedEdits &&
      !window.confirm('切換模板會取代目前元件結構。確定要套用新模板嗎？')
    ) {
      return
    }

    const nextTemplate =
      deviceTemplates.find((template) => template.id === templateId) ??
      deviceTemplates[0]
    const nextStructure = createDeviceStructureFromTemplate(nextTemplate)

    setSelectedTemplateId(nextTemplate.id)
    setStructure({
      ...nextStructure,
      updatedAt: new Date().toISOString(),
    })
    setSelectedLayerId(getInitialSelectedLayerId(nextStructure))
  }

  function updateStructure(updates: Partial<DeviceStructure>) {
    setStructure((current) => ({
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }))
  }

  function updateLayer(updatedLayer: DeviceLayer) {
    setStructure((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      layers: current.layers.map((layer) =>
        layer.id === updatedLayer.id ? updatedLayer : layer,
      ),
    }))
  }

  function addLayer(draft: AddLayerDraft) {
    const referenceLayer =
      structure.layers.find((layer) => layer.id === draft.referenceLayerId) ??
      selectedLayer
    const material = materials.find((item) => item.id === draft.materialId)
    const newLayer = createDefaultLayerFromPlacement({
      id: createLayerId(),
      materialId: draft.materialId,
      name: createNewLayerName(draft, material?.displayName ?? '新增材料層'),
      role: draft.role,
      referenceLayer,
      placement: {
        preset: draft.placementPreset,
        referenceLayerId: draft.referenceLayerId,
      },
      thickness_nm: draft.thickness_nm,
      length_um: draft.length_um,
      width_um: draft.width_um,
      topZ_nm: getTopZ(structure.layers),
    })
    const insertionIndex = getInsertionIndex(
      structure.layers,
      referenceLayer?.id,
      draft.placementPreset,
    )

    setStructure((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      layers: [
        ...current.layers.slice(0, insertionIndex),
        newLayer,
        ...current.layers.slice(insertionIndex),
      ],
    }))
    setSelectedLayerId(newLayer.id)
    setShowAddLayerPanel(false)
  }

  function deleteLayer(layerId: string) {
    setStructure((current) => {
      const layerIndex = current.layers.findIndex((layer) => layer.id === layerId)
      const nextLayers = current.layers.filter((layer) => layer.id !== layerId)
      const nextSelectedLayer =
        nextLayers[Math.min(layerIndex, nextLayers.length - 1)] ?? null

      setSelectedLayerId(nextSelectedLayer?.id ?? null)

      return {
        ...current,
        updatedAt: new Date().toISOString(),
        layers: nextLayers,
      }
    })
  }

  function duplicateLayer(layerId: string) {
    const layerIndex = structure.layers.findIndex((layer) => layer.id === layerId)
    const layer = structure.layers[layerIndex]

    if (!layer) {
      return
    }

    const duplicatedLayer: DeviceLayer = {
      ...structuredClone(layer),
      id: createLayerId(),
      name: `${layer.name} 副本`,
      geometry: {
        ...layer.geometry,
        x_um: layer.geometry.x_um + 0.2,
        y_um: layer.geometry.y_um + 0.2,
        z_nm: (layer.geometry.z_nm ?? getTopZ(structure.layers)) + layer.geometry.thickness_nm,
      },
    }

    setStructure((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      layers: [
        ...current.layers.slice(0, layerIndex + 1),
        duplicatedLayer,
        ...current.layers.slice(layerIndex + 1),
      ],
    }))
    setSelectedLayerId(duplicatedLayer.id)
  }

  function moveLayer(layerId: string, direction: 'up' | 'down') {
    setStructure((current) => {
      const layerIndex = current.layers.findIndex((layer) => layer.id === layerId)
      const targetIndex = direction === 'up' ? layerIndex + 1 : layerIndex - 1

      if (
        layerIndex < 0 ||
        targetIndex < 0 ||
        targetIndex >= current.layers.length
      ) {
        return current
      }

      const nextLayers = [...current.layers]
      const movedLayer = nextLayers[layerIndex]
      nextLayers[layerIndex] = nextLayers[targetIndex]
      nextLayers[targetIndex] = movedLayer

      return {
        ...current,
        updatedAt: new Date().toISOString(),
        layers: nextLayers,
      }
    })
  }

  return (
    <section className="flex min-h-[36rem] min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/30">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">元件結構</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            建立與編輯材料層、幾何尺寸、材料角色與偏壓標籤，作為後續 3D 視覺化與物理近似分析的結構資料來源。
          </p>
        </div>
      </header>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/90">
        此模板目前用於建立幾何與材料堆疊模型，尚未計算真實能帶、接觸電阻、擴散、氧化或量測響應。
      </aside>

      <DeviceTemplateSelector
        selectedTemplateId={selectedTemplateId}
        templates={deviceTemplates}
        onSelectTemplate={handleSelectTemplate}
      />

      <div className="grid min-h-0 min-w-0 gap-4 min-[1800px]:grid-cols-[300px_minmax(520px,1fr)_420px]">
        <div className="flex min-h-0 min-w-0 flex-col gap-4 min-[1800px]:max-h-[calc(100vh-14rem)]">
          <LayerStackList
            layers={structure.layers}
            selectedLayerId={selectedLayerId}
            warnings={warnings}
            onAddLayer={() => setShowAddLayerPanel(true)}
            onDeleteLayer={deleteLayer}
            onDuplicateLayer={duplicateLayer}
            onMoveLayer={moveLayer}
            onSelectLayer={setSelectedLayerId}
          />
          <DeviceValidationPanel warnings={warnings} />
        </div>

        <div className="grid min-w-0 content-start gap-4">
          {showAddLayerPanel ? (
            <AddLayerPanel
              layers={structure.layers}
              selectedLayerId={selectedLayerId}
              onAddLayer={addLayer}
              onCancel={() => setShowAddLayerPanel(false)}
            />
          ) : null}

          <section className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/30 p-2">
            <div className="mb-2 flex flex-wrap gap-2">
              <PreviewModeButton
                active={visualizationMode === '3d'}
                label="3D 視覺化"
                onClick={() => setVisualizationMode('3d')}
              />
              <PreviewModeButton
                active={visualizationMode === '2d'}
                label="2D 側視圖"
                onClick={() => setVisualizationMode('2d')}
              />
            </div>

            {visualizationMode === '3d' ? (
              <Suspense
                fallback={
                  <div className="grid min-h-[420px] place-items-center rounded-lg border border-slate-800 bg-slate-950/40 text-sm text-slate-500 xl:min-h-[520px]">
                    3D 視覺化載入中...
                  </div>
                }
              >
                <Device3DViewer
                  layers={structure.layers}
                  selectedLayerId={selectedLayerId}
                  onSelectLayer={setSelectedLayerId}
                />
              </Suspense>
            ) : (
              <LayerStackPreview
                layers={structure.layers}
                selectedLayerId={selectedLayerId}
                onSelectLayer={setSelectedLayerId}
              />
            )}
          </section>

          <DeviceSummary
            structure={structure}
            warnings={warnings}
            onUpdateStructure={updateStructure}
          />
        </div>

        <LayerEditor
          layers={structure.layers}
          layer={selectedLayer}
          onUpdateLayer={updateLayer}
        />
      </div>
      </div>
    </section>
  )
}

function createNewLayerName(draft: AddLayerDraft, materialName: string) {
  if (draft.placementPreset === 'source_contact') {
    return `${materialName} 源極接觸`
  }

  if (draft.placementPreset === 'drain_contact') {
    return `${materialName} 汲極接觸`
  }

  if (draft.placementPreset === 'top_gate') {
    return `${materialName} 上閘極`
  }

  if (draft.placementPreset === 'top_dielectric') {
    return `${materialName} 上方介電層`
  }

  if (draft.placementPreset === 'local_oxide') {
    return `${materialName} 局部氧化層`
  }

  return `${materialName} 材料層`
}

function createLayerId() {
  return `layer-${Date.now()}-${Math.round(Math.random() * 10000)}`
}

function getTopZ(layers: DeviceLayer[]) {
  return layers.reduce(
    (maxZ, layer) =>
      Math.max(maxZ, (layer.geometry.z_nm ?? 0) + layer.geometry.thickness_nm),
    0,
  )
}

function getInitialSelectedLayerId(structure: DeviceStructure) {
  return (
    structure.layers.find((layer) => layer.role === 'semiconductor')?.id ??
    structure.layers[0]?.id ??
    null
  )
}

function getStructureSignature(structure: DeviceStructure) {
  return JSON.stringify({
    name: structure.name,
    description_zh: structure.description_zh,
    layers: structure.layers,
  })
}

interface PreviewModeButtonProps {
  active: boolean
  label: string
  onClick: () => void
}

function PreviewModeButton({ active, label, onClick }: PreviewModeButtonProps) {
  return (
    <button
      className={`rounded-md border px-3 py-2 text-sm transition ${
        active
          ? 'border-cyan-600 bg-cyan-950/50 text-cyan-100'
          : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600'
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}
