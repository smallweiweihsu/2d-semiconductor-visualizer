import type { Dispatch, SetStateAction } from 'react'
import { useMemo, useState } from 'react'
import type { DeviceLayer } from '../../types/device'
import type {
  MeasurementComparison,
  MeasurementDataset,
} from '../../types/measurement'
import type { ProcessFlow } from '../../types/process'
import { MeasurementColumnMapper } from './MeasurementColumnMapper'
import { MeasurementComparisonPanel } from './MeasurementComparisonPanel'
import { MeasurementDataPreview } from './MeasurementDataPreview'
import { MeasurementDatasetList } from './MeasurementDatasetList'
import { MeasurementImportPanel } from './MeasurementImportPanel'
import { MeasurementMetadataEditor } from './MeasurementMetadataEditor'
import { MeasurementPlot } from './MeasurementPlot'
import { MeasurementWarnings } from './MeasurementWarnings'

interface MeasurementWorkspaceProps {
  deviceLayers: DeviceLayer[]
  flow: ProcessFlow
  measurementComparisons: MeasurementComparison[]
  measurementDatasets: MeasurementDataset[]
  onChangeMeasurementComparisons: Dispatch<
    SetStateAction<MeasurementComparison[]>
  >
  onChangeMeasurementDatasets: Dispatch<SetStateAction<MeasurementDataset[]>>
}

export function MeasurementWorkspace({
  deviceLayers,
  flow,
  measurementComparisons,
  measurementDatasets,
  onChangeMeasurementComparisons,
  onChangeMeasurementDatasets,
}: MeasurementWorkspaceProps) {
  const [draftDataset, setDraftDataset] = useState<MeasurementDataset>()
  const [messages, setMessages] = useState<string[]>([])
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>()
  const selectedDataset = useMemo(
    () =>
      measurementDatasets.find((dataset) => dataset.id === selectedDatasetId) ??
      measurementDatasets[0],
    [measurementDatasets, selectedDatasetId],
  )

  function saveDraftDataset(dataset: MeasurementDataset) {
    onChangeMeasurementDatasets((current) => {
      const existingIndex = current.findIndex((item) => item.id === dataset.id)
      if (existingIndex >= 0) {
        return current.map((item) => (item.id === dataset.id ? dataset : item))
      }

      return [...current, dataset]
    })
    setSelectedDatasetId(dataset.id)
    setDraftDataset(undefined)
    setMessages(['資料集已儲存，可開始編輯 metadata、繪圖與比較。'])
  }

  function updateSelectedDataset(dataset: MeasurementDataset) {
    onChangeMeasurementDatasets((current) =>
      current.map((item) => (item.id === dataset.id ? dataset : item)),
    )
  }

  function deleteDataset(datasetId: string) {
    onChangeMeasurementDatasets((current) =>
      current.filter((dataset) => dataset.id !== datasetId),
    )
    onChangeMeasurementComparisons((current) =>
      current.filter((comparison) => !comparison.datasetIds.includes(datasetId)),
    )
    if (selectedDatasetId === datasetId) {
      setSelectedDatasetId(undefined)
    }
  }

  function duplicateDataset(datasetId: string) {
    const dataset = measurementDatasets.find((item) => item.id === datasetId)

    if (!dataset) {
      return
    }

    const duplicate = {
      ...structuredClone(dataset),
      id: `measurement-${crypto.randomUUID()}`,
      name_zh: `${dataset.name_zh} 複本`,
      importedAt: new Date().toISOString(),
    }

    onChangeMeasurementDatasets((current) => [...current, duplicate])
    setSelectedDatasetId(duplicate.id)
  }

  return (
    <section className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">
            量測資料匯入與比較
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            匯入 Raman、PL 與電性資料，進行初步視覺化、before/after 比較，並與元件材料層與製程步驟建立關聯。
          </p>
        </div>
        <div className="rounded-md border border-cyan-800/60 bg-cyan-950/25 px-3 py-2 text-xs text-cyan-100">
          本機解析 / 不上傳檔案
        </div>
      </header>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/85">
        量測資料匯入功能僅用於整理、視覺化與初步比較實驗資料。峰值、電性趨勢與訊號變化仍需搭配儀器設定、樣品狀態、校正資料與實驗條件判讀。
        自動偵測欄位、峰值或趨勢只能作為輔助，不應直接視為定量結論。
      </aside>

      {messages.length > 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3 text-sm text-slate-300">
          {messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <MeasurementImportPanel
            onDraftDataset={setDraftDataset}
            onMessages={setMessages}
          />
          <MeasurementColumnMapper
            dataset={draftDataset}
            onChangeDataset={setDraftDataset}
            onSaveDataset={saveDraftDataset}
          />
          <MeasurementDatasetList
            datasets={measurementDatasets}
            selectedDatasetId={selectedDataset?.id}
            onDeleteDataset={deleteDataset}
            onDuplicateDataset={duplicateDataset}
            onSelectDataset={setSelectedDatasetId}
          />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <MeasurementMetadataEditor
            dataset={selectedDataset}
            deviceLayers={deviceLayers}
            processSteps={flow.steps}
            onChangeDataset={updateSelectedDataset}
          />
          <MeasurementPlot
            datasets={measurementDatasets}
            selectedDataset={selectedDataset}
          />
          <MeasurementDataPreview dataset={selectedDataset} />
          <MeasurementComparisonPanel
            comparisons={measurementComparisons}
            datasets={measurementDatasets}
            onChangeComparisons={onChangeMeasurementComparisons}
          />
          <MeasurementWarnings dataset={selectedDataset} />
        </div>
      </div>
    </section>
  )
}

