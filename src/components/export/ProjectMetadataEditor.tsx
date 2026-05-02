import type { ReactNode } from 'react'
import type { ProjectMetadata } from '../../types/project'

interface ProjectMetadataEditorProps {
  metadata: ProjectMetadata
  onChangeMetadata: (metadata: ProjectMetadata) => void
}

export function ProjectMetadataEditor({
  metadata,
  onChangeMetadata,
}: ProjectMetadataEditorProps) {
  function updateField<K extends keyof ProjectMetadata>(
    key: K,
    value: ProjectMetadata[K],
  ) {
    onChangeMetadata({
      ...metadata,
      [key]: value,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">專案資訊</h3>
        <p className="mt-1 text-sm leading-6 text-slate-400">
          這些欄位會寫入 JSON 與 Markdown 報告，方便後續比較不同樣品或製程條件。
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="專案名稱">
          <input
            className="field-input"
            value={metadata.projectName_zh}
            onChange={(event) =>
              updateField('projectName_zh', event.target.value)
            }
          />
        </Field>

        <Field label="樣品名稱">
          <input
            className="field-input"
            value={metadata.sampleName ?? ''}
            onChange={(event) => updateField('sampleName', event.target.value)}
          />
        </Field>

        <Field label="研究者">
          <input
            className="field-input"
            value={metadata.researcher ?? ''}
            onChange={(event) => updateField('researcher', event.target.value)}
          />
        </Field>

        <Field label="單位 / 實驗室">
          <input
            className="field-input"
            value={metadata.institution ?? ''}
            onChange={(event) => updateField('institution', event.target.value)}
          />
        </Field>

        <Field label="標籤">
          <input
            className="field-input"
            placeholder="例如：WSe₂, Sb₂O₃, top gate"
            value={metadata.tags_zh?.join(', ') ?? ''}
            onChange={(event) =>
              updateField(
                'tags_zh',
                event.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean),
              )
            }
          />
        </Field>

        <Field label="更新時間">
          <input
            className="field-input text-slate-500"
            readOnly
            value={new Date(metadata.updatedAt).toLocaleString('zh-TW')}
          />
        </Field>
      </div>

      <label className="mt-3 block text-sm font-medium text-slate-300">
        備註
        <textarea
          className="field-input mt-2 min-h-24 resize-y"
          value={metadata.notes_zh ?? ''}
          onChange={(event) => updateField('notes_zh', event.target.value)}
        />
      </label>
    </section>
  )
}

function Field({
  children,
  label,
}: {
  children: ReactNode
  label: string
}) {
  return (
    <label className="block text-sm font-medium text-slate-300">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  )
}
