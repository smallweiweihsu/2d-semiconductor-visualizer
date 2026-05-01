import { useState } from 'react'
import { defaultProcessFlow } from '../../data/defaultProcessFlow'
import type { DeviceLayer } from '../../types/device'
import type { ProcessFlow } from '../../types/process'
import { DiffusionModelPanel } from '../diffusion/DiffusionModelPanel'
import { ProcessFlowEditor } from './ProcessFlowEditor'

interface ProcessDiffusionWorkspaceProps {
  deviceLayers: DeviceLayer[]
}

export function ProcessDiffusionWorkspace({
  deviceLayers,
}: ProcessDiffusionWorkspaceProps) {
  const [flow, setFlow] = useState<ProcessFlow>(() =>
    structuredClone(defaultProcessFlow),
  )
  const [activeView, setActiveView] = useState<'timeline' | 'diffusion'>(
    'timeline',
  )

  return (
    <section className="flex min-h-[calc(100vh-13rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">
            製程流程與退火擴散
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            建立製程時間線，並用 Arrhenius / Fick-like 近似估算金屬或氧在目標材料層中的擴散趨勢。
          </p>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          已讀取 {deviceLayers.length} 個元件材料層作為候選目標層
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <WorkspaceModeButton
          active={activeView === 'timeline'}
          label="製程時間線"
          onClick={() => setActiveView('timeline')}
        />
        <WorkspaceModeButton
          active={activeView === 'diffusion'}
          label="擴散估算"
          onClick={() => setActiveView('diffusion')}
        />
      </div>

      {activeView === 'timeline' ? (
        <ProcessFlowEditor
          deviceLayers={deviceLayers}
          flow={flow}
          onChangeFlow={setFlow}
        />
      ) : (
        <DiffusionModelPanel deviceLayers={deviceLayers} flow={flow} />
      )}
    </section>
  )
}

function WorkspaceModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
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
