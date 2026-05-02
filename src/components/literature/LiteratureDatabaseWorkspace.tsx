import { useMemo, useState } from 'react'
import { literatureSources as seedSources } from '../../data/literatureSources'
import { materialLiteratureTodos } from '../../data/materialLiteratureTodos'
import { materials } from '../../data/materials'
import { parameterConflictGroups as seedConflictGroups } from '../../data/parameterConflictGroups'
import { parameterEvidence as seedEvidence } from '../../data/parameterEvidence'
import { parameterRecommendations } from '../../data/parameterRecommendations'
import type {
  LiteratureDatabase,
  LiteratureSource,
  MaterialLiteratureTodo,
  ParameterConflictGroup,
  ParameterEvidence,
  ParameterRecommendation,
} from '../../types/literature'
import { InfoNotice } from '../common/InfoNotice'
import { ConflictGroupEditor } from './ConflictGroupEditor'
import { ConflictGroupPanel } from './ConflictGroupPanel'
import { LiteratureDetailDrawer } from './LiteratureDetailDrawer'
import { LiteratureFilters, type LiteratureFilterState } from './LiteratureFilters'
import { LiteratureImportExportPanel } from './LiteratureImportExportPanel'
import { LiteratureSourceEditor } from './LiteratureSourceEditor'
import { LiteratureSourceList } from './LiteratureSourceList'
import { MaterialLiteratureTodoPanel } from './MaterialLiteratureTodoPanel'
import { ParameterEvidenceEditor } from './ParameterEvidenceEditor'
import { ParameterEvidenceTable } from './ParameterEvidenceTable'
import { ParameterRecommendationPanel } from './ParameterRecommendationPanel'

type LiteratureSection =
  | 'todos'
  | 'sources'
  | 'evidence'
  | 'conflicts'
  | 'recommendations'
  | 'import_export'

type SelectedItem =
  | { type: 'source'; id: string }
  | { type: 'evidence'; id: string }
  | { type: 'conflict'; id: string }
  | null

const sections: Array<{ id: LiteratureSection; label: string }> = [
  { id: 'todos', label: '待查清單' },
  { id: 'sources', label: '文獻來源' },
  { id: 'evidence', label: '參數證據' },
  { id: 'conflicts', label: '衝突 / 共識' },
  { id: 'recommendations', label: '推薦參數' },
  { id: 'import_export', label: '匯入 / 匯出' },
]

const defaultFilters: LiteratureFilterState = {
  agreementStatus: 'all',
  materialId: 'all',
  parameterKey: 'all',
  reviewStatus: 'all',
  searchText: '',
  sourceType: 'all',
}

export function LiteratureDatabaseWorkspace() {
  const [activeSection, setActiveSection] =
    useState<LiteratureSection>(getInitialLiteratureSection)
  const [sources, setSources] = useState<LiteratureSource[]>(seedSources)
  const [evidence, setEvidence] = useState<ParameterEvidence[]>(seedEvidence)
  const [conflictGroups, setConflictGroups] =
    useState<ParameterConflictGroup[]>(seedConflictGroups)
  const [recommendations, setRecommendations] = useState<
    ParameterRecommendation[]
  >(parameterRecommendations)
  const [todos, setTodos] =
    useState<MaterialLiteratureTodo[]>(materialLiteratureTodos)
  const [filters, setFilters] = useState(defaultFilters)
  const [sourceKindFilter, setSourceKindFilter] =
    useState<'all' | 'real' | 'placeholder'>('all')
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const [evidenceSeed, setEvidenceSeed] = useState<{
    materialId?: string
    parameterKey?: ParameterEvidence['parameterKey']
  }>({})

  const database: LiteratureDatabase = {
    sources,
    evidence,
    conflictGroups,
    recommendations,
    todos,
  }
  const sourceTitles = useMemo(
    () => Object.fromEntries(sources.map((source) => [source.id, source.title])),
    [sources],
  )
  const filteredSources = useMemo(
    () => sources.filter((source) => matchesSource(source, filters)),
    [filters, sources],
  )
  const filteredEvidence = useMemo(
    () =>
      evidence.filter((item) =>
        matchesEvidence(item, filters, sources, sourceTitles, sourceKindFilter),
      ),
    [evidence, filters, sourceKindFilter, sourceTitles, sources],
  )
  const filteredConflictGroups = useMemo(
    () =>
      conflictGroups.filter((group) => matchesConflictGroup(group, filters)),
    [conflictGroups, filters],
  )
  const selectedDetail = getSelectedDetail(
    selectedItem,
    sources,
    evidence,
    conflictGroups,
  )

  function saveSource(source: LiteratureSource) {
    setSources((current) => upsertById(current, source))
    setSelectedItem({ type: 'source', id: source.id })
  }

  function saveEvidence(nextEvidence: ParameterEvidence) {
    setEvidence((current) => upsertById(current, nextEvidence))
    setSelectedItem({ type: 'evidence', id: nextEvidence.id })
  }

  function saveConflictGroup(conflictGroup: ParameterConflictGroup) {
    setConflictGroups((current) => upsertById(current, conflictGroup))
    setSelectedItem({ type: 'conflict', id: conflictGroup.id })
  }

  function createEvidenceFromTodo(todo: MaterialLiteratureTodo) {
    setEvidenceSeed({
      materialId: todo.materialId,
      parameterKey: todo.parameterKey,
    })
    setTodos((current) =>
      current.map((item) =>
        item.id === todo.id ? { ...item, status: 'in_progress' } : item,
      ),
    )
    setActiveSection('evidence')
  }

  function importDatabase(nextDatabase: LiteratureDatabase) {
    setSources(nextDatabase.sources)
    setEvidence(nextDatabase.evidence)
    setConflictGroups(nextDatabase.conflictGroups)
    setRecommendations(nextDatabase.recommendations ?? [])
    setTodos(nextDatabase.todos ?? [])
    setSelectedItem(null)
  }

  return (
    <section className="flex min-h-[calc(100vh-13rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">
            文獻資料庫與參數來源
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            管理材料參數、製程參數與模型假設的文獻候選來源，並標記不同文獻之間的支持、衝突、條件差異與適用性。
          </p>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          待查 {todos.length} · 來源 {sources.length} · 證據 {evidence.length}
        </div>
      </header>

      <InfoNotice title="文獻候選資料" type="literature">
        此區用於管理文獻候選資料與參數來源。候選資料不會自動寫入正式材料資料庫，必須經過人工審核。
      </InfoNotice>

      <SeedSummaryCard
        evidence={evidence}
        sources={sources}
      />

      <nav className="flex gap-2 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/35 p-2">
        {sections.map((section) => (
          <button
            className={`shrink-0 rounded-md px-3 py-2 text-sm transition ${
              activeSection === section.id
                ? 'bg-cyan-950/55 text-cyan-100'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </nav>

      {activeSection !== 'todos' && activeSection !== 'recommendations' && activeSection !== 'import_export' ? (
        <LiteratureFilters filters={filters} onChangeFilters={setFilters} />
      ) : null}

      {activeSection === 'todos' ? (
        <MaterialLiteratureTodoPanel
          evidence={evidence}
          todos={todos}
          onChangeTodos={setTodos}
          onCreateEvidenceFromTodo={createEvidenceFromTodo}
        />
      ) : null}

      {activeSection === 'sources' ? (
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="grid gap-4">
            <LiteratureSourceList
              selectedId={
                selectedItem?.type === 'source' ? selectedItem.id : null
              }
              sources={filteredSources}
              onSelectSource={(id) => setSelectedItem({ type: 'source', id })}
            />
          </div>
          <LiteratureSourceEditor
            source={
              selectedItem?.type === 'source'
                ? sources.find((source) => source.id === selectedItem.id)
                : null
            }
            onSaveSource={saveSource}
          />
        </div>
      ) : null}

      {activeSection === 'evidence' ? (
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_460px]">
          <div className="grid min-w-0 gap-3">
            <SourceKindFilter
              value={sourceKindFilter}
              onChange={setSourceKindFilter}
            />
            <ParameterEvidenceTable
              evidence={filteredEvidence}
              selectedId={
                selectedItem?.type === 'evidence' ? selectedItem.id : null
              }
              sourceTitles={sourceTitles}
              onSelectEvidence={(id) => setSelectedItem({ type: 'evidence', id })}
            />
          </div>
          <ParameterEvidenceEditor
            evidence={
              selectedItem?.type === 'evidence'
                ? evidence.find((item) => item.id === selectedItem.id)
                : null
            }
            initialMaterialId={evidenceSeed.materialId}
            initialParameterKey={evidenceSeed.parameterKey}
            sources={sources}
            onSaveEvidence={saveEvidence}
          />
        </div>
      ) : null}

      {activeSection === 'conflicts' ? (
        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_460px]">
          <ConflictGroupPanel
            conflictGroups={filteredConflictGroups}
            evidence={evidence}
            selectedId={
              selectedItem?.type === 'conflict' ? selectedItem.id : null
            }
            onSelectConflict={(id) => setSelectedItem({ type: 'conflict', id })}
          />
          <ConflictGroupEditor
            conflictGroup={
              selectedItem?.type === 'conflict'
                ? conflictGroups.find((group) => group.id === selectedItem.id)
                : null
            }
            evidence={evidence}
            onSaveConflictGroup={saveConflictGroup}
          />
        </div>
      ) : null}

      {activeSection === 'recommendations' ? (
        <ParameterRecommendationPanel
          conflictGroups={conflictGroups}
          evidence={evidence}
          recommendations={recommendations}
          onChangeRecommendations={setRecommendations}
        />
      ) : null}

      {activeSection === 'import_export' ? (
        <LiteratureImportExportPanel
          database={database}
          onImportDatabase={importDatabase}
        />
      ) : null}

      {activeSection !== 'todos' && activeSection !== 'import_export' ? (
        <LiteratureDetailDrawer
          selectedItem={selectedDetail}
          sources={sources}
          onClose={() => setSelectedItem(null)}
        />
      ) : null}
    </section>
  )
}

function getInitialLiteratureSection(): LiteratureSection {
  const section = new URLSearchParams(window.location.search).get(
    'literatureSection',
  )

  return sections.some((item) => item.id === section)
    ? (section as LiteratureSection)
    : 'todos'
}

function upsertById<T extends { id: string }>(items: T[], item: T) {
  return items.some((current) => current.id === item.id)
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items]
}

function matchesSource(source: LiteratureSource, filters: LiteratureFilterState) {
  if (filters.reviewStatus !== 'all' && source.reviewStatus !== filters.reviewStatus) {
    return false
  }

  if (filters.sourceType !== 'all' && source.sourceType !== filters.sourceType) {
    return false
  }

  return matchesSearch(
    [source.title, source.notes_zh, source.doi, ...(source.tags_zh ?? [])],
    filters.searchText,
  )
}

function matchesEvidence(
  evidence: ParameterEvidence,
  filters: LiteratureFilterState,
  sources: LiteratureSource[],
  sourceTitles: Record<string, string>,
  sourceKindFilter: 'all' | 'real' | 'placeholder',
) {
  if (filters.materialId !== 'all' && !evidence.materialIds.includes(filters.materialId)) {
    return false
  }

  if (filters.parameterKey !== 'all' && evidence.parameterKey !== filters.parameterKey) {
    return false
  }

  if (
    filters.agreementStatus !== 'all' &&
    evidence.agreementStatus !== filters.agreementStatus
  ) {
    return false
  }

  const source = sources.find((item) => item.id === evidence.sourceId)

  if (sourceKindFilter === 'real' && (!source || isPlaceholderSource(source))) {
    return false
  }

  if (sourceKindFilter === 'placeholder' && source && !isPlaceholderSource(source)) {
    return false
  }

  if (filters.reviewStatus !== 'all' && source?.reviewStatus !== filters.reviewStatus) {
    return false
  }

  if (filters.sourceType !== 'all' && source?.sourceType !== filters.sourceType) {
    return false
  }

  return matchesSearch(
    [
      sourceTitles[evidence.sourceId],
      evidence.parameterKey,
      evidence.condition_zh,
      evidence.method_zh,
      evidence.quoteOrSummary_zh,
      evidence.applicability_zh,
      ...evidence.materialIds.map(getMaterialName),
    ],
    filters.searchText,
  )
}

function SeedSummaryCard({
  evidence,
  sources,
}: {
  evidence: ParameterEvidence[]
  sources: LiteratureSource[]
}) {
  const realSourceCount = sources.filter((source) => !isPlaceholderSource(source)).length
  const placeholderSourceCount = sources.length - realSourceCount
  const candidateEvidenceCount = evidence.filter(
    (item) => getEvidenceSource(item, sources)?.reviewStatus === 'candidate',
  ).length
  const reviewedCount = sources.filter((source) => source.reviewStatus === 'reviewed').length
  const verifiedCount = sources.filter((source) => source.reviewStatus === 'verified').length

  return (
    <section className="rounded-lg border border-cyan-900/50 bg-cyan-950/15 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-cyan-100">
            第一批文獻種子資料
          </h3>
          <p className="mt-2 text-xs leading-5 text-cyan-100/75">
            本批資料仍以 candidate 為主，尚未自動寫入正式材料資料庫。
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <SummaryPill label="真實來源" value={realSourceCount} />
          <SummaryPill label="placeholder" value={placeholderSourceCount} />
          <SummaryPill label="候選 evidence" value={candidateEvidenceCount} />
          <SummaryPill label="reviewed" value={reviewedCount} />
          <SummaryPill label="verified" value={verifiedCount} />
        </div>
      </div>
    </section>
  )
}

function SourceKindFilter({
  value,
  onChange,
}: {
  value: 'all' | 'real' | 'placeholder'
  onChange: (value: 'all' | 'real' | 'placeholder') => void
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-slate-800 bg-slate-950/35 p-3 text-xs">
      <button
        className={filterButtonClass(value === 'all')}
        onClick={() => onChange('all')}
        type="button"
      >
        全部來源
      </button>
      <button
        className={filterButtonClass(value === 'real')}
        onClick={() => onChange('real')}
        type="button"
      >
        只看真實來源
      </button>
      <button
        className={filterButtonClass(value === 'placeholder')}
        onClick={() => onChange('placeholder')}
        type="button"
      >
        只看 placeholder
      </button>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-cyan-800/70 bg-slate-950/40 px-2.5 py-1 text-cyan-100">
      {label} {value}
    </span>
  )
}

function filterButtonClass(active: boolean) {
  return `rounded-md border px-2.5 py-1.5 transition ${
    active
      ? 'border-cyan-700 bg-cyan-950/50 text-cyan-100'
      : 'border-slate-700 bg-slate-950/40 text-slate-300 hover:border-slate-600'
  }`
}

function getEvidenceSource(
  evidence: ParameterEvidence,
  sources: LiteratureSource[],
) {
  return sources.find((source) => source.id === evidence.sourceId)
}

function isPlaceholderSource(source: LiteratureSource) {
  return source.title.startsWith('待補') || source.notes_zh?.includes('占位')
}

function matchesConflictGroup(
  group: ParameterConflictGroup,
  filters: LiteratureFilterState,
) {
  if (filters.materialId !== 'all' && group.materialId !== filters.materialId) {
    return false
  }

  if (filters.parameterKey !== 'all' && group.parameterKey !== filters.parameterKey) {
    return false
  }

  return matchesSearch(
    [group.summary_zh, getMaterialName(group.materialId), group.parameterKey],
    filters.searchText,
  )
}

function matchesSearch(values: Array<string | undefined>, searchText: string) {
  const normalizedSearch = searchText.trim().toLowerCase()

  if (!normalizedSearch) {
    return true
  }

  return values.some((value) => value?.toLowerCase().includes(normalizedSearch))
}

function getMaterialName(materialId: string) {
  return materials.find((material) => material.id === materialId)?.displayName ?? materialId
}

function getSelectedDetail(
  selectedItem: SelectedItem,
  sources: LiteratureSource[],
  evidence: ParameterEvidence[],
  conflictGroups: ParameterConflictGroup[],
) {
  if (!selectedItem) {
    return null
  }

  if (selectedItem.type === 'source') {
    const item = sources.find((source) => source.id === selectedItem.id)
    return item ? { type: 'source' as const, item } : null
  }

  if (selectedItem.type === 'evidence') {
    const item = evidence.find((candidate) => candidate.id === selectedItem.id)
    return item ? { type: 'evidence' as const, item } : null
  }

  const item = conflictGroups.find((group) => group.id === selectedItem.id)
  return item ? { type: 'conflict' as const, item } : null
}
