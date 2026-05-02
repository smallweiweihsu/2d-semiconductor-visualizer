import { useMemo, useState } from 'react'
import { materials } from '../../data/materials'
import type {
  LiteratureAgreementStatus,
  LiteratureSource,
  MaterialParameterKey,
  ParameterEvidence,
} from '../../types/literature'
import {
  formatAgreementStatus,
  formatParameterKey,
} from './literatureFormatting'

interface ParameterEvidenceEditorProps {
  evidence?: ParameterEvidence | null
  initialMaterialId?: string
  initialParameterKey?: MaterialParameterKey
  sources: LiteratureSource[]
  onSaveEvidence: (evidence: ParameterEvidence) => void
}

const parameterKeys: MaterialParameterKey[] = [
  'workFunction_eV',
  'bandGap_eV',
  'electronAffinity_eV',
  'dielectricConstant',
  'mobility_cm2Vs',
  'resistivity_ohm_m',
  'latticeConstant_A',
  'defaultThickness_nm',
  'breakdownField_MVcm',
  'meltingPoint_C',
  'D0_m2s',
  'Ea_eV',
  'oxidationRate_nm_per_s',
  'ramanProbeDepth_nm',
  'contactResistance_ohm',
  'bandOffset_eV',
  'custom',
]
const agreementStatuses: LiteratureAgreementStatus[] = [
  'supports',
  'contradicts',
  'condition_dependent',
  'not_applicable',
  'unclear',
]

export function ParameterEvidenceEditor({
  evidence,
  initialMaterialId,
  initialParameterKey,
  sources,
  onSaveEvidence,
}: ParameterEvidenceEditorProps) {
  const [draft, setDraft] = useState<ParameterEvidence>(() =>
    evidence ??
    createEmptyEvidence(
      sources[0]?.id ?? 'source-missing',
      initialMaterialId,
      initialParameterKey,
    ),
  )
  const materialIdSet = useMemo(() => new Set(draft.materialIds), [draft.materialIds])

  function updateDraft(updates: Partial<ParameterEvidence>) {
    setDraft((current) => ({ ...current, ...updates }))
  }

  function toggleMaterial(materialId: string) {
    updateDraft({
      materialIds: materialIdSet.has(materialId)
        ? draft.materialIds.filter((id) => id !== materialId)
        : [...draft.materialIds, materialId],
    })
  }

  function saveEvidence() {
    if (draft.materialIds.length === 0) {
      window.alert('請至少選擇一個材料。')
      return
    }

    onSaveEvidence({
      ...draft,
      warnings_zh:
        draft.warnings_zh && draft.warnings_zh.length > 0
          ? draft.warnings_zh
          : ['此紀錄仍需人工審核，不可直接作為正式材料參數。'],
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">參數證據編輯</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          數值可留空；qualitative claim 也可用 custom 參數保存為候選證據。
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium text-slate-400">
          來源
          <select
            className="field-input mt-2"
            value={draft.sourceId}
            onChange={(event) => updateDraft({ sourceId: event.target.value })}
          >
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-400">
          參數
          <select
            className="field-input mt-2"
            value={draft.parameterKey}
            onChange={(event) =>
              updateDraft({ parameterKey: event.target.value as MaterialParameterKey })
            }
          >
            {parameterKeys.map((key) => (
              <option key={key} value={key}>
                {formatParameterKey(key)}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="數值"
          value={draft.value === null ? '' : String(draft.value)}
          onChange={(value) =>
            updateDraft({ value: value.trim() === '' ? null : parseValue(value) })
          }
        />
        <TextField
          label="單位"
          value={draft.unit ?? ''}
          onChange={(value) => updateDraft({ unit: value })}
        />
        <TextField
          label="條件"
          value={draft.condition_zh ?? ''}
          onChange={(value) => updateDraft({ condition_zh: value })}
        />
        <TextField
          label="方法"
          value={draft.method_zh ?? ''}
          onChange={(value) => updateDraft({ method_zh: value })}
        />
        <label className="text-xs font-medium text-slate-400">
          支持 / 衝突
          <select
            className="field-input mt-2"
            value={draft.agreementStatus}
            onChange={(event) =>
              updateDraft({
                agreementStatus: event.target.value as LiteratureAgreementStatus,
              })
            }
          >
            {agreementStatuses.map((status) => (
              <option key={status} value={status}>
                {formatAgreementStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-400">
          信心
          <select
            className="field-input mt-2"
            value={draft.confidence}
            onChange={(event) =>
              updateDraft({
                confidence: event.target.value as ParameterEvidence['confidence'],
              })
            }
          >
            <option value="unknown">未知</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </label>
      </div>

      <div className="mt-4">
        <div className="mb-2 text-xs font-medium text-slate-400">材料</div>
        <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/40 p-3 md:grid-cols-2">
          {materials.map((material) => (
            <label
              className="flex items-center gap-2 text-xs text-slate-300"
              key={material.id}
            >
              <input
                checked={materialIdSet.has(material.id)}
                type="checkbox"
                onChange={() => toggleMaterial(material.id)}
              />
              {material.displayName}
            </label>
          ))}
        </div>
      </div>

      <TextArea
        label="引用摘要 / 判讀摘要"
        value={draft.quoteOrSummary_zh ?? ''}
        onChange={(value) => updateDraft({ quoteOrSummary_zh: value })}
      />
      <TextArea
        label="適用性"
        value={draft.applicability_zh ?? ''}
        onChange={(value) => updateDraft({ applicability_zh: value })}
      />
      <TextArea
        label="警告"
        value={draft.warnings_zh?.join('\n') ?? ''}
        onChange={(value) =>
          updateDraft({
            warnings_zh: value.split('\n').map((item) => item.trim()).filter(Boolean),
          })
        }
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="primary-button" onClick={saveEvidence} type="button">
          {evidence ? '儲存' : '新增參數證據'}
        </button>
        <button className="secondary-button" onClick={saveEvidence} type="button">
          建立 / 更新衝突群組
        </button>
      </div>
    </section>
  )
}

function createEmptyEvidence(
  sourceId: string,
  initialMaterialId?: string,
  initialParameterKey?: MaterialParameterKey,
): ParameterEvidence {
  return {
    id: `evidence-${Date.now()}`,
    sourceId,
    materialIds: initialMaterialId ? [initialMaterialId] : [],
    parameterKey: initialParameterKey ?? 'custom',
    value: null,
    unit: '',
    condition_zh: '',
    method_zh: '',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh: '',
    applicability_zh: '',
    warnings_zh: ['此紀錄為候選證據，尚未經人工審核。'],
  }
}

function parseValue(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : value
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

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="mt-4 block text-xs font-medium text-slate-400">
      {label}
      <textarea
        className="field-input mt-2 min-h-20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
