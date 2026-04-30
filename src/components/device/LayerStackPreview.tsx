import { deviceRoleLabels } from '../../data/deviceRoles'
import type { DeviceLayer } from '../../types/device'
import {
  formatThickness,
  formatVoltage,
  getMaterialById,
  getMaterialDisplayName,
} from './deviceFormatting'

interface LayerStackPreviewProps {
  layers: DeviceLayer[]
  selectedLayerId: string | null
  onSelectLayer: (layerId: string) => void
}

export function LayerStackPreview({
  layers,
  selectedLayerId,
  onSelectLayer,
}: LayerStackPreviewProps) {
  const visibleLayers = layers.filter((layer) => layer.visible)
  const maxLength = Math.max(
    1,
    ...visibleLayers.map((layer) => layer.geometry.length_um),
  )

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-slate-200">2D 側視堆疊預覽</h3>
          <p className="mt-1 text-xs text-slate-500">
            厚度顯示經過視覺縮放，並非真實比例。
          </p>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-400">
          下方 → 上方
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.75),rgba(2,6,23,0.95))] p-4">
        {visibleLayers.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-md border border-dashed border-slate-700 text-sm text-slate-500">
            目前沒有可見材料層。
          </div>
        ) : (
          <div className="flex min-h-72 flex-col justify-end gap-1">
            {[...visibleLayers].reverse().map((layer) => {
              const material = getMaterialById(layer.materialId)
              const voltage = formatVoltage(layer)
              const scaledHeight = getScaledHeight(layer.geometry.thickness_nm)
              const widthPercent = Math.max(
                45,
                Math.min(100, (layer.geometry.length_um / maxLength) * 100),
              )
              const isSelected = layer.id === selectedLayerId

              return (
                <button
                  className={`relative mx-auto min-w-[11rem] overflow-hidden rounded-md border px-3 text-left text-xs transition ${
                    isSelected
                      ? 'border-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.25)]'
                      : 'border-white/10 hover:border-cyan-700'
                  }`}
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  style={{
                    minHeight: scaledHeight,
                    width: `${widthPercent}%`,
                    backgroundColor: material?.color ?? '#64748b',
                    opacity: layer.opacity,
                  }}
                  type="button"
                >
                  <div className="grid gap-1 py-2 pr-14 text-slate-950">
                    <span className="font-semibold leading-4">{layer.name}</span>
                    <span className="text-[11px] leading-4">
                      {getMaterialDisplayName(layer.materialId)} ·{' '}
                      {deviceRoleLabels[layer.role]} ·{' '}
                      {formatThickness(layer.geometry.thickness_nm)}
                    </span>
                  </div>
                  {voltage ? (
                    <span className="absolute right-2 top-2 rounded bg-slate-950/75 px-2 py-1 text-[11px] text-cyan-100">
                      {voltage}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
        {visibleLayers.map((layer) => {
          const material = getMaterialById(layer.materialId)

          return (
            <div className="flex items-center gap-2" key={layer.id}>
              <span
                className="h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: material?.color ?? '#64748b' }}
              />
              <span>{layer.name}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function getScaledHeight(thickness_nm: number) {
  if (!Number.isFinite(thickness_nm) || thickness_nm <= 0) {
    return 12
  }

  return Math.max(12, Math.min(72, 10 + Math.log10(thickness_nm + 1) * 11))
}
