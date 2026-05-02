import type { PeakMarker } from '../../types/measurement'
import { formatNumber } from './measurementFormatting'

interface PeakMarkerListProps {
  markers: PeakMarker[]
  onChangeMarkers: (markers: PeakMarker[]) => void
}

export function PeakMarkerList({
  markers,
  onChangeMarkers,
}: PeakMarkerListProps) {
  if (markers.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 p-3 text-sm text-slate-500">
        尚未建立 peak 標記。
      </div>
    )
  }

  function updateMarker(markerId: string, changes: Partial<PeakMarker>) {
    onChangeMarkers(
      markers.map((marker) =>
        marker.id === markerId ? { ...marker, ...changes } : marker,
      ),
    )
  }

  return (
    <div className="space-y-2">
      {markers.map((marker) => (
        <article
          className="rounded-md border border-slate-800 bg-slate-950/60 p-3"
          key={marker.id}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold text-slate-100">
              {formatNumber(marker.xValue)} / {marker.label_zh}
            </div>
            <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
              {marker.peakType === 'manual' ? '手動' : '建議'}
            </span>
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input
              className="field-input"
              value={marker.label_zh}
              onChange={(event) =>
                updateMarker(marker.id, { label_zh: event.target.value })
              }
            />
            <input
              className="field-input"
              placeholder="assignment，例如 E mode"
              value={marker.assignment_zh ?? ''}
              onChange={(event) =>
                updateMarker(marker.id, { assignment_zh: event.target.value })
              }
            />
          </div>
          <button
            className="secondary-button mt-2"
            type="button"
            onClick={() =>
              onChangeMarkers(markers.filter((item) => item.id !== marker.id))
            }
          >
            刪除標記
          </button>
        </article>
      ))}
    </div>
  )
}

