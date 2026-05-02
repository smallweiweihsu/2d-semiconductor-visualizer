import type { MeasurementDataset } from '../../types/measurement'
import { formatNumber } from './measurementFormatting'

interface MeasurementDataPreviewProps {
  dataset?: MeasurementDataset
}

export function MeasurementDataPreview({ dataset }: MeasurementDataPreviewProps) {
  if (!dataset) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
        選擇資料集後，前 20 筆資料會顯示在這裡。
      </section>
    )
  }

  const nonNumericCount = dataset.rows.reduce(
    (count, row) =>
      count +
      dataset.columns.filter((column) => {
        const value = row.values[column.id]
        return value !== null && typeof value !== 'number'
      }).length,
    0,
  )

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">資料預覽</h3>
          <p className="mt-1 text-sm text-slate-400">
            顯示前 20 筆資料；大型資料集仍只在瀏覽器狀態中保存。
          </p>
        </div>
        {nonNumericCount > 0 ? (
          <span className="rounded-full border border-amber-700/50 bg-amber-950/30 px-3 py-1 text-xs text-amber-100">
            含非數值欄位 {nonNumericCount} 筆
          </span>
        ) : null}
      </div>

      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead className="sticky top-0 bg-slate-950 text-slate-500">
            <tr>
              <th className="px-3 py-2">#</th>
              {dataset.columns.map((column) => (
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
            {dataset.rows.slice(0, 20).map((row, rowIndex) => (
              <tr key={`${dataset.id}-${rowIndex}`}>
                <td className="px-3 py-2 text-slate-500">{rowIndex + 1}</td>
                {dataset.columns.map((column) => (
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

