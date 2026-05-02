import type { ReactNode } from 'react'
import type { DeviceLayer } from '../../types/device'
import type { MeasurementDataset } from '../../types/measurement'
import type { ProcessStep } from '../../types/process'
import { deviceRoleLabels } from '../../data/deviceRoles'
import { materials } from '../../data/materials'
import { processStepTypeLabels } from '../../data/processStepTypes'
import { getBeforeAfterTagLabel } from './measurementFormatting'

interface MeasurementMetadataEditorProps {
  dataset?: MeasurementDataset
  deviceLayers: DeviceLayer[]
  processSteps: ProcessStep[]
  onChangeDataset: (dataset: MeasurementDataset) => void
}

export function MeasurementMetadataEditor({
  dataset,
  deviceLayers,
  onChangeDataset,
  processSteps,
}: MeasurementMetadataEditorProps) {
  if (!dataset) {
    return (
      <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-400">
        選擇資料集後，可編輯 metadata、關聯材料層與製程步驟。
      </section>
    )
  }

  const currentDataset = dataset

  function updateDataset(changes: Partial<MeasurementDataset>) {
    onChangeDataset({ ...currentDataset, ...changes })
  }

  function updateMetadata(key: string, value: string | number | null) {
    updateDataset({
      metadata: {
        ...currentDataset.metadata,
        [key]: value,
      },
    })
  }

  function toggleLayer(layerId: string) {
    const linked = new Set(currentDataset.linkedLayerIds)
    if (linked.has(layerId)) {
      linked.delete(layerId)
    } else {
      linked.add(layerId)
    }
    updateDataset({ linkedLayerIds: [...linked] })
  }

  function toggleStep(stepId: string) {
    const linked = new Set(currentDataset.linkedProcessStepIds)
    if (linked.has(stepId)) {
      linked.delete(stepId)
    } else {
      linked.add(stepId)
    }
    updateDataset({ linkedProcessStepIds: [...linked] })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <h3 className="text-base font-semibold text-slate-100">資料集 metadata</h3>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Field label="資料集名稱">
          <input
            className="field-input"
            value={dataset.name_zh}
            onChange={(event) => updateDataset({ name_zh: event.target.value })}
          />
        </Field>
        <Field label="樣品名稱">
          <input
            className="field-input"
            value={dataset.metadata.sampleName ?? ''}
            onChange={(event) => updateMetadata('sampleName', event.target.value)}
          />
        </Field>
        <Field label="條件名稱">
          <input
            className="field-input"
            value={dataset.metadata.conditionName ?? ''}
            onChange={(event) =>
              updateMetadata('conditionName', event.target.value)
            }
          />
        </Field>
        <Field label="before / after 標籤">
          <select
            className="field-input"
            value={dataset.metadata.beforeAfterTag ?? 'unknown'}
            onChange={(event) =>
              updateMetadata('beforeAfterTag', event.target.value)
            }
          >
            {(['before', 'after', 'reference', 'unknown'] as const).map((tag) => (
              <option key={tag} value={tag}>
                {getBeforeAfterTagLabel(tag)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="儀器">
          <input
            className="field-input"
            value={dataset.metadata.instrument ?? ''}
            onChange={(event) => updateMetadata('instrument', event.target.value)}
          />
        </Field>
        <Field label="操作者">
          <input
            className="field-input"
            value={dataset.metadata.operator ?? ''}
            onChange={(event) => updateMetadata('operator', event.target.value)}
          />
        </Field>
        <Field label="量測日期">
          <input
            className="field-input"
            type="date"
            value={dataset.metadata.date ?? ''}
            onChange={(event) => updateMetadata('date', event.target.value)}
          />
        </Field>
        <Field label="溫度 K">
          <input
            className="field-input"
            type="number"
            value={dataset.metadata.temperature_K ?? ''}
            onChange={(event) =>
              updateMetadata(
                'temperature_K',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </Field>
        <Field label="雷射波長 nm">
          <input
            className="field-input"
            type="number"
            value={dataset.metadata.laserWavelength_nm ?? ''}
            onChange={(event) =>
              updateMetadata(
                'laserWavelength_nm',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </Field>
        <Field label="雷射功率 mW">
          <input
            className="field-input"
            type="number"
            value={dataset.metadata.laserPower_mW ?? ''}
            onChange={(event) =>
              updateMetadata(
                'laserPower_mW',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </Field>
        <Field label="積分時間 s">
          <input
            className="field-input"
            type="number"
            value={dataset.metadata.integrationTime_s ?? ''}
            onChange={(event) =>
              updateMetadata(
                'integrationTime_s',
                event.target.value === '' ? null : Number(event.target.value),
              )
            }
          />
        </Field>
        <Field label="光柵 / bias condition">
          <input
            className="field-input"
            value={dataset.metadata.grating ?? dataset.metadata.biasCondition ?? ''}
            onChange={(event) => {
              updateMetadata('grating', event.target.value)
              updateMetadata('biasCondition', event.target.value)
            }}
          />
        </Field>
      </div>

      <label className="mt-3 block text-sm font-medium text-slate-300">
        備註
        <textarea
          className="field-input mt-2 min-h-24 resize-y"
          value={dataset.notes_zh ?? ''}
          onChange={(event) => updateDataset({ notes_zh: event.target.value })}
        />
      </label>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <LinkSection title="關聯材料層">
          {deviceLayers.map((layer) => {
            const material = materials.find((item) => item.id === layer.materialId)
            return (
              <label
                className="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2 text-sm text-slate-300"
                key={layer.id}
              >
                <input
                  checked={dataset.linkedLayerIds.includes(layer.id)}
                  className="mt-1"
                  type="checkbox"
                  onChange={() => toggleLayer(layer.id)}
                />
                <span>
                  <span className="font-medium text-slate-100">{layer.name}</span>
                  <span className="block text-xs text-slate-500">
                    {material?.displayName ?? layer.materialId} /{' '}
                    {deviceRoleLabels[layer.role]}
                  </span>
                </span>
              </label>
            )
          })}
        </LinkSection>

        <LinkSection title="關聯製程步驟">
          {processSteps.map((step) => (
            <label
              className="flex items-start gap-2 rounded-md border border-slate-800 bg-slate-950/60 p-2 text-sm text-slate-300"
              key={step.id}
            >
              <input
                checked={dataset.linkedProcessStepIds.includes(step.id)}
                className="mt-1"
                type="checkbox"
                onChange={() => toggleStep(step.id)}
              />
              <span>
                <span className="font-medium text-slate-100">{step.name_zh}</span>
                <span className="block text-xs text-slate-500">
                  {processStepTypeLabels[step.type]}
                </span>
              </span>
            </label>
          ))}
        </LinkSection>
      </div>
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

function LinkSection({
  children,
  title,
}: {
  children: ReactNode
  title: string
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      <div className="mt-2 max-h-60 space-y-2 overflow-y-auto pr-1">
        {children}
      </div>
    </div>
  )
}
