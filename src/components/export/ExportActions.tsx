import type { ProjectSaveData } from '../../types/project'
import {
  createTimestampedFilename,
  downloadTextFile,
  serializeProjectToJson,
} from '../../utils/projectExport'
import {
  generateExperimentSummary,
  generateMarkdownReport,
} from '../../utils/markdownReport'

interface ExportActionsProps {
  projectData: ProjectSaveData
  onStatus: (message: string) => void
  onRefreshPreview: (mode: 'report' | 'summary') => void
}

export function ExportActions({
  projectData,
  onRefreshPreview,
  onStatus,
}: ExportActionsProps) {
  function exportJson() {
    downloadTextFile(
      createTimestampedFilename('2d-device-project', 'json'),
      serializeProjectToJson(projectData),
      'application/json;charset=utf-8',
    )
    onStatus('專案 JSON 已產生下載。')
  }

  function exportMarkdownReport() {
    downloadTextFile(
      createTimestampedFilename('2d-device-report', 'md'),
      generateMarkdownReport(projectData),
      'text/markdown;charset=utf-8',
    )
    onStatus('Markdown 完整報告已產生下載。')
  }

  function exportExperimentSummary() {
    downloadTextFile(
      createTimestampedFilename('2d-device-summary', 'md'),
      generateExperimentSummary(projectData),
      'text/markdown;charset=utf-8',
    )
    onStatus('實驗摘要已產生下載。')
  }

  async function copyMarkdownReport() {
    if (!navigator.clipboard) {
      onStatus('此瀏覽器不支援剪貼簿複製，請改用 Markdown 下載。')
      return
    }

    try {
      await navigator.clipboard.writeText(generateMarkdownReport(projectData))
      onStatus('Markdown 報告已複製到剪貼簿。')
    } catch {
      onStatus('複製失敗，請改用 Markdown 下載。')
    }
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">匯出動作</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          匯出都在瀏覽器端完成，不會上傳到伺服器或雲端。
        </p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <button className="action-button" type="button" onClick={exportJson}>
          匯出專案 JSON
        </button>
        <button
          className="action-button"
          type="button"
          onClick={exportMarkdownReport}
        >
          匯出 Markdown 報告
        </button>
        <button
          className="action-button"
          type="button"
          onClick={exportExperimentSummary}
        >
          匯出實驗摘要
        </button>
        <button
          className="action-button"
          type="button"
          onClick={copyMarkdownReport}
        >
          複製 Markdown 報告
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className="secondary-button"
          type="button"
          onClick={() => onRefreshPreview('report')}
        >
          重新產生完整預覽
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onRefreshPreview('summary')}
        >
          重新產生摘要預覽
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        檔名會包含目前時間，例如 2d-device-project-YYYY-MM-DD-HHMM.json。
      </p>
    </section>
  )
}
