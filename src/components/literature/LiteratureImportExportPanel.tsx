import { useState } from 'react'
import type { LiteratureDatabase } from '../../types/literature'
import {
  downloadTextFile,
  createTimestampedFilename,
} from '../../utils/projectExport'

interface LiteratureImportExportPanelProps {
  database: LiteratureDatabase
  onImportDatabase: (database: LiteratureDatabase) => void
}

export function LiteratureImportExportPanel({
  database,
  onImportDatabase,
}: LiteratureImportExportPanelProps) {
  const [jsonText, setJsonText] = useState('')
  const [status, setStatus] = useState('尚未執行匯入 / 匯出。')

  function exportJson() {
    downloadTextFile(
      createTimestampedFilename('literature-database', 'json'),
      JSON.stringify({ version: '1.0.0', literatureDatabase: database }, null, 2),
      'application/json;charset=utf-8',
    )
    setStatus('已匯出 literature database JSON。')
  }

  function exportTodoMarkdown() {
    downloadTextFile(
      createTimestampedFilename('literature-todo-list', 'md'),
      [
        '# 文獻待查清單',
        '',
        ...database.todos.map(
          (todo) =>
            `- ${todo.materialId} / ${todo.parameterKey} / ${todo.priority}: ${todo.reason_zh}`,
        ),
        '',
      ].join('\n'),
      'text/markdown;charset=utf-8',
    )
    setStatus('已匯出 TODO list Markdown。')
  }

  function exportEvidenceMarkdown() {
    downloadTextFile(
      createTimestampedFilename('literature-evidence-summary', 'md'),
      [
        '# 文獻參數證據摘要',
        '',
        ...database.evidence.map(
          (item) =>
            `- ${item.materialIds.join(', ')} / ${item.parameterKey}: ${item.value ?? '待補'} ${item.unit ?? ''} (${item.agreementStatus}, ${item.confidence})`,
        ),
        '',
      ].join('\n'),
      'text/markdown;charset=utf-8',
    )
    setStatus('已匯出 evidence summary Markdown。')
  }

  function importJson() {
    try {
      const parsed = JSON.parse(jsonText) as {
        literatureDatabase?: LiteratureDatabase
      } & Partial<LiteratureDatabase>
      const nextDatabase = parsed.literatureDatabase ?? parsed

      if (!isValidLiteratureDatabase(nextDatabase)) {
        setStatus('匯入失敗：JSON 必須包含 sources、evidence 與 conflictGroups。')
        return
      }

      if (!window.confirm('匯入會取代目前本機文獻資料庫狀態。確定繼續嗎？')) {
        return
      }

      onImportDatabase({
        sources: nextDatabase.sources,
        evidence: nextDatabase.evidence,
        conflictGroups: nextDatabase.conflictGroups,
        recommendations: nextDatabase.recommendations ?? [],
        todos: nextDatabase.todos ?? [],
      })
      setStatus('已匯入 literature database JSON。')
    } catch {
      setStatus('匯入失敗：JSON 格式無法解析。')
    }
  }

  return (
    <section className="grid gap-4">
      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">匯出</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="primary-button" onClick={exportJson} type="button">
            匯出文獻資料庫 JSON
          </button>
          <button
            className="secondary-button"
            onClick={exportTodoMarkdown}
            type="button"
          >
            匯出待查清單 Markdown
          </button>
          <button
            className="secondary-button"
            onClick={exportEvidenceMarkdown}
            type="button"
          >
            匯出證據摘要 Markdown
          </button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">匯入</h3>
        <p className="mt-2 text-xs leading-5 text-amber-100/80">
          匯入會取代目前本機文獻資料庫狀態；候選資料仍不會自動寫入材料資料庫。
        </p>
        <textarea
          className="field-input mt-3 min-h-48 font-mono text-xs"
          placeholder="貼上 literature database JSON"
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
        />
        <button className="primary-button mt-3" onClick={importJson} type="button">
          匯入文獻資料庫 JSON
        </button>
      </section>

      <div className="rounded-lg border border-slate-800 bg-slate-950/35 p-4 text-sm text-slate-300">
        狀態：{status}
      </div>
    </section>
  )
}

function isValidLiteratureDatabase(
  data: Partial<LiteratureDatabase>,
): data is LiteratureDatabase {
  return (
    Array.isArray(data.sources) &&
    Array.isArray(data.evidence) &&
    Array.isArray(data.conflictGroups)
  )
}
