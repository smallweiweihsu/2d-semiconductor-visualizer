interface ReportPreviewProps {
  content: string
  mode: 'report' | 'summary'
  onChangeMode: (mode: 'report' | 'summary') => void
  onRefresh: () => void
}

export function ReportPreview({
  content,
  mode,
  onChangeMode,
  onRefresh,
}: ReportPreviewProps) {
  return (
    <section className="flex min-h-[34rem] min-w-0 flex-col rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-100">報告預覽</h3>
          <p className="mt-1 text-sm text-slate-400">
            預覽以 Markdown 純文字呈現，可下載或複製後再整理成實驗紀錄。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className={mode === 'report' ? 'tab-button-active' : 'tab-button'}
            type="button"
            onClick={() => onChangeMode('report')}
          >
            完整報告
          </button>
          <button
            className={mode === 'summary' ? 'tab-button-active' : 'tab-button'}
            type="button"
            onClick={() => onChangeMode('summary')}
          >
            實驗摘要
          </button>
          <button className="secondary-button" type="button" onClick={onRefresh}>
            更新預覽
          </button>
        </div>
      </div>

      <pre className="mt-4 min-h-0 flex-1 overflow-auto whitespace-pre-wrap rounded-md border border-slate-800 bg-slate-950 p-4 text-xs leading-6 text-slate-300">
        {content}
      </pre>
    </section>
  )
}
