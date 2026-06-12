import { ArrowDown, ArrowUp, Copy, Plus, Trash2 } from 'lucide-react'
import { findMaterial } from './materialUtils'
import type { DeviceLayer, DeviceStructure, Material } from '../../types/semiviz'

export function LayerStackPanel({
  device,
  materials,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  onDuplicate,
  onMove,
}: {
  device: DeviceStructure
  materials: Material[]
  selectedId: string
  onSelect: (layerId: string) => void
  onAdd: () => void
  onDelete: (layerId: string) => void
  onDuplicate: (layerId: string) => void
  onMove: (layerId: string, direction: 'up' | 'down') => void
}) {
  return (
    <>
      <div className="builder-toolbar">
        <button className="manus-button primary" type="button" onClick={onAdd}>
          <Plus size={15} />
          新增 layer
        </button>
      </div>
      {device.layers.length ? device.layers.map((layer, index) => (
        <LayerRow
          layer={layer}
          materials={materials}
          selected={layer.id === selectedId}
          canMoveUp={index > 0}
          canMoveDown={index < device.layers.length - 1}
          key={layer.id}
          onSelect={onSelect}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onMove={onMove}
        />
      )) : (
        <div className="empty-state">
          <span>尚無 layer，請新增第一個 layer。</span>
          <button className="manus-button primary" type="button" onClick={onAdd}>新增第一個 layer</button>
        </div>
      )}
    </>
  )
}

function LayerRow({
  layer,
  materials,
  selected,
  canMoveUp,
  canMoveDown,
  onSelect,
  onDelete,
  onDuplicate,
  onMove,
}: {
  layer: DeviceLayer
  materials: Material[]
  selected: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onSelect: (layerId: string) => void
  onDelete: (layerId: string) => void
  onDuplicate: (layerId: string) => void
  onMove: (layerId: string, direction: 'up' | 'down') => void
}) {
  const material = findMaterial(materials, layer.materialId)

  return (
    <div className={selected ? 'layer-editor-row active' : 'layer-editor-row'}>
      <button className="layer-row-main" type="button" onClick={() => onSelect(layer.id)}>
        <span style={{ backgroundColor: material.color }} />
        <div>
          <strong>{layer.name}</strong>
          <small>{layer.role} · {layer.geometry.thickness_nm} nm</small>
          <em>{layer.electricalRole}</em>
        </div>
      </button>
      <div className="layer-row-tools">
        <button aria-label={`上移 ${layer.name}`} disabled={!canMoveUp} type="button" onClick={() => onMove(layer.id, 'up')}><ArrowUp size={14} /></button>
        <button aria-label={`下移 ${layer.name}`} disabled={!canMoveDown} type="button" onClick={() => onMove(layer.id, 'down')}><ArrowDown size={14} /></button>
        <button aria-label={`複製 ${layer.name}`} type="button" onClick={() => onDuplicate(layer.id)}><Copy size={14} /></button>
        <button aria-label={`刪除 ${layer.name}`} type="button" onClick={() => onDelete(layer.id)}><Trash2 size={14} /></button>
      </div>
    </div>
  )
}
