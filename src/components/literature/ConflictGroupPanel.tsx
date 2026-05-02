import { materials } from '../../data/materials'
import type { ParameterConflictGroup, ParameterEvidence } from '../../types/literature'
import {
  formatParameterKey,
  formatRecommendationStatus,
} from './literatureFormatting'

interface ConflictGroupPanelProps {
  conflictGroups: ParameterConflictGroup[]
  evidence: ParameterEvidence[]
  selectedId: string | null
  onSelectConflict: (conflictId: string) => void
}

export function ConflictGroupPanel({
  conflictGroups,
  evidence,
  selectedId,
  onSelectConflict,
}: ConflictGroupPanelProps) {
  if (conflictGroups.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 p-4 text-sm text-slate-500">
        目前沒有符合篩選條件的衝突 / 共識整理。
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {conflictGroups.map((group) => {
        const groupEvidence = evidence.filter((item) =>
          group.evidenceIds.includes(item.id),
        )
        const supports = groupEvidence.filter(
          (item) => item.agreementStatus === 'supports',
        ).length
        const contradicts = groupEvidence.filter(
          (item) => item.agreementStatus === 'contradicts',
        ).length
        const conditionDependent = groupEvidence.filter(
          (item) => item.agreementStatus === 'condition_dependent',
        ).length

        return (
          <button
            className={`rounded-md border p-4 text-left transition ${
              group.id === selectedId
                ? 'border-cyan-600 bg-cyan-950/30'
                : 'border-slate-800 bg-slate-950/35 hover:border-slate-700'
            }`}
            key={group.id}
            onClick={() => onSelectConflict(group.id)}
            type="button"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">
                  {getMaterialName(group.materialId)} ·{' '}
                  {formatParameterKey(group.parameterKey)}
                </h4>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {group.summary_zh}
                </p>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                {formatRecommendationStatus(group.recommendedStatus)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="rounded-full bg-slate-900 px-2 py-1">
                證據 {group.evidenceIds.length}
              </span>
              <span className="rounded-full bg-emerald-950/35 px-2 py-1 text-emerald-100">
                支持 {supports}
              </span>
              <span className="rounded-full bg-rose-950/35 px-2 py-1 text-rose-100">
                衝突 {contradicts}
              </span>
              <span className="rounded-full bg-amber-950/35 px-2 py-1 text-amber-100">
                條件差異 {conditionDependent}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

function getMaterialName(materialId: string) {
  return materials.find((material) => material.id === materialId)?.displayName ?? materialId
}
