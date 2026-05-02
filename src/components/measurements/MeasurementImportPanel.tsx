import { useState } from 'react'
import type { MeasurementDataset, MeasurementType } from '../../types/measurement'
import {
  createMeasurementDatasetFromText,
  type DelimiterMode,
} from '../../utils/measurementImport'
import { getMeasurementTypeLabel } from './measurementFormatting'

interface MeasurementImportPanelProps {
  onDraftDataset: (dataset: MeasurementDataset) => void
  onMessages: (messages: string[]) => void
}

const measurementTypes: MeasurementType[] = [
  'raman',
  'pl',
  'electrical_iv',
  'electrical_transfer',
  'custom',
]

const delimiterOptions: Array<{ id: DelimiterMode; label: string }> = [
  { id: 'auto', label: '自動偵測' },
  { id: 'comma', label: '逗號' },
  { id: 'tab', label: 'Tab' },
  { id: 'space', label: '空白' },
  { id: 'semicolon', label: '分號' },
]

export function MeasurementImportPanel({
  onDraftDataset,
  onMessages,
}: MeasurementImportPanelProps) {
  const [measurementType, setMeasurementType] =
    useState<MeasurementType>('raman')
  const [delimiterMode, setDelimiterMode] = useState<DelimiterMode>('auto')
  const [datasetName, setDatasetName] = useState('')
  const [fileName, setFileName] = useState<string | undefined>()
  const [rawText, setRawText] = useState(
    'Raman shift,Intensity\n100,10\n150,18\n200,30\n250,22\n300,15',
  )

  function readFile(file?: File) {
    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setRawText(String(reader.result ?? ''))
      setFileName(file.name)
      setDatasetName(file.name.replace(/\.[^.]+$/, ''))
      onMessages([`已讀取檔案：${file.name}`])
    }
    reader.onerror = () => onMessages(['檔案讀取失敗。'])
    reader.readAsText(file)
  }

  function importDataset() {
    const result = createMeasurementDatasetFromText({
      text: rawText,
      measurementType,
      format: fileName ? 'txt' : 'manual_paste',
      fileName,
      name_zh: datasetName,
      delimiterMode,
    })

    if (!result.success || !result.dataset) {
      onMessages([...result.errors_zh, ...result.warnings_zh])
      return
    }

    onDraftDataset(result.dataset)
    onMessages([
      '已完成初步解析，請確認欄位對應後儲存資料集。',
      ...result.warnings_zh,
    ])
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">匯入量測資料</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          支援 CSV / TXT / DAT 或手動貼上文字資料；所有解析都在瀏覽器端完成。
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-300">
          量測類型
          <select
            className="field-input mt-2"
            value={measurementType}
            onChange={(event) =>
              setMeasurementType(event.target.value as MeasurementType)
            }
          >
            {measurementTypes.map((type) => (
              <option key={type} value={type}>
                {getMeasurementTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-300">
          分隔符號
          <select
            className="field-input mt-2"
            value={delimiterMode}
            onChange={(event) =>
              setDelimiterMode(event.target.value as DelimiterMode)
            }
          >
            {delimiterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-300">
          資料集名稱
          <input
            className="field-input mt-2"
            value={datasetName}
            onChange={(event) => setDatasetName(event.target.value)}
          />
        </label>

        <label className="text-sm font-medium text-slate-300">
          選擇檔案
          <input
            accept=".csv,.txt,.dat,text/plain,text/csv"
            className="mt-2 block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/15 file:px-3 file:py-2 file:text-cyan-100 hover:file:bg-cyan-500/25"
            type="file"
            onChange={(event) => readFile(event.target.files?.[0])}
          />
        </label>
      </div>

      <label className="mt-4 block text-sm font-medium text-slate-300">
        手動貼上資料
        <textarea
          className="field-input mt-2 min-h-44 resize-y font-mono text-xs"
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="action-button" type="button" onClick={importDataset}>
          匯入資料
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            setRawText('')
            setFileName(undefined)
            setDatasetName('')
            onMessages(['已清除輸入。'])
          }}
        >
          清除輸入
        </button>
      </div>
    </section>
  )
}

