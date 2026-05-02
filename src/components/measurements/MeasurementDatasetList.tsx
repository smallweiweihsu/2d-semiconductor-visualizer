import type { MeasurementDataset } from '../../types/measurement'
import {
  formatDatasetSummary,
  getBeforeAfterTagLabel,
  getMeasurementTypeLabel,
} from './measurementFormatting'

interface MeasurementDatasetListProps {
  datasets: MeasurementDataset[]
  selectedDatasetId?: string
  onSelectDataset: (datasetId: string) => void
  onDeleteDataset: (datasetId: string) => void
  onDuplicateDataset: (datasetId: string) => void
}

export function MeasurementDatasetList({
  datasets,
  onDeleteDataset,
  onDuplicateDataset,
  onSelectDataset,
  selectedDatasetId,
}: MeasurementDatasetListProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">資料集清單</h3>
        <p className="mt-1 text-sm text-slate-400">
          資料目前只存在瀏覽器狀態；可透過 JSON 匯出保存。
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {datasets.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-700 p-4 text-sm text-slate-500">
            尚未儲存任何量測資料集。
          </div>
        ) : null}

        {datasets.map((dataset) => (
          <article
            className={`rounded-lg border p-3 transition ${
              selectedDatasetId === dataset.id
                ? 'border-cyan-500/70 bg-cyan-950/20'
                : 'border-slate-800 bg-slate-950/50'
            }`}
            key={dataset.id}
          >
            <button
              className="w-full text-left"
              type="button"
              onClick={() => onSelectDataset(dataset.id)}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-100">
                  {dataset.name_zh}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  {getMeasurementTypeLabel(dataset.measurementType)}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  {getBeforeAfterTagLabel(dataset.metadata.beforeAfterTag)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-400">
                {formatDatasetSummary(dataset)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                檔案：{dataset.fileName || '手動貼上'} / 匯入：
                {new Date(dataset.importedAt).toLocaleString('zh-TW')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                關聯材料層 {dataset.linkedLayerIds.length} 個，關聯製程步驟{' '}
                {dataset.linkedProcessStepIds.length} 個，提醒{' '}
                {dataset.warnings_zh.length} 則
              </p>
            </button>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                className="secondary-button"
                type="button"
                onClick={() => onDuplicateDataset(dataset.id)}
              >
                複製
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => onDeleteDataset(dataset.id)}
              >
                刪除
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

