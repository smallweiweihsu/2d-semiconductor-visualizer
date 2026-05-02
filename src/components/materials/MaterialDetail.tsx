import type { ReactNode } from 'react'
import { parameterConflictGroups } from '../../data/parameterConflictGroups'
import { parameterEvidence } from '../../data/parameterEvidence'
import { materialLiteratureTodos } from '../../data/materialLiteratureTodos'
import { getMaterialCategoryDefinition } from '../../data/materialCategories'
import { literatureSources } from '../../data/literatureSources'
import { parameterRecommendations } from '../../data/parameterRecommendations'
import type { Material, MaterialParameterKey } from '../../types/material'
import { CollapsibleSection } from '../common/CollapsibleSection'
import {
  formatAgreementStatus,
  formatParameterKey,
  formatParameterRecommendationStatus,
  formatReviewStatus,
  formatTodoPriority,
  formatTodoStatus,
} from '../literature/literatureFormatting'
import { ParameterBadge } from './ParameterBadge'
import {
  formatParameterValue,
  getMaterialParameterStats,
  parameterLabels,
} from './materialStats'

interface MaterialDetailProps {
  material: Material
}

const parameterGroups: Array<{
  title: string
  keys: MaterialParameterKey[]
}> = [
  {
    title: '核心電子參數',
    keys: ['workFunction_eV', 'bandGap_eV', 'electronAffinity_eV', 'dielectricConstant'],
  },
  {
    title: '輸運與電性',
    keys: ['mobility_cm2Vs', 'resistivity_ohm_m', 'breakdownField_MVcm'],
  },
  {
    title: '結構與熱參數',
    keys: ['latticeConstant_A', 'defaultThickness_nm', 'meltingPoint_C'],
  },
]

export function MaterialDetail({ material }: MaterialDetailProps) {
  const category = getMaterialCategoryDefinition(material.category)
  const stats = getMaterialParameterStats(material)
  const relatedEvidence = parameterEvidence.filter((item) =>
    item.materialIds.includes(material.id),
  )
  const relatedConflictGroups = parameterConflictGroups.filter(
    (group) => group.materialId === material.id,
  )
  const relatedTodos = materialLiteratureTodos.filter(
    (todo) => todo.materialId === material.id,
  )
  const relatedRecommendations = parameterRecommendations.filter(
    (recommendation) => recommendation.materialId === material.id,
  )

  return (
    <section className="h-full min-h-[34rem] overflow-y-auto rounded-lg border border-slate-800/80 bg-slate-950/25 p-4 xl:min-h-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span
              className="h-5 w-5 shrink-0 rounded-full border border-white/20"
              style={{ backgroundColor: material.color }}
            />
            <div className="min-w-0">
              <h3 className="truncate text-2xl font-semibold text-slate-50">
                {material.displayName}
              </h3>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                {category ? (
                  <span
                    className={`rounded-full border px-2.5 py-1 font-medium ${category.accentClass}`}
                  >
                    {category.label_zh}
                  </span>
                ) : null}
                <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
                  ID：{material.id}
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {material.description_zh}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <StatPill label="已知" tone="known" value={stats.known} />
          <StatPill label="估計" tone="estimated" value={stats.estimated} />
          <StatPill label="缺少" tone="unknown" value={stats.unknown} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-slate-800/80 pt-4 lg:grid-cols-2">
        <CollapsibleSection
          defaultOpen={false}
          summary={`${material.notes_zh.length} 項`}
          title="材料註記"
        >
          <InfoList items={material.notes_zh} />
        </CollapsibleSection>
        <CollapsibleSection
          defaultOpen={false}
          summary={`${material.warnings_zh.length} 項`}
          title="風險與限制"
        >
          <InfoList items={material.warnings_zh} tone="warning" />
        </CollapsibleSection>
      </div>

      <div className="mt-4">
        <MaterialLiteratureSection
          todos={relatedTodos}
          evidence={relatedEvidence}
          conflictGroups={relatedConflictGroups}
          recommendations={relatedRecommendations}
        />
      </div>

      <div className="mt-4 grid gap-3">
        {parameterGroups.map((group) => (
          <ParameterGroup
            groupTitle={group.title}
            keys={group.keys}
            key={group.title}
            material={material}
          />
        ))}

        <section className="rounded-md border border-slate-800/80 bg-slate-900/35">
          <div className="border-b border-slate-800/80 px-4 py-3">
            <h4 className="text-sm font-medium text-slate-200">擴散參數</h4>
          </div>
          <div className="grid gap-4 p-4 text-sm text-slate-400 md:grid-cols-3">
            <div>
              <div className="text-xs text-slate-500">D0_m2s</div>
              <div className="mt-1">
                {formatParameterValue(material.diffusion.D0_m2s)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Ea_eV</div>
              <div className="mt-1">
                {formatParameterValue(material.diffusion.Ea_eV)}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500">資料狀態</div>
              <div className="mt-1">
                <ParameterBadge confidence={material.diffusion.confidence} />
              </div>
            </div>
          </div>
          <p className="border-t border-slate-800/80 px-4 py-3 text-xs leading-5 text-slate-500">
            {material.diffusion.notes}
          </p>
        </section>
      </div>
    </section>
  )
}

interface StatPillProps {
  label: string
  value: number
  tone: 'known' | 'estimated' | 'unknown'
}

function StatPill({ label, value, tone }: StatPillProps) {
  const toneClasses = {
    known: 'border-emerald-800 bg-emerald-950/25 text-emerald-100',
    estimated: 'border-amber-800 bg-amber-950/25 text-amber-100',
    unknown: 'border-rose-800 bg-rose-950/25 text-rose-100',
  }

  return (
    <span className={`rounded-full border px-3 py-1.5 ${toneClasses[tone]}`}>
      {label} {value}
    </span>
  )
}

interface ParameterGroupProps {
  groupTitle: string
  keys: MaterialParameterKey[]
  material: Material
}

function ParameterGroup({ groupTitle, keys, material }: ParameterGroupProps) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-800/80 bg-slate-900/35">
      <div className="border-b border-slate-800/80 px-4 py-3">
        <h4 className="text-sm font-medium text-slate-200">{groupTitle}</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-slate-950/70 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">參數</th>
              <th className="px-4 py-3 font-medium">數值</th>
              <th className="px-4 py-3 font-medium">單位</th>
              <th className="px-4 py-3 font-medium">信心標示</th>
              <th className="px-4 py-3 font-medium">註記</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((parameterKey) => {
              const parameter = material.parameters[parameterKey]

              return (
                <tr
                  className="border-t border-slate-800/70 align-top text-slate-300"
                  key={parameterKey}
                >
                  <td className="px-4 py-3 font-medium text-slate-100">
                    {parameterLabels[parameterKey]}
                  </td>
                  <td className="px-4 py-3">
                    {formatParameterValue(parameter)}
                  </td>
                  <td className="px-4 py-3 text-slate-400">
                    {parameter.unit ?? '無單位'}
                  </td>
                  <td className="px-4 py-3">
                    <ParameterBadge confidence={parameter.confidence} />
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs leading-5 text-slate-500">
                    {parameter.note ?? '無補充註記'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

interface InfoListProps {
  items: string[]
  tone?: 'default' | 'warning'
}

function InfoList({ items, tone = 'default' }: InfoListProps) {
  const bulletClass = tone === 'warning' ? 'bg-amber-300' : 'bg-slate-400'

  return (
    <section>
      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-500">
        {items.map((item) => (
          <li className="flex gap-2" key={item}>
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass}`} />
            <span className={tone === 'warning' ? 'text-amber-100/85' : undefined}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function MaterialLiteratureSection({
  todos,
  evidence,
  conflictGroups,
  recommendations,
}: {
  todos: typeof materialLiteratureTodos
  evidence: typeof parameterEvidence
  conflictGroups: typeof parameterConflictGroups
  recommendations: typeof parameterRecommendations
}) {
  const candidateCount = evidence.filter((item) =>
    getSourceStatus(item.sourceId) === 'candidate',
  ).length
  const reviewedCount = evidence.filter((item) =>
    getSourceStatus(item.sourceId) === 'reviewed',
  ).length
  const verifiedCount = evidence.filter((item) =>
    getSourceStatus(item.sourceId) === 'verified',
  ).length

  return (
    <CollapsibleSection
      defaultOpen={false}
      summary={`${todos.length} 待查 · ${evidence.length} 證據 · ${conflictGroups.length} 衝突 · ${recommendations.length} 推薦`}
      title="文獻來源"
    >
      {evidence.length === 0 &&
      conflictGroups.length === 0 &&
      todos.length === 0 &&
      recommendations.length === 0 ? (
        <p className="text-sm text-slate-500">目前尚無文獻候選資料。</p>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
              待查 {todos.length}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
              候選 {candidateCount}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
              已檢閱 {reviewedCount}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
              已驗證 {verifiedCount}
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-400">
              推薦 {recommendations.length}
            </span>
          </div>

          <CollapsibleSection
            defaultOpen={false}
            summary={`${todos.length} 項`}
            title="待查項目"
          >
            <div className="grid gap-2">
              {todos.length > 0 ? (
                todos.map((todo) => (
                  <CompactLiteratureRow key={todo.id}>
                    {formatParameterKey(todo.parameterKey)} · 優先{' '}
                    {formatTodoPriority(todo.priority)} · {formatTodoStatus(todo.status)}
                    <br />
                    {todo.reason_zh}
                  </CompactLiteratureRow>
                ))
              ) : (
                <p className="text-xs text-slate-500">目前沒有待查項目。</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            defaultOpen={false}
            summary={`${evidence.length} 筆`}
            title="參數證據"
          >
            <div className="grid gap-2">
              {evidence.length > 0 ? (
                evidence.map((item) => (
                  <CompactLiteratureRow key={item.id}>
                    {formatParameterKey(item.parameterKey)} ·{' '}
                    {item.value === null
                      ? '數值待補'
                      : `${item.value}${item.unit ? ` ${item.unit}` : ''}`}
                    {' · '}
                    {formatAgreementStatus(item.agreementStatus)} ·{' '}
                    {formatReviewStatus(getSourceStatus(item.sourceId) ?? 'candidate')}
                  </CompactLiteratureRow>
                ))
              ) : (
                <p className="text-xs text-slate-500">目前沒有參數證據。</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            defaultOpen={false}
            summary={`${conflictGroups.length} 組`}
            title="衝突 / 共識"
          >
            <div className="grid gap-2">
              {conflictGroups.length > 0 ? (
                conflictGroups.map((group) => (
                  <CompactLiteratureRow key={group.id}>
                    {group.summary_zh}
                  </CompactLiteratureRow>
                ))
              ) : (
                <p className="text-xs text-slate-500">目前沒有衝突整理。</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            defaultOpen={false}
            summary={`${recommendations.length} 筆`}
            title="推薦參數"
          >
            <div className="grid gap-2">
              {recommendations.length > 0 ? (
                recommendations.map((recommendation) => (
                  <CompactLiteratureRow key={recommendation.id}>
                    {formatParameterKey(recommendation.parameterKey)} ·{' '}
                    {recommendation.recommendedValue === null
                      ? '尚無建議值'
                      : `${recommendation.recommendedValue}${recommendation.unit ? ` ${recommendation.unit}` : ''}`}
                    {' · '}
                    {formatParameterRecommendationStatus(recommendation.status)}
                  </CompactLiteratureRow>
                ))
              ) : (
                <p className="text-xs text-slate-500">目前沒有推薦參數。</p>
              )}
            </div>
          </CollapsibleSection>

          <p className="text-xs leading-5 text-slate-500">
            文獻候選資料只用於來源追蹤與人工審核，不會自動改寫材料 notes 或正式參數。
          </p>
        </div>
      )}
    </CollapsibleSection>
  )
}

function CompactLiteratureRow({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/35 p-3 text-xs leading-5 text-slate-400">
      {children}
    </div>
  )
}

function getSourceStatus(sourceId: string) {
  return literatureSources.find((source) => source.id === sourceId)?.reviewStatus
}
