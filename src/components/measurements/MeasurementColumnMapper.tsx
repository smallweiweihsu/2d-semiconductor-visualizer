import type {
  MeasurementAxisType,
  MeasurementDataset,
} from '../../types/measurement'
import { formatAxisType, formatNumber } from './measurementFormatting'

interface MeasurementColumnMapperProps {
  dataset?: MeasurementDataset
  onChangeDataset: (dataset: MeasurementDataset) => void
  onSaveDataset: (dataset: MeasurementDataset) => void
}

const axisTypes: MeasurementAxisType[] = [
  'raman_shift_cm-1',
  'wavelength_nm',
  'energy_eV',
  'intensity_a.u.',
  'voltage_V',
  'current_A',
  'temperature_K',
  'time_s',
  'custom',
]

export function MeasurementColumnMapper({
  dataset,
  onChangeDataset,
  onSaveDataset,
}: MeasurementColumnMapperProps) {
  if (!dataset) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
        匯入資料後，欄位對應會顯示在這裡。
      </section>
    )
  }

  function updateColumnType(columnId: string, mappedType: MeasurementAxisType) {
    if (!dataset) {
      return
    }

    onChangeDataset({
      ...dataset,
      columns: dataset.columns.map((column) =>
        column.id === columnId
          ? {
              ...column,
              mappedType,
              unit: inferUnit(mappedType),
            }
          : column,
      ),
    })
  }

  const numericColumns = dataset.columns.filter((column) =>
    dataset.rows.some((row) => typeof row.values[column.id] === 'number'),
  )

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">欄位對應</h3>
          <p className="mt-1 text-sm text-slate-400">
            請確認每個欄位的物理意義，尤其是強度、電流與電壓單位。
          </p>
        </div>
        <button
          className="action-button"
          disabled={numericColumns.length < 2}
          type="button"
          onClick={() => onSaveDataset(dataset)}
        >
          儲存資料集
        </button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">原始欄位</th>
              <th className="px-3 py-2">欄位類型</th>
              <th className="px-3 py-2">單位</th>
              <th className="px-3 py-2">樣本值</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {dataset.columns.map((column) => (
              <tr key={column.id}>
                <td className="px-3 py-2 text-slate-200">
                  {column.originalName}
                </td>
                <td className="px-3 py-2">
                  <select
                    className="field-input"
                    value={column.mappedType}
                    onChange={(event) =>
                      updateColumnType(
                        column.id,
                        event.target.value as MeasurementAxisType,
                      )
                    }
                  >
                    {axisTypes.map((axisType) => (
                      <option key={axisType} value={axisType}>
                        {formatAxisType(axisType)}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {column.unit || '未指定'}
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {dataset.rows
                    .slice(0, 3)
                    .map((row) => formatNumber(row.values[column.id]))
                    .join('、')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function inferUnit(axisType: MeasurementAxisType) {
  const units: Partial<Record<MeasurementAxisType, string>> = {
    'raman_shift_cm-1': 'cm⁻¹',
    wavelength_nm: 'nm',
    energy_eV: 'eV',
    'intensity_a.u.': 'a.u.',
    voltage_V: 'V',
    current_A: 'A',
    temperature_K: 'K',
    time_s: 's',
  }

  return units[axisType]
}

