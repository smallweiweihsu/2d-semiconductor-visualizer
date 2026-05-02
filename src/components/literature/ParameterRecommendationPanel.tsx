import { useState } from 'react'
import { materials } from '../../data/materials'
import type {
  MaterialParameterKey,
  ParameterConflictGroup,
  ParameterEvidence,
  ParameterRecommendation,
} from '../../types/literature'
import { LiteratureReviewWorkflow } from './LiteratureReviewWorkflow'
import {
  formatParameterKey,
  formatParameterRecommendationStatus,
} from './literatureFormatting'

interface ParameterRecommendationPanelProps {
  conflictGroups: ParameterConflictGroup[]
  evidence: ParameterEvidence[]
  recommendations: ParameterRecommendation[]
  onChangeRecommendations: (recommendations: ParameterRecommendation[]) => void
}

export function ParameterRecommendationPanel({
  conflictGroups,
  evidence,
  recommendations,
  onChangeRecommendations,
}: ParameterRecommendationPanelProps) {
  const [draft, setDraft] = useState<ParameterRecommendation>(() =>
    createEmptyRecommendation(conflictGroups[0]),
  )

  function saveRecommendation(nextRecommendation = draft) {
    const exists = recommendations.some((item) => item.id === nextRecommendation.id)
    const updated = {
      ...nextRecommendation,
      updatedAt: new Date().toISOString(),
    }

    onChangeRecommendations(
      exists
        ? recommendations.map((item) =>
            item.id === updated.id ? updated : item,
          )
        : [updated, ...recommendations],
    )
    setDraft(createEmptyRecommendation(conflictGroups[0]))
  }

  function createFromConflictGroup(conflictGroup: ParameterConflictGroup) {
    const next = createEmptyRecommendation(conflictGroup)
    setDraft(next)
  }

  function changeRecommendationStatus(
    recommendation: ParameterRecommendation,
    status: ParameterRecommendation['status'],
  ) {
    saveRecommendation({ ...recommendation, status })
  }

  return (
    <section className="grid gap-4">
      <div className="rounded-lg border border-amber-900/40 bg-amber-950/15 p-4 text-sm leading-6 text-amber-100/90">
        推薦參數仍需人工確認；本批不會自動寫入 materials.ts。
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">從衝突群組建立推薦</h3>
        <div className="mt-3 grid gap-2">
          {conflictGroups.map((group) => (
            <button
              className="rounded-md border border-slate-800 bg-slate-900/45 p-3 text-left text-xs leading-5 text-slate-400 transition hover:border-cyan-700"
              key={group.id}
              onClick={() => createFromConflictGroup(group)}
              type="button"
            >
              <span className="font-medium text-slate-100">
                {getMaterialName(group.materialId)} ·{' '}
                {formatParameterKey(group.parameterKey)}
              </span>
              <span className="mt-1 block">{group.summary_zh}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">推薦參數編輯</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs font-medium text-slate-400">
            材料
            <select
              className="field-input mt-2"
              value={draft.materialId}
              onChange={(event) =>
                setDraft((current) => ({ ...current, materialId: event.target.value }))
              }
            >
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.displayName}
                </option>
              ))}
            </select>
          </label>
          <TextField
            label="參數 key"
            value={draft.parameterKey}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                parameterKey: value as MaterialParameterKey,
              }))
            }
          />
          <TextField
            label="推薦值"
            value={
              draft.recommendedValue === null ? '' : String(draft.recommendedValue)
            }
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                recommendedValue: value.trim() === '' ? null : parseValue(value),
              }))
            }
          />
          <TextField
            label="單位"
            value={draft.unit ?? ''}
            onChange={(value) =>
              setDraft((current) => ({ ...current, unit: value }))
            }
          />
          <TextField
            label="條件"
            value={draft.condition_zh ?? ''}
            onChange={(value) =>
              setDraft((current) => ({ ...current, condition_zh: value }))
            }
          />
          <TextField
            label="Evidence IDs"
            value={draft.basedOnEvidenceIds.join(', ')}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                basedOnEvidenceIds: value
                  .split(',')
                  .map((item) => item.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>
        <TextArea
          label="推薦理由"
          value={draft.rationale_zh}
          onChange={(value) =>
            setDraft((current) => ({ ...current, rationale_zh: value }))
          }
        />
        <TextArea
          label="限制"
          value={draft.limitation_zh ?? ''}
          onChange={(value) =>
            setDraft((current) => ({ ...current, limitation_zh: value }))
          }
        />
        <div className="mt-4">
          <div className="mb-2 text-xs font-medium text-slate-400">狀態</div>
          <LiteratureReviewWorkflow
            currentStatus={draft.status}
            mode="recommendation"
            onChangeStatus={(status) =>
              setDraft((current) => ({
                ...current,
                status: status as ParameterRecommendation['status'],
              }))
            }
          />
        </div>
        <button
          className="primary-button mt-4"
          onClick={() => saveRecommendation()}
          type="button"
        >
          儲存推薦
        </button>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">推薦參數清單</h3>
        <div className="mt-3 grid gap-2">
          {recommendations.length === 0 ? (
            <p className="text-sm text-slate-500">目前尚未建立推薦參數。</p>
          ) : (
            recommendations.map((recommendation) => (
              <article
                className="rounded-md border border-slate-800 bg-slate-900/45 p-3"
                key={recommendation.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">
                      {getMaterialName(recommendation.materialId)} ·{' '}
                      {formatParameterKey(recommendation.parameterKey)}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {recommendation.recommendedValue === null
                        ? '尚無建議值'
                        : `${recommendation.recommendedValue}${recommendation.unit ? ` ${recommendation.unit}` : ''}`}
                      {' · '}
                      {formatParameterRecommendationStatus(recommendation.status)}
                    </p>
                  </div>
                  <button
                    className="secondary-button"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        `${getMaterialName(recommendation.materialId)} ${formatParameterKey(recommendation.parameterKey)}: ${recommendation.rationale_zh}`,
                      )
                    }
                    type="button"
                  >
                    複製摘要
                  </button>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {recommendation.rationale_zh || '尚未填寫推薦理由。'}
                </p>
                <div className="mt-3">
                  <LiteratureReviewWorkflow
                    currentStatus={recommendation.status}
                    mode="recommendation"
                    onChangeStatus={(status) =>
                      changeRecommendationStatus(
                        recommendation,
                        status as ParameterRecommendation['status'],
                      )
                    }
                  />
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <h3 className="text-sm font-semibold text-slate-100">Evidence 快速索引</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          目前 evidence 數量：{evidence.length}。推薦參數只記錄 evidence IDs，不會複製全文或改寫材料資料庫。
        </p>
      </section>
    </section>
  )
}

function createEmptyRecommendation(
  conflictGroup?: ParameterConflictGroup,
): ParameterRecommendation {
  const now = new Date().toISOString()

  return {
    id: `recommendation-${Date.now()}`,
    materialId: conflictGroup?.materialId ?? 'wse2',
    parameterKey: conflictGroup?.parameterKey ?? 'custom',
    recommendedValue: conflictGroup?.recommendedValue ?? null,
    unit: conflictGroup?.recommendedUnit ?? '',
    status: 'draft',
    basedOnEvidenceIds: conflictGroup?.evidenceIds ?? [],
    rationale_zh: conflictGroup?.summary_zh ?? '',
    limitation_zh: '待查文獻；尚未人工審核。',
    condition_zh: '',
    createdAt: now,
    updatedAt: now,
  }
}

function getMaterialName(materialId: string) {
  return materials.find((material) => material.id === materialId)?.displayName ?? materialId
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
