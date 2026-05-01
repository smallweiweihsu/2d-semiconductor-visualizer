import type { DeviceLayer } from '../../types/device'
import type { ProcessFlow } from '../../types/process'
import { ElectricalModelPanel } from './ElectricalModelPanel'

interface ElectricalWorkspaceProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
}

export function ElectricalWorkspace({
  deviceLayers,
  flow,
}: ElectricalWorkspaceProps) {
  return (
    <section className="flex min-h-[calc(100vh-13rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">
            電性分析與 I-V 近似
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            使用簡化電容、載子密度、通道電阻與手動接觸電阻，產生 I-V / Id-Vg 趨勢圖，並提示接觸、閘極控制與介電層風險。
          </p>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          已讀取 {deviceLayers.length} 個元件材料層與 {flow.steps.length} 個製程步驟
        </div>
      </header>

      <ElectricalModelPanel deviceLayers={deviceLayers} flow={flow} />
    </section>
  )
}
