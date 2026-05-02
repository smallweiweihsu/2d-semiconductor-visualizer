import { useMemo, useState } from 'react'
import type {
  MeasurementComparison,
  MeasurementDataset,
} from '../../types/measurement'
import {
  getBeforeAfterTagLabel,
  getMeasurementTypeLabel,
} from './measurementFormatting'

interface MeasurementComparisonPanelProps {
  comparisons: MeasurementComparison[]
  datasets: MeasurementDataset[]
  onChangeComparisons: (comparisons: MeasurementComparison[]) => void
}

export function MeasurementComparisonPanel({
  comparisons,
  datasets,
  onChangeComparisons,
}: MeasurementComparisonPanelProps) {
  const [name, setName] = useState('before / after 比較')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const selectedDatasets = datasets.filter((dataset) =>
    selectedIds.includes(dataset.id),
  )
  const selectedType = selectedDatasets[0]?.measurementType
  const typeMismatch = selectedDatasets.some(
    (dataset) => dataset.measurementType !== selectedType,
  )
  const helperNotes = useMemo(() => {
    if (selectedType === 'raman') {
      return [
        'Raman peak shift 可能與 strain、doping、氧化、加熱或層數變化有關。',
        'Intensity 變化需要確認雷射功率、積分時間、光路與量測位置一致。',
      ]
    }

    if (selectedType === 'pl') {
      return [
        'PL intensity 可受缺陷密度、doping、氧化、厚度、溫度與光學設定影響。',
        'PL 消失或變弱不應單獨視為唯一材料品質證據。',
      ]
    }

    if (selectedType === 'electrical_iv' || selectedType === 'electrical_transfer') {
      return [
        'I-V hysteresis、非線性、接觸電阻、漏電與 compliance 設定都需要檢查。',
        '曲線形狀本身不能單獨證明單一導電機制。',
      ]
    }

    return ['自訂量測比較目前只提供視覺化與 metadata 整理。']
  }, [selectedType])

  function toggleDataset(datasetId: string) {
    setSelectedIds((current) =>
      current.includes(datasetId)
        ? current.filter((id) => id !== datasetId)
        : [...current, datasetId],
    )
  }

  function saveComparison() {
    if (selectedIds.length < 2 || !selectedType || typeMismatch) {
      return
    }

    onChangeComparisons([
      ...comparisons,
      {
        id: `comparison-${crypto.randomUUID()}`,
        name_zh: name || '量測比較',
        measurementType: selectedType,
        datasetIds: selectedIds,
        linkedLayerIds: [
          ...new Set(selectedDatasets.flatMap((dataset) => dataset.linkedLayerIds)),
        ],
        linkedProcessStepIds: [
          ...new Set(
            selectedDatasets.flatMap((dataset) => dataset.linkedProcessStepIds),
          ),
        ],
      },
    ])
    setSelectedIds([])
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">量測比較</h3>
        <p className="mt-1 text-sm text-slate-400">
          選擇同類型資料集進行 before / after / reference 疊圖比較。
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-200/80">
          比較不同處理流程時，需確認處理方式一致，否則強度與趨勢可能不可直接比較。
        </p>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-300">
        比較名稱
        <input
          className="field-input mt-2"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {datasets.map((dataset) => (
          <label
            className="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2 text-sm text-slate-300"
            key={dataset.id}
          >
            <input
              checked={selectedIds.includes(dataset.id)}
              className="mt-1"
              type="checkbox"
              onChange={() => toggleDataset(dataset.id)}
            />
            <span>
              <span className="font-medium text-slate-100">{dataset.name_zh}</span>
              <span className="block text-xs text-slate-500">
                {getMeasurementTypeLabel(dataset.measurementType)} /{' '}
                {getBeforeAfterTagLabel(dataset.metadata.beforeAfterTag)}
              </span>
            </span>
          </label>
        ))}
      </div>

      {typeMismatch ? (
        <p className="mt-3 text-sm text-rose-300">
          請選擇相同量測類型的資料集進行比較。
        </p>
      ) : null}

      <button
        className="mt-4 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        disabled={selectedIds.length < 2 || typeMismatch}
        type="button"
        onClick={saveComparison}
      >
        儲存比較
      </button>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950/60 p-3">
        <h4 className="text-sm font-semibold text-slate-200">比較判讀提醒</h4>
        <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-400">
          {helperNotes.map((note) => (
            <li key={note}>- {note}</li>
          ))}
        </ul>
      </div>

      {comparisons.length > 0 ? (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">已儲存比較</h4>
          {comparisons.map((comparison) => (
            <div
              className="rounded-md border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-300"
              key={comparison.id}
            >
              <div className="font-medium text-slate-100">{comparison.name_zh}</div>
              <div className="mt-1 text-xs text-slate-500">
                {getMeasurementTypeLabel(comparison.measurementType)} /{' '}
                {comparison.datasetIds.length} 個資料集
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
