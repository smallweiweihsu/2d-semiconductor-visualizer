import type { DeviceLayer } from '../../types/device'
import type { ProcessParameter, ProcessStep } from '../../types/process'
import { getProcessStepTypeDefinition } from '../../data/processStepTypes'
import { ProcessParameterEditor } from './ProcessParameterEditor'
import { getLinkedLayerLabel, getProcessTypeAccentClass } from './processFormatting'

interface ProcessStepEditorProps {
  deviceLayers: DeviceLayer[]
  step: ProcessStep | null
  onUpdateStep: (step: ProcessStep) => void
}

export function ProcessStepEditor({
  deviceLayers,
  step,
  onUpdateStep,
}: ProcessStepEditorProps) {
  if (!step) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-6 text-sm text-slate-500">
        請從左側流程時間線選擇一個步驟。
      </section>
    )
  }

  const activeStep = step
  const typeDefinition = getProcessStepTypeDefinition(activeStep.type)

  function updateParameter(nextParameter: ProcessParameter) {
    onUpdateStep({
      ...activeStep,
      parameters: activeStep.parameters.map((parameter) =>
        parameter.id === nextParameter.id ? nextParameter : parameter,
      ),
    })
  }

  function toggleLinkedLayer(layerId: string) {
    const linkedLayerIds = activeStep.linkedLayerIds ?? []
    const nextLinkedLayerIds = linkedLayerIds.includes(layerId)
      ? linkedLayerIds.filter((id) => id !== layerId)
      : [...linkedLayerIds, layerId]

    onUpdateStep({
      ...activeStep,
      linkedLayerIds: nextLinkedLayerIds,
    })
  }

  return (
    <section className="flex min-h-0 flex-col rounded-lg border border-slate-800 bg-slate-950/35">
      <div className="border-b border-slate-800 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">步驟設定</h3>
            <p className="mt-1 text-xs text-slate-500">
              編輯此製程或量測步驟的條件、註記與關聯材料層。
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs ${getProcessTypeAccentClass(
              step.type,
            )}`}
          >
            {typeDefinition?.label_zh ?? '自訂步驟'}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        <section className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-400">步驟名稱</span>
            <input
              className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              onChange={(event) => onUpdateStep({ ...step, name_zh: event.target.value })}
              value={step.name_zh}
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-400">啟用狀態</span>
            <button
              className={`mt-2 block rounded-md border px-3 py-2 text-sm transition ${
                step.enabled
                  ? 'border-cyan-600 bg-cyan-950/40 text-cyan-100'
                  : 'border-slate-700 bg-slate-950/60 text-slate-400'
              }`}
              onClick={() => onUpdateStep({ ...step, enabled: !step.enabled })}
              type="button"
            >
              {step.enabled ? '啟用' : '停用'}
            </button>
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-slate-400">描述</span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              onChange={(event) =>
                onUpdateStep({ ...step, description_zh: event.target.value })
              }
              value={step.description_zh}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-xs font-medium text-slate-400">步驟註記</span>
            <textarea
              className="mt-2 min-h-20 w-full rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              onChange={(event) => onUpdateStep({ ...step, notes_zh: event.target.value })}
              placeholder="記錄樣品狀態、儀器條件、異常現象或後續需要確認的事項。"
              value={step.notes_zh ?? ''}
            />
          </label>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-100">參數</h4>
            <span className="text-xs text-slate-500">
              {step.parameters.length} 個欄位
            </span>
          </div>
          <div className="grid gap-3 xl:grid-cols-2">
            {step.parameters.map((parameter) => (
              <ProcessParameterEditor
                key={parameter.id}
                parameter={parameter}
                onUpdateParameter={updateParameter}
              />
            ))}
          </div>
        </section>

        <section>
          <h4 className="text-sm font-semibold text-slate-100">關聯材料層</h4>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            將製程或量測步驟連到目前元件結構中的材料層；此關聯目前只作紀錄，不會改變幾何或執行模擬。
          </p>
          <div className="mt-3 grid gap-2">
            {deviceLayers.length === 0 ? (
              <div className="rounded-md border border-slate-800 p-3 text-sm text-slate-500">
                目前沒有可關聯的材料層。
              </div>
            ) : null}

            {deviceLayers.map((layer) => {
              const linkedLayerIds = step.linkedLayerIds ?? []
              const layerLabel = getLinkedLayerLabel(layer)

              return (
                <label
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-300 hover:border-slate-700"
                  key={layer.id}
                >
                  <input
                    checked={linkedLayerIds.includes(layer.id)}
                    className="mt-1"
                    onChange={() => toggleLinkedLayer(layer.id)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-medium text-slate-100">{layer.name}</span>
                    <span className="text-xs text-slate-500">
                      {layerLabel.materialName} · {layerLabel.roleLabel} ·{' '}
                      {layerLabel.categoryLabel}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          <InfoList title="假設" items={step.assumptions_zh} />
          <InfoList title="提醒" items={step.warnings_zh} />
        </section>
      </div>
    </section>
  )
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/35 p-3">
      <h5 className="text-xs font-semibold text-slate-300">{title}</h5>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-500">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
