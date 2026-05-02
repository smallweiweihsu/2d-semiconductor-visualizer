import type { MeasurementDataset } from '../../types/measurement'

interface MeasurementWarningsProps {
  dataset?: MeasurementDataset
}

const globalWarnings = [
  '資料欄位單位不明時，請先確認儀器匯出格式。',
  'Raman / PL intensity 未校正，不能直接比較不同儀器條件。',
  'Raman 高功率可能造成局部加熱或損傷。',
  '電流正負號可能需要根據量測接線確認。',
  '若要畫 log(I)，請確認使用 abs(I) 或只使用正電流區間。',
  'before/after 比較需確保雷射功率、積分時間、光路與位置一致。',
  '電性資料若出現 compliance 限制，曲線不可直接視為真實導通。',
  '匯入資料目前不會自動進行 baseline correction、smoothing 或 fitting。',
]

export function MeasurementWarnings({ dataset }: MeasurementWarningsProps) {
  const warnings = [...globalWarnings, ...(dataset?.warnings_zh ?? [])]

  return (
    <section className="rounded-lg border border-amber-900/50 bg-amber-950/20 p-4">
      <h3 className="text-base font-semibold text-amber-100">量測資料提醒</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-100/80">
        {[...new Set(warnings)].map((warning) => (
          <li className="flex gap-2" key={warning}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

