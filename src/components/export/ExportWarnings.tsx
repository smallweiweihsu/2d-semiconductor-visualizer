import { CollapsibleSection } from '../common/CollapsibleSection'

export function ExportWarnings() {
  const warnings = [
    '尚未補齊文獻參數的模型結果只能作為研究紀錄與趨勢參考。',
    '擴散 / 氧化 / 電性結果皆為簡化模型或定性 / 半定量輔助判讀。',
    '目前跨模組即時狀態尚未全部提升到全域匯出；報告會標示缺失。',
    'JSON 可用於此 app 載入，不保證與其他軟體格式相容。',
    'Markdown 報告是研究紀錄草稿，不是論文結果或實驗證明。',
  ]

  return (
    <CollapsibleSection
      defaultOpen={false}
      summary={`${warnings.length} 項匯出提醒`}
      title="匯出提醒"
    >
      <ul className="space-y-2 text-sm leading-6 text-amber-100/80">
        {warnings.map((warning) => (
          <li className="flex gap-2" key={warning}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
            <span>{warning}</span>
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  )
}
