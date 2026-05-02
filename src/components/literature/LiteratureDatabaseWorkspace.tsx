import { useMemo, useState } from 'react'
import { materials } from '../../data/materials'
import { parameterConflictGroups } from '../../data/parameterConflictGroups'
import { parameterEvidence } from '../../data/parameterEvidence'
import { literatureSources } from '../../data/literatureSources'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { InfoNotice } from '../common/InfoNotice'
import { ConflictGroupPanel } from './ConflictGroupPanel'
import { LiteratureDetailDrawer } from './LiteratureDetailDrawer'
import { LiteratureFilters, type LiteratureFilterState } from './LiteratureFilters'
import { LiteratureSourceList } from './LiteratureSourceList'
import { ParameterEvidenceTable } from './ParameterEvidenceTable'

type SelectedItem =
  | { type: 'source'; id: string }
  | { type: 'evidence'; id: string }
  | { type: 'conflict'; id: string }
  | null

const defaultFilters: LiteratureFilterState = {
  agreementStatus: 'all',
  materialId: 'all',
  parameterKey: 'all',
  reviewStatus: 'all',
  searchText: '',
  sourceType: 'all',
}

export function LiteratureDatabaseWorkspace() {
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null)
  const sourceTitles = useMemo(
    () =>
      Object.fromEntries(
        literatureSources.map((source) => [source.id, source.title]),
      ),
    [],
  )
  const filteredSources = useMemo(
    () =>
      literatureSources.filter((source) =>
        matchesSource(source, filters),
      ),
    [filters],
  )
  const filteredEvidence = useMemo(
    () =>
      parameterEvidence.filter((evidence) =>
        matchesEvidence(evidence, filters, sourceTitles),
      ),
    [filters, sourceTitles],
  )
  const filteredConflictGroups = useMemo(
    () =>
      parameterConflictGroups.filter((group) =>
        matchesConflictGroup(group, filters),
      ),
    [filters],
  )
  const selectedDetail = getSelectedDetail(selectedItem)

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
          候選來源 {literatureSources.length} · 參數證據 {parameterEvidence.length}
        </div>
      </header>

      <InfoNotice
        title="文獻候選資料"
        type="literature"
      >
        此區用於管理文獻候選資料與參數來源。候選資料不會自動寫入正式材料資料庫，必須經過人工審核。
      </InfoNotice>

      <LiteratureFilters filters={filters} onChangeFilters={setFilters} />

      <div className="grid min-h-0 min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 gap-4">
          <CollapsibleSection
            defaultOpen
            summary={`${filteredSources.length} 筆來源`}
            title="文獻來源"
          >
            <LiteratureSourceList
              selectedId={selectedItem?.type === 'source' ? selectedItem.id : null}
              sources={filteredSources}
              onSelectSource={(id) => setSelectedItem({ type: 'source', id })}
            />
          </CollapsibleSection>

          <CollapsibleSection
            defaultOpen
            summary={`${filteredEvidence.length} 筆證據`}
            title="參數證據"
          >
            <ParameterEvidenceTable
              evidence={filteredEvidence}
              selectedId={
                selectedItem?.type === 'evidence' ? selectedItem.id : null
              }
              sourceTitles={sourceTitles}
              onSelectEvidence={(id) =>
                setSelectedItem({ type: 'evidence', id })
              }
            />
          </CollapsibleSection>

          <CollapsibleSection
            defaultOpen={false}
            summary={`${filteredConflictGroups.length} 組整理`}
            title="衝突 / 共識整理"
          >
            <ConflictGroupPanel
              conflictGroups={filteredConflictGroups}
              evidence={parameterEvidence}
              selectedId={
                selectedItem?.type === 'conflict' ? selectedItem.id : null
              }
              onSelectConflict={(id) =>
                setSelectedItem({ type: 'conflict', id })
              }
            />
          </CollapsibleSection>
        </div>

        <LiteratureDetailDrawer
          selectedItem={selectedDetail}
          sources={literatureSources}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </section>
  )
}

function matchesSource(
  source: (typeof literatureSources)[number],
  filters: LiteratureFilterState,
) {
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
  evidence: (typeof parameterEvidence)[number],
  filters: LiteratureFilterState,
  sourceTitles: Record<string, string>,
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

  const source = literatureSources.find((item) => item.id === evidence.sourceId)

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

function matchesConflictGroup(
  group: (typeof parameterConflictGroups)[number],
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

function getSelectedDetail(selectedItem: SelectedItem) {
  if (!selectedItem) {
    return null
  }

  if (selectedItem.type === 'source') {
    const item = literatureSources.find((source) => source.id === selectedItem.id)
    return item ? { type: 'source' as const, item } : null
  }

  if (selectedItem.type === 'evidence') {
    const item = parameterEvidence.find(
      (evidence) => evidence.id === selectedItem.id,
    )
    return item ? { type: 'evidence' as const, item } : null
  }

  const item = parameterConflictGroups.find(
    (group) => group.id === selectedItem.id,
  )
  return item ? { type: 'conflict' as const, item } : null
}
