import type { Dispatch, SetStateAction } from 'react'
import type { WorkspaceTab } from '../../data/workspaceTabs'
import type { DeviceStructure } from '../../types/device'
import { DeviceStructureEditor } from '../device/DeviceStructureEditor'
import { MaterialDatabase } from '../materials/MaterialDatabase'
import { ProcessFlowEditor } from '../process/ProcessFlowEditor'
import { ViewerPlaceholder } from '../viewer3d/ViewerPlaceholder'

interface WorkspaceProps {
  deviceStructure: DeviceStructure
  onChangeDeviceStructure: Dispatch<SetStateAction<DeviceStructure>>
  tab: WorkspaceTab
}

export function Workspace({
  deviceStructure,
  onChangeDeviceStructure,
  tab,
}: WorkspaceProps) {
  if (tab.id === 'structure') {
    return (
      <DeviceStructureEditor
        structure={deviceStructure}
        onChangeStructure={onChangeDeviceStructure}
      />
    )
  }

  if (tab.id === 'materials') {
    return <MaterialDatabase />
  }

  if (tab.id === 'diffusion') {
    return <ProcessFlowEditor deviceLayers={deviceStructure.layers} />
  }

  return (
    <section className="flex min-h-[36rem] flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">{tab.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
            {tab.description}
          </p>
        </div>

        <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          目前顯示：{tab.label}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <ViewerPlaceholder />

        <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
          <h3 className="text-sm font-medium text-slate-200">預留功能</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {tab.features.map((feature) => (
              <li className="flex gap-2" key={feature}>
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/85">
        本工具目前是「物理導向的視覺化與近似分析工具」，不是完整 TCAD、DFT
        或分子動力學模擬器。所有計算結果都需要搭配實驗資料與文獻參數判讀。
      </aside>
    </section>
  )
}
