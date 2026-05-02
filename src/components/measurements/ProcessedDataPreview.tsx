import type { ProcessedMeasurementDataset } from '../../types/measurement'
import { formatNumber } from './measurementFormatting'

interface ProcessedDataPreviewProps {
  processedDataset?: ProcessedMeasurementDataset
}

export function ProcessedDataPreview({
  processedDataset,
}: ProcessedDataPreviewProps) {
  if (!processedDataset) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
        產生處理後資料後，預覽會顯示在這裡。
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">處理後資料預覽</h3>
        <p className="mt-1 text-sm text-slate-400">
          顯示前 20 筆處理後資料；完整原始與處理後資料會包含於 JSON 匯出中。
        </p>
      </div>

      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-950 text-slate-500">
            <tr>
              <th className="px-3 py-2">#</th>
              {processedDataset.columns.map((column) => (
                <th className="px-3 py-2" key={column.id}>
                  {column.originalName}
                  {column.unit ? (
                    <span className="block font-normal text-slate-600">
                      {column.unit}
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {processedDataset.rows.slice(0, 20).map((row, rowIndex) => (
              <tr key={`${processedDataset.id}-${rowIndex}`}>
                <td className="px-3 py-2 text-slate-500">{rowIndex + 1}</td>
                {processedDataset.columns.map((column) => (
                  <td className="px-3 py-2 text-slate-300" key={column.id}>
                    {formatNumber(row.values[column.id])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

