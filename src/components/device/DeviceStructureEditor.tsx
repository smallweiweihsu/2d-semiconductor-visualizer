import { useMemo, useState } from 'react'
import { initialDeviceStructure } from '../../data/deviceStructures'
import type { DeviceLayer, DeviceStructure } from '../../types/device'
import { DeviceSummary } from './DeviceSummary'
import { DeviceValidationPanel } from './DeviceValidationPanel'
import { LayerEditor } from './LayerEditor'
import { LayerStackList } from './LayerStackList'
import { LayerStackPreview } from './LayerStackPreview'
import { validateDeviceStructure } from './deviceValidation'

export function DeviceStructureEditor() {
  const [structure, setStructure] = useState<DeviceStructure>(() =>
    structuredClone(initialDeviceStructure),
  )
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(
    'layer-channel-wse2',
  )

  const warnings = useMemo(
    () => validateDeviceStructure(structure),
    [structure],
  )
  const selectedLayer =
    structure.layers.find((layer) => layer.id === selectedLayerId) ?? null

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

  function addLayer() {
    const newLayer: DeviceLayer = {
      id: createLayerId(),
      name: '新增材料層',
      materialId: 'wse2',
      role: 'custom',
      geometry: {
        length_um: 5,
        width_um: 2,
        thickness_nm: 10,
        x_um: 0,
        y_um: 0,
        z_nm: getTopZ(structure.layers),
        rotation_deg: 0,
      },
      voltageMode: 'none',
      voltageValue_V: null,
      visible: true,
      opacity: 1,
      notes_zh: '',
    }

    setStructure((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      layers: [...current.layers, newLayer],
    }))
    setSelectedLayerId(newLayer.id)
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
    <section className="flex min-h-[36rem] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">元件結構</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            建立與編輯材料層、幾何尺寸、材料角色與偏壓標籤，作為後續 3D 視覺化與物理近似分析的結構資料來源。
          </p>
        </div>
      </header>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/90">
        目前元件結構編輯器用於建立幾何與材料堆疊模型，尚未進行真實 3D、電性、擴散或製程模擬。
      </aside>

      <div className="grid min-h-0 gap-4 2xl:grid-cols-[320px_minmax(0,1fr)_420px]">
        <div className="flex min-h-[40rem] flex-col gap-4">
          <LayerStackList
            layers={structure.layers}
            selectedLayerId={selectedLayerId}
            warnings={warnings}
            onAddLayer={addLayer}
            onDeleteLayer={deleteLayer}
            onDuplicateLayer={duplicateLayer}
            onMoveLayer={moveLayer}
            onSelectLayer={setSelectedLayerId}
          />
          <DeviceValidationPanel warnings={warnings} />
        </div>

        <div className="grid gap-4">
          <LayerStackPreview
            layers={structure.layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
          />
          <DeviceSummary
            structure={structure}
            warnings={warnings}
            onUpdateStructure={updateStructure}
          />
        </div>

        <LayerEditor layer={selectedLayer} onUpdateLayer={updateLayer} />
      </div>
    </section>
  )
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
