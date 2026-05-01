import type { DeviceLayer } from '../../types/device'
import type { ProcessFlow } from '../../types/process'
import { OxidationModelPanel } from './OxidationModelPanel'

interface OxidationWorkspaceProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
}

export function OxidationWorkspace({
  deviceLayers,
  flow,
}: OxidationWorkspaceProps) {
  return (
    <section className="flex min-h-[calc(100vh-13rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">
            氧化模擬與 Raman 解釋
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            整理 WSe₂ → WOx、Sb → Sb₂O₃ 等氧化條件，並用簡化模型輔助判斷殘留材料、氧化不均勻與 Raman 可見性的可能原因。
          </p>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          已讀取 {deviceLayers.length} 個元件材料層與 {flow.steps.length} 個製程步驟
        </div>
      </header>

      <OxidationModelPanel deviceLayers={deviceLayers} flow={flow} />
    </section>
  )
}
