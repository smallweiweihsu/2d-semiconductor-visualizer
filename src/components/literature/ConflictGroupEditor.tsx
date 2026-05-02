import { useMemo, useState } from 'react'
import { materials } from '../../data/materials'
import type {
  MaterialParameterKey,
  ParameterConflictGroup,
  ParameterEvidence,
} from '../../types/literature'
import {
  formatAgreementStatus,
  formatParameterKey,
  formatRecommendationStatus,
} from './literatureFormatting'

interface ConflictGroupEditorProps {
  conflictGroup?: ParameterConflictGroup | null
  evidence: ParameterEvidence[]
  onSaveConflictGroup: (conflictGroup: ParameterConflictGroup) => void
}

const recommendationStatuses: ParameterConflictGroup['recommendedStatus'][] = [
  'no_recommendation',
  'condition_dependent',
  'needs_review',
  'ready_to_use',
]

export function ConflictGroupEditor({
  conflictGroup,
  evidence,
  onSaveConflictGroup,
}: ConflictGroupEditorProps) {
  const [draft, setDraft] = useState<ParameterConflictGroup>(() =>
    conflictGroup ?? createEmptyConflictGroup(evidence),
  )
  const evidenceSet = useMemo(() => new Set(draft.evidenceIds), [draft.evidenceIds])
  const counts = countAgreement(evidence.filter((item) => evidenceSet.has(item.id)))

  function updateDraft(updates: Partial<ParameterConflictGroup>) {
    setDraft((current) => ({ ...current, ...updates }))
  }

  function toggleEvidence(evidenceId: string) {
    updateDraft({
      evidenceIds: evidenceSet.has(evidenceId)
        ? draft.evidenceIds.filter((id) => id !== evidenceId)
        : [...draft.evidenceIds, evidenceId],
    })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <h3 className="text-sm font-semibold text-slate-100">衝突 / 共識編輯</h3>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        衝突群組用來整理不同文獻對同一材料參數或論點的差異，不會自動改寫正式材料資料庫。
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-xs font-medium text-slate-400">
          材料
          <select
            className="field-input mt-2"
            value={draft.materialId}
            onChange={(event) => updateDraft({ materialId: event.target.value })}
          >
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.displayName}
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
            {getParameterKeys(evidence).map((key) => (
              <option key={key} value={key}>
                {formatParameterKey(key)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-400">
          建議狀態
          <select
            className="field-input mt-2"
            value={draft.recommendedStatus}
            onChange={(event) =>
              updateDraft({
                recommendedStatus:
                  event.target.value as ParameterConflictGroup['recommendedStatus'],
              })
            }
          >
            {recommendationStatuses.map((status) => (
              <option key={status} value={status}>
                {formatRecommendationStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <TextField
          label="建議值"
          value={draft.recommendedValue === undefined || draft.recommendedValue === null ? '' : String(draft.recommendedValue)}
          onChange={(value) =>
            updateDraft({
              recommendedValue: value.trim() === '' ? null : parseValue(value),
            })
          }
        />
        <TextField
          label="建議單位"
          value={draft.recommendedUnit ?? ''}
          onChange={(value) => updateDraft({ recommendedUnit: value })}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <CountPill label="支持" value={counts.supports} />
        <CountPill label="衝突" value={counts.contradicts} />
        <CountPill label="依條件" value={counts.condition_dependent} />
        <CountPill label="尚不明確" value={counts.unclear} />
        <CountPill label="不適用" value={counts.not_applicable} />
      </div>

      <label className="mt-4 block text-xs font-medium text-slate-400">
        Evidence IDs
        <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto rounded-md border border-slate-800 bg-slate-950/40 p-3">
          {evidence.map((item) => (
            <label className="flex items-start gap-2 text-xs text-slate-300" key={item.id}>
              <input
                checked={evidenceSet.has(item.id)}
                type="checkbox"
                onChange={() => toggleEvidence(item.id)}
              />
              <span>
                {formatParameterKey(item.parameterKey)} ·{' '}
                {formatAgreementStatus(item.agreementStatus)} · {item.id}
              </span>
            </label>
          ))}
        </div>
      </label>

      <TextArea
        label="整理摘要"
        value={draft.summary_zh}
        onChange={(value) => updateDraft({ summary_zh: value })}
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

      <button
        className="primary-button mt-4"
        onClick={() => onSaveConflictGroup(draft)}
        type="button"
      >
        儲存衝突群組
      </button>
    </section>
  )
}

function createEmptyConflictGroup(evidence: ParameterEvidence[]): ParameterConflictGroup {
  return {
    id: `conflict-${Date.now()}`,
    materialId: evidence[0]?.materialIds[0] ?? 'wse2',
    parameterKey: evidence[0]?.parameterKey ?? 'custom',
    evidenceIds: evidence[0] ? [evidence[0].id] : [],
    summary_zh: '',
    recommendedStatus: 'needs_review',
    recommendedValue: null,
    recommendedUnit: '',
    warnings_zh: ['此整理仍需人工審核。'],
  }
}

function countAgreement(evidence: ParameterEvidence[]) {
  return evidence.reduce(
    (counts, item) => {
      counts[item.agreementStatus] += 1
      return counts
    },
    {
      supports: 0,
      contradicts: 0,
      condition_dependent: 0,
      not_applicable: 0,
      unclear: 0,
    },
  )
}

function getParameterKeys(evidence: ParameterEvidence[]): MaterialParameterKey[] {
  return [...new Set(['custom', ...evidence.map((item) => item.parameterKey)])] as MaterialParameterKey[]
}

function parseValue(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : value
}

function CountPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
      {label} {value}
    </span>
  )
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
