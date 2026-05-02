import { useState } from 'react'
import type { ProjectImportResult } from '../../types/project'
import { parseProjectJson } from '../../utils/projectExport'

interface ImportProjectPanelProps {
  onImportProject: (result: ProjectImportResult) => void
}

export function ImportProjectPanel({ onImportProject }: ImportProjectPanelProps) {
  const [jsonText, setJsonText] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  function handleFileChange(file?: File) {
    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setJsonText(String(reader.result ?? ''))
      setMessages([`已讀取檔案：${file.name}`])
    }
    reader.onerror = () => setMessages(['檔案讀取失敗。'])
    reader.readAsText(file)
  }

  function importJson() {
    const result = parseProjectJson(jsonText)

    if (!result.success) {
      setMessages([...result.errors_zh, ...result.warnings_zh])
      return
    }

    if (
      !window.confirm(
        '匯入專案會取代目前元件結構與製程流程。請先確認已匯出目前版本。',
      )
    ) {
      setMessages(['已取消匯入。'])
      return
    }

    setMessages(['專案 JSON 驗證成功，正在套用可還原欄位。', ...result.warnings_zh])
    onImportProject(result)
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">匯入專案 JSON</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          匯入會還原元件結構、製程流程與專案資訊；部分模組狀態目前會保留在資料中但尚未自動套用。
        </p>
      </div>

      <input
        accept="application/json,.json"
        className="mt-4 block w-full text-sm text-slate-300 file:mr-3 file:rounded-md file:border-0 file:bg-cyan-500/15 file:px-3 file:py-2 file:text-cyan-100 hover:file:bg-cyan-500/25"
        type="file"
        onChange={(event) => handleFileChange(event.target.files?.[0])}
      />

      <label className="mt-4 block text-sm font-medium text-slate-300">
        貼上 JSON
        <textarea
          className="field-input mt-2 min-h-32 resize-y font-mono text-xs"
          placeholder="{ ... }"
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
        />
      </label>

      <button
        className="mt-3 rounded-md bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        disabled={!jsonText.trim()}
        type="button"
        onClick={importJson}
      >
        匯入專案 JSON
      </button>

      {messages.length > 0 ? (
        <ul className="mt-3 space-y-1 text-sm text-slate-400">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
