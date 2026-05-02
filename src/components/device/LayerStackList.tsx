import { useEffect, useRef } from 'react'
import { deviceRoleLabels } from '../../data/deviceRoles'
import type { DeviceLayer, DeviceValidationWarning } from '../../types/device'
import {
  formatThickness,
  formatVoltage,
  getMaterialDisplayName,
} from './deviceFormatting'
import { getLayerWarnings } from './deviceValidation'

interface LayerStackListProps {
  layers: DeviceLayer[]
  selectedLayerId: string | null
  warnings: DeviceValidationWarning[]
  onSelectLayer: (layerId: string) => void
  onAddLayer: () => void
  onDeleteLayer: (layerId: string) => void
  onDuplicateLayer: (layerId: string) => void
  onMoveLayer: (layerId: string, direction: 'up' | 'down') => void
  recentLayerId?: string | null
}

export function LayerStackList({
  layers,
  selectedLayerId,
  warnings,
  onSelectLayer,
  onAddLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onMoveLayer,
  recentLayerId = null,
}: LayerStackListProps) {
  const layersTopToBottom = [...layers].reverse()
  const layerRefs = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    if (!recentLayerId) {
      return
    }

    layerRefs.current[recentLayerId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }, [recentLayerId])

  return (
    <section className="flex min-h-0 min-w-0 flex-col rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-slate-200">材料層堆疊</h3>
          <p className="mt-1 text-xs text-slate-500">上方為元件頂部，下方為底部。</p>
        </div>
        <button
          className="rounded-md border border-cyan-700 bg-cyan-950/40 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-900/50"
          onClick={onAddLayer}
          type="button"
        >
          新增材料層
        </button>
      </div>

      <div className="mt-4 grid min-h-0 min-w-0 flex-1 gap-3 overflow-y-auto pr-1">
        {layersTopToBottom.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-700 p-4 text-sm text-slate-500">
            目前沒有任何材料層。
          </div>
        ) : (
          layersTopToBottom.map((layer, displayIndex) => {
            const originalIndex = layers.findIndex((item) => item.id === layer.id)
            const layerWarnings = getLayerWarnings(layer.id, warnings)
            const isSelected = layer.id === selectedLayerId
            const isRecent = layer.id === recentLayerId
            const isTop = originalIndex === layers.length - 1
            const isBottom = originalIndex === 0
            const voltage = formatVoltage(layer)

            return (
              <article
                className={`rounded-lg border p-3 transition ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-950/35'
                    : 'border-slate-800 bg-slate-900/55'
                } ${isRecent ? 'ring-2 ring-cyan-300/60' : ''}`}
                key={layer.id}
                ref={(node) => {
                  layerRefs.current[layer.id] = node
                }}
              >
                <button
                  className="w-full text-left"
                  onClick={() => onSelectLayer(layer.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-slate-950 px-2 py-1 text-xs text-slate-500">
                          {displayIndex === 0
                            ? '上方'
                            : displayIndex === layersTopToBottom.length - 1
                              ? '下方'
                              : `第 ${displayIndex + 1} 層`}
                        </span>
                        <h4 className="min-w-0 truncate text-sm font-semibold text-slate-100">
                          {layer.name}
                        </h4>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {getMaterialDisplayName(layer.materialId)} ·{' '}
                        {deviceRoleLabels[layer.role]} ·{' '}
                        {formatThickness(layer.geometry.thickness_nm)}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1 text-xs">
                      <span
                        className={`rounded-full border px-2 py-1 ${
                          layer.visible
                            ? 'border-emerald-800 bg-emerald-950/30 text-emerald-100'
                            : 'border-slate-700 bg-slate-900 text-slate-500'
                        }`}
                      >
                        {layer.visible ? '可見' : '隱藏'}
                      </span>
                      {voltage ? (
                        <span className="rounded-full border border-cyan-800 bg-cyan-950/30 px-2 py-1 text-cyan-100">
                          {voltage}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {layerWarnings.length > 0 ? (
                    <div className="mt-3 rounded-md border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
                      此層有 {layerWarnings.length} 項提醒
                    </div>
                  ) : null}
                </button>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4 min-[1800px]:grid-cols-2">
                  <ActionButton
                    disabled={isTop}
                    label="上移"
                    onClick={() => onMoveLayer(layer.id, 'up')}
                  />
                  <ActionButton
                    disabled={isBottom}
                    label="下移"
                    onClick={() => onMoveLayer(layer.id, 'down')}
                  />
                  <ActionButton
                    label="複製"
                    onClick={() => onDuplicateLayer(layer.id)}
                  />
                  <ActionButton
                    label="刪除"
                    tone="danger"
                    onClick={() => onDeleteLayer(layer.id)}
                  />
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

interface ActionButtonProps {
  label: string
  disabled?: boolean
  tone?: 'default' | 'danger'
  onClick: () => void
}

function ActionButton({
  label,
  disabled = false,
  tone = 'default',
  onClick,
}: ActionButtonProps) {
  const toneClass =
    tone === 'danger'
      ? 'border-rose-800 text-rose-200 hover:bg-rose-950/30'
      : 'border-slate-700 text-slate-300 hover:bg-slate-800'

  return (
    <button
      className={`rounded-md border px-2 py-2 transition disabled:cursor-not-allowed disabled:opacity-35 ${toneClass}`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}
