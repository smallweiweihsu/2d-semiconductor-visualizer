import { processStepTemplates } from '../../data/processSteps'
import { processStepTypes } from '../../data/processStepTypes'
import type { ProcessStep } from '../../types/process'
import { getProcessTypeAccentClass, getProcessTypeCategory } from './processFormatting'

interface ProcessStepTemplatePickerProps {
  onAddTemplate: (template: ProcessStep) => void
  onClose: () => void
}

const categoryOrder = ['製程', '微影', '量測', '觀察', '自訂'] as const

export function ProcessStepTemplatePicker({
  onAddTemplate,
  onClose,
}: ProcessStepTemplatePickerProps) {
  return (
    <section className="rounded-lg border border-cyan-900/50 bg-cyan-950/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">新增製程/量測步驟</h3>
          <p className="mt-1 text-xs text-slate-500">
            選擇樣板後會加入流程，並立即開啟步驟設定。
          </p>
        </div>
        <button
          className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-500"
          onClick={onClose}
          type="button"
        >
          收合
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {categoryOrder.map((category) => {
          const templates = processStepTemplates.filter(
            (template) => getProcessTypeCategory(template.type) === category,
          )

          if (templates.length === 0) {
            return null
          }

          return (
            <div key={category}>
              <h4 className="mb-2 text-xs font-semibold text-slate-400">{category}</h4>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {templates.map((template) => {
                  const typeDefinition = processStepTypes.find(
                    (item) => item.id === template.type,
                  )

                  return (
                    <button
                      className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-left transition hover:border-cyan-700/70 hover:bg-cyan-950/15"
                      key={template.id}
                      onClick={() => onAddTemplate(template)}
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-100">
                          {template.name_zh}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] ${getProcessTypeAccentClass(
                            template.type,
                          )}`}
                        >
                          {category}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                        {typeDefinition?.description_zh ?? template.description_zh}
                      </p>
                      <div className="mt-3 flex gap-2 text-[11px] text-slate-500">
                        <span className="rounded-full border border-slate-800 px-2 py-1">
                          {template.parameters.length} 個參數
                        </span>
                        {template.warnings_zh.length > 0 ? (
                          <span className="rounded-full border border-amber-800/50 px-2 py-1 text-amber-200">
                            含提醒
                          </span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
