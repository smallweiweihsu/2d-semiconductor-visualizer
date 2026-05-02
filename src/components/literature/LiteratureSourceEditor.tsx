import { useState } from 'react'
import type {
  LiteratureReviewStatus,
  LiteratureSource,
  LiteratureSourceType,
} from '../../types/literature'
import { LiteratureReviewWorkflow } from './LiteratureReviewWorkflow'
import { formatSourceType } from './literatureFormatting'

interface LiteratureSourceEditorProps {
  source?: LiteratureSource | null
  onSaveSource: (source: LiteratureSource) => void
  onCancel?: () => void
}

const sourceTypes: LiteratureSourceType[] = [
  'journal_article',
  'conference_paper',
  'thesis',
  'review_article',
  'datasheet',
  'book',
  'webpage',
  'unknown',
]

export function LiteratureSourceEditor({
  source,
  onSaveSource,
  onCancel,
}: LiteratureSourceEditorProps) {
  const [draft, setDraft] = useState<LiteratureSource>(() =>
    source ?? createEmptySource(),
  )
  const missingVerifiedLocator =
    draft.reviewStatus === 'verified' && !draft.doi && !draft.url

  function updateDraft(updates: Partial<LiteratureSource>) {
    setDraft((current) => ({ ...current, ...updates }))
  }

  function saveSource() {
    if (!draft.title.trim()) {
      window.alert('請先填寫文獻標題。')
      return
    }

    onSaveSource({
      ...draft,
      title: draft.title.trim(),
      authors: draft.authors?.filter(Boolean),
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">文獻來源編輯</h3>
          <p className="mt-1 text-xs text-slate-500">
            DOI 與 URL 可稍後補齊；已驗證來源建議至少填入其中一項。
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => navigator.clipboard?.writeText(draft.id)}
          type="button"
        >
          複製來源 ID
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TextField
          label="標題"
          value={draft.title}
          onChange={(value) => updateDraft({ title: value })}
        />
        <TextField
          label="作者"
          value={draft.authors?.join(', ') ?? ''}
          onChange={(value) =>
            updateDraft({
              authors: value.split(',').map((item) => item.trim()),
            })
          }
        />
        <NumberField
          label="年份"
          value={draft.year}
          onChange={(value) => updateDraft({ year: value })}
        />
        <label className="text-xs font-medium text-slate-400">
          來源類型
          <select
            className="field-input mt-2"
            value={draft.sourceType}
            onChange={(event) =>
              updateDraft({ sourceType: event.target.value as LiteratureSourceType })
            }
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {formatSourceType(type)}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="期刊 / 出處"
          value={draft.journal ?? ''}
          onChange={(value) => updateDraft({ journal: value })}
        />
        <TextField
          label="DOI"
          value={draft.doi ?? ''}
          onChange={(value) => updateDraft({ doi: value })}
        />
        <TextField
          label="URL"
          value={draft.url ?? ''}
          onChange={(value) => updateDraft({ url: value })}
        />
        <TextField
          label="標籤"
          value={draft.tags_zh?.join(', ') ?? ''}
          onChange={(value) =>
            updateDraft({
              tags_zh: value.split(',').map((item) => item.trim()).filter(Boolean),
            })
          }
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-medium text-slate-400">審核狀態</div>
        <LiteratureReviewWorkflow
          currentStatus={draft.reviewStatus}
          mode="source"
          onChangeStatus={(status) =>
            updateDraft({ reviewStatus: status as LiteratureReviewStatus })
          }
        />
      </div>

      <label className="mt-4 block text-xs font-medium text-slate-400">
        備註
        <textarea
          className="field-input mt-2 min-h-24"
          value={draft.notes_zh ?? ''}
          onChange={(event) => updateDraft({ notes_zh: event.target.value })}
        />
      </label>

      {missingVerifiedLocator ? (
        <p className="mt-3 rounded-md border border-amber-900/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-100">
          已驗證來源建議補 DOI 或 URL；本工具不會在線上驗證 DOI。
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="primary-button" onClick={saveSource} type="button">
          {source ? '儲存' : '新增文獻來源'}
        </button>
        {onCancel ? (
          <button className="secondary-button" onClick={onCancel} type="button">
            取消
          </button>
        ) : null}
      </div>
    </section>
  )
}

function createEmptySource(): LiteratureSource {
  return {
    id: `source-${Date.now()}`,
    title: '',
    authors: [],
    year: null,
    sourceType: 'unknown',
    reviewStatus: 'candidate',
    notes_zh: '待查文獻；尚未人工審核。',
    tags_zh: [],
  }
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="text-xs font-medium text-slate-400">
      {label}
      <input
        className="field-input mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value?: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <label className="text-xs font-medium text-slate-400">
      {label}
      <input
        className="field-input mt-2"
        type="number"
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? null : Number(event.target.value))
        }
      />
    </label>
  )
}
