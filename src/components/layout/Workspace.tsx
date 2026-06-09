import type { Dispatch, SetStateAction } from 'react'
import type { WorkspaceTab } from '../../data/workspaceTabs'
import type { DeviceStructure } from '../../types/device'
import type {
  MeasurementComparison,
  MeasurementDataset,
  PeakMarker,
  ProcessedMeasurementDataset,
} from '../../types/measurement'
import type { ProcessFlow } from '../../types/process'
import { DeviceStructureEditor } from '../device/DeviceStructureEditor'
import { ElectricalWorkspace } from '../electrical/ElectricalWorkspace'
import { ProjectExportWorkspace } from '../export/ProjectExportWorkspace'
import { LiteratureDatabaseWorkspace } from '../literature/LiteratureDatabaseWorkspace'
import { MaterialDatabase } from '../materials/MaterialDatabase'
import { MeasurementWorkspace } from '../measurements/MeasurementWorkspace'
import { ProcessDiffusionWorkspace } from '../process/ProcessDiffusionWorkspace'
import { ViewerPlaceholder } from '../viewer3d/ViewerPlaceholder'

interface WorkspaceProps {
  deviceStructure: DeviceStructure
  measurementComparisons: MeasurementComparison[]
  measurementDatasets: MeasurementDataset[]
  peakMarkers: PeakMarker[]
  processedMeasurementDatasets: ProcessedMeasurementDataset[]
  onChangeDeviceStructure: Dispatch<SetStateAction<DeviceStructure>>
  onChangeMeasurementComparisons: Dispatch<
    SetStateAction<MeasurementComparison[]>
  >
  onChangeMeasurementDatasets: Dispatch<SetStateAction<MeasurementDataset[]>>
  onChangePeakMarkers: Dispatch<SetStateAction<PeakMarker[]>>
  onChangeProcessFlow: Dispatch<SetStateAction<ProcessFlow>>
  onChangeProcessedMeasurementDatasets: Dispatch<
    SetStateAction<ProcessedMeasurementDataset[]>
  >
  processFlow: ProcessFlow
  tab: WorkspaceTab
}

export function Workspace({
  deviceStructure,
  measurementComparisons,
  measurementDatasets,
  peakMarkers,
  processedMeasurementDatasets,
  onChangeDeviceStructure,
  onChangeMeasurementComparisons,
  onChangeMeasurementDatasets,
  onChangePeakMarkers,
  onChangeProcessFlow,
  onChangeProcessedMeasurementDatasets,
  processFlow,
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

  if (tab.id === 'electrical') {
    return (
      <ElectricalWorkspace
        deviceLayers={deviceStructure.layers}
        flow={processFlow}
      />
    )
  }

  if (tab.id === 'diffusion') {
    return (
      <ProcessDiffusionWorkspace
        deviceLayers={deviceStructure.layers}
        flow={processFlow}
        onChangeFlow={onChangeProcessFlow}
      />
    )
  }

  if (tab.id === 'measurements') {
    return (
      <MeasurementWorkspace
        deviceLayers={deviceStructure.layers}
        flow={processFlow}
        measurementComparisons={measurementComparisons}
        measurementDatasets={measurementDatasets}
        peakMarkers={peakMarkers}
        processedMeasurementDatasets={processedMeasurementDatasets}
        onChangeMeasurementComparisons={onChangeMeasurementComparisons}
        onChangeMeasurementDatasets={onChangeMeasurementDatasets}
        onChangePeakMarkers={onChangePeakMarkers}
        onChangeProcessedMeasurementDatasets={
          onChangeProcessedMeasurementDatasets
        }
      />
    )
  }

  if (tab.id === 'literature') {
    return <LiteratureDatabaseWorkspace />
  }

  if (tab.id === 'results') {
    return (
      <ProjectExportWorkspace
        deviceStructure={deviceStructure}
        measurementComparisons={measurementComparisons}
        measurementDatasets={measurementDatasets}
        peakMarkers={peakMarkers}
        processedMeasurementDatasets={processedMeasurementDatasets}
        onChangeDeviceStructure={onChangeDeviceStructure}
        onChangeMeasurementComparisons={onChangeMeasurementComparisons}
        onChangeMeasurementDatasets={onChangeMeasurementDatasets}
        onChangePeakMarkers={onChangePeakMarkers}
        onChangeProcessFlow={onChangeProcessFlow}
        onChangeProcessedMeasurementDatasets={
          onChangeProcessedMeasurementDatasets
        }
        processFlow={processFlow}
      />
    )
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
