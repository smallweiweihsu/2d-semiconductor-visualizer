import type { CameraViewPreset } from './viewerTypes'

interface ViewerControlsProps {
  currentView: CameraViewPreset
  exploded: boolean
  showLabels: boolean
  onSetView: (view: CameraViewPreset) => void
  onResetView: () => void
  onToggleExploded: () => void
  onToggleLabels: () => void
}

const viewButtons: Array<{ id: CameraViewPreset; label: string }> = [
  { id: 'three_d', label: '3D 視角' },
  { id: 'top', label: '俯視圖' },
  { id: 'side', label: '側視圖' },
  { id: 'front', label: '前視圖' },
]

export function ViewerControls({
  currentView,
  exploded,
  showLabels,
  onSetView,
  onResetView,
  onToggleExploded,
  onToggleLabels,
}: ViewerControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {viewButtons.map((button) => (
        <button
          className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
            currentView === button.id
              ? 'border-cyan-600 bg-cyan-950/50 text-cyan-100'
              : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600'
          }`}
          key={button.id}
          onClick={() => onSetView(button.id)}
          type="button"
        >
          {button.label}
        </button>
      ))}

      <button
        className="rounded-md border border-slate-700 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-slate-600"
        onClick={onResetView}
        type="button"
      >
        重設視角
      </button>

      <button
        className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
          exploded
            ? 'border-amber-600 bg-amber-950/40 text-amber-100'
            : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600'
        }`}
        onClick={onToggleExploded}
        type="button"
      >
        爆炸圖模式
      </button>

      <button
        className={`rounded-md border px-2.5 py-1.5 text-xs transition ${
          showLabels
            ? 'border-emerald-700 bg-emerald-950/35 text-emerald-100'
            : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-600'
        }`}
        onClick={onToggleLabels}
        type="button"
      >
        顯示標籤
      </button>
    </div>
  )
}
