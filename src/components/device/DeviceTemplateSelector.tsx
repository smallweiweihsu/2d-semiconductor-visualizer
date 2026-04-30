import type { DeviceTemplate } from '../../types/device'

interface DeviceTemplateSelectorProps {
  templates: DeviceTemplate[]
  selectedTemplateId: string
  onSelectTemplate: (templateId: string) => void
}

export function DeviceTemplateSelector({
  templates,
  selectedTemplateId,
  onSelectTemplate,
}: DeviceTemplateSelectorProps) {
  const selectedTemplate =
    templates.find((template) => template.id === selectedTemplateId) ??
    templates[0]

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h3 className="text-sm font-medium text-slate-200">內建元件模板</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            選擇起始結構後，可在下方繼續編輯每一層材料與幾何設定。
          </p>
        </div>

        <label className="block min-w-72 text-xs text-slate-400">
          模板
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => onSelectTemplate(event.target.value)}
            value={selectedTemplateId}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.shortName_zh}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div>
          <h4 className="text-lg font-semibold text-slate-50">
            {selectedTemplate.name_zh}
          </h4>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {selectedTemplate.description_zh}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {selectedTemplate.purpose_zh}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {selectedTemplate.tags_zh.map((tag) => (
              <span
                className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs text-slate-300"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 text-xs leading-5">
          <InfoBlock
            title="模型假設"
            items={selectedTemplate.assumptions_zh}
          />
          <InfoBlock
            title="模板提醒"
            items={selectedTemplate.warnings_zh}
            tone="warning"
          />
        </div>
      </div>
    </section>
  )
}

interface InfoBlockProps {
  title: string
  items: string[]
  tone?: 'default' | 'warning'
}

function InfoBlock({ title, items, tone = 'default' }: InfoBlockProps) {
  const toneClasses =
    tone === 'warning'
      ? 'border-amber-900/40 bg-amber-950/15 text-amber-100/90'
      : 'border-slate-800 bg-slate-900/55 text-slate-300'

  return (
    <section className={`rounded-md border p-3 ${toneClasses}`}>
      <h5 className="font-medium">{title}</h5>
      <ul className="mt-2 space-y-1.5">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-60" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
