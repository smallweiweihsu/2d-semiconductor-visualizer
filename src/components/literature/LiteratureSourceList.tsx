import type { LiteratureSource } from '../../types/literature'
import { formatSourceType } from './literatureFormatting'
import { LiteratureStatusBadge } from './LiteratureStatusBadge'

interface LiteratureSourceListProps {
  sources: LiteratureSource[]
  selectedId: string | null
  onSelectSource: (sourceId: string) => void
}

export function LiteratureSourceList({
  sources,
  selectedId,
  onSelectSource,
}: LiteratureSourceListProps) {
  if (sources.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 p-4 text-sm text-slate-500">
        目前沒有符合篩選條件的文獻來源。
      </div>
    )
  }

  return (
    <div className="grid gap-2">
      {sources.map((source) => (
        <button
          className={`rounded-md border p-3 text-left transition ${
            source.id === selectedId
              ? 'border-cyan-600 bg-cyan-950/30'
              : 'border-slate-800 bg-slate-950/35 hover:border-slate-700'
          }`}
          key={source.id}
          onClick={() => onSelectSource(source.id)}
          type="button"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-slate-100">
                {source.title}
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                {source.year ?? '年份待補'} · {formatSourceType(source.sourceType)}
                {source.doi ? ` · DOI: ${source.doi}` : ''}
              </p>
            </div>
            <LiteratureStatusBadge reviewStatus={source.reviewStatus} />
          </div>
          {source.tags_zh && source.tags_zh.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {source.tags_zh.map((tag) => (
                <span
                  className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400"
                  key={tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  )
}
