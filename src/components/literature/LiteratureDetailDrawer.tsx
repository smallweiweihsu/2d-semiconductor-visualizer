import { materials } from '../../data/materials'
import type {
  LiteratureSource,
  ParameterConflictGroup,
  ParameterEvidence,
} from '../../types/literature'
import {
  formatAgreementStatus,
  formatParameterKey,
  formatRecommendationStatus,
  formatSourceType,
} from './literatureFormatting'
import { LiteratureStatusBadge } from './LiteratureStatusBadge'

type SelectedLiteratureItem =
  | { type: 'source'; item: LiteratureSource }
  | { type: 'evidence'; item: ParameterEvidence }
  | { type: 'conflict'; item: ParameterConflictGroup }
  | null

interface LiteratureDetailDrawerProps {
  selectedItem: SelectedLiteratureItem
  sources: LiteratureSource[]
  onClose: () => void
}

export function LiteratureDetailDrawer({
  selectedItem,
  sources,
  onClose,
}: LiteratureDetailDrawerProps) {
  if (!selectedItem) {
    return (
      <aside className="rounded-lg border border-slate-800 bg-slate-950/35 p-4 text-sm text-slate-500">
        選擇文獻來源、參數證據或衝突整理後，這裡會顯示詳細資訊。
      </aside>
    )
  }

  return (
    <aside className="rounded-lg border border-slate-800 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-100">詳細資訊</h3>
        <button
          className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-slate-600"
          onClick={onClose}
          type="button"
        >
          關閉
        </button>
      </div>

      <div className="mt-4">
        {selectedItem.type === 'source' ? (
          <SourceDetail source={selectedItem.item} />
        ) : null}
        {selectedItem.type === 'evidence' ? (
          <EvidenceDetail evidence={selectedItem.item} sources={sources} />
        ) : null}
        {selectedItem.type === 'conflict' ? (
          <ConflictDetail conflict={selectedItem.item} />
        ) : null}
      </div>
    </aside>
  )
}

function SourceDetail({ source }: { source: LiteratureSource }) {
  return (
    <div className="grid gap-3 text-sm text-slate-300">
      <h4 className="text-base font-semibold text-slate-50">{source.title}</h4>
      <LiteratureStatusBadge reviewStatus={source.reviewStatus} />
      <DetailRow label="類型" value={formatSourceType(source.sourceType)} />
      <DetailRow label="年份" value={String(source.year ?? '待補')} />
      <DetailRow label="DOI" value={source.doi || '待補'} />
      <DetailRow label="URL" value={source.url || '待補'} />
      <DetailRow label="備註" value={source.notes_zh || '無'} />
    </div>
  )
}

function EvidenceDetail({
  evidence,
  sources,
}: {
  evidence: ParameterEvidence
  sources: LiteratureSource[]
}) {
  const source = sources.find((item) => item.id === evidence.sourceId)

  return (
    <div className="grid gap-3 text-sm text-slate-300">
      <h4 className="text-base font-semibold text-slate-50">
        {formatParameterKey(evidence.parameterKey)}
      </h4>
      <DetailRow
        label="材料"
        value={evidence.materialIds.map(getMaterialName).join('、')}
      />
      <DetailRow
        label="數值"
        value={
          evidence.value === null
            ? '待補'
            : `${evidence.value}${evidence.unit ? ` ${evidence.unit}` : ''}`
        }
      />
      <DetailRow label="條件" value={evidence.condition_zh || '待補'} />
      <DetailRow label="方法" value={evidence.method_zh || '待補'} />
      <DetailRow label="來源" value={source?.title ?? evidence.sourceId} />
      <DetailRow
        label="支持 / 衝突"
        value={formatAgreementStatus(evidence.agreementStatus)}
      />
      <DetailRow label="適用性" value={evidence.applicability_zh || '待補'} />
      <DetailList label="警告" items={evidence.warnings_zh ?? []} />
    </div>
  )
}

function ConflictDetail({ conflict }: { conflict: ParameterConflictGroup }) {
  return (
    <div className="grid gap-3 text-sm text-slate-300">
      <h4 className="text-base font-semibold text-slate-50">
        {getMaterialName(conflict.materialId)} ·{' '}
        {formatParameterKey(conflict.parameterKey)}
      </h4>
      <DetailRow label="整理摘要" value={conflict.summary_zh} />
      <DetailRow
        label="建議狀態"
        value={formatRecommendationStatus(conflict.recommendedStatus)}
      />
      <DetailRow
        label="建議值"
        value={
          conflict.recommendedValue === undefined
            ? '目前沒有建議值'
            : `${conflict.recommendedValue}${conflict.recommendedUnit ? ` ${conflict.recommendedUnit}` : ''}`
        }
      />
      <DetailList label="警告" items={conflict.warnings_zh ?? []} />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 leading-6 text-slate-300">{value}</div>
    </div>
  )
}

function DetailList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-amber-100/85">
        {items.length > 0 ? (
          items.map((item) => <li key={item}>- {item}</li>)
        ) : (
          <li className="text-slate-500">無</li>
        )}
      </ul>
    </div>
  )
}

function getMaterialName(materialId: string) {
  return materials.find((material) => material.id === materialId)?.displayName ?? materialId
}
