import type { ReactNode } from 'react'
import { materials } from '../../data/materials'
import type {
  LiteratureAgreementStatus,
  LiteratureReviewStatus,
  LiteratureSourceType,
  MaterialParameterKey,
} from '../../types/literature'
import {
  formatAgreementStatus,
  formatParameterKey,
  formatReviewStatus,
  formatSourceType,
} from './literatureFormatting'

export interface LiteratureFilterState {
  agreementStatus: 'all' | LiteratureAgreementStatus
  materialId: 'all' | string
  parameterKey: 'all' | MaterialParameterKey
  reviewStatus: 'all' | LiteratureReviewStatus
  searchText: string
  sourceType: 'all' | LiteratureSourceType
}

interface LiteratureFiltersProps {
  filters: LiteratureFilterState
  onChangeFilters: (filters: LiteratureFilterState) => void
}

const reviewStatuses: LiteratureReviewStatus[] = [
  'candidate',
  'reviewed',
  'verified',
  'rejected',
]
const agreementStatuses: LiteratureAgreementStatus[] = [
  'supports',
  'contradicts',
  'condition_dependent',
  'not_applicable',
  'unclear',
]
const sourceTypes: LiteratureSourceType[] = [
  'journal_article',
  'conference_paper',
  'thesis',
  'review_article',
  'datasheet',
  'book',
  'webpage',
  'unknown',
]
const parameterKeys: MaterialParameterKey[] = [
  'dielectricConstant',
  'contactResistance_ohm',
  'oxidationRate_nm_per_s',
  'ramanProbeDepth_nm',
  'D0_m2s',
  'Ea_eV',
  'custom',
]

export function LiteratureFilters({
  filters,
  onChangeFilters,
}: LiteratureFiltersProps) {
  function updateFilter<K extends keyof LiteratureFilterState>(
    key: K,
    value: LiteratureFilterState[K],
  ) {
    onChangeFilters({ ...filters, [key]: value })
  }

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        <label className="text-xs font-medium text-slate-400">
          搜尋
          <input
            className="field-input mt-2"
            placeholder="材料、參數、標題"
            value={filters.searchText}
            onChange={(event) => updateFilter('searchText', event.target.value)}
          />
        </label>
        <SelectFilter
          label="材料"
          value={filters.materialId}
          onChange={(value) => updateFilter('materialId', value)}
        >
          <option value="all">全部</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.displayName}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter
          label="參數"
          value={filters.parameterKey}
          onChange={(value) =>
            updateFilter('parameterKey', value as LiteratureFilterState['parameterKey'])
          }
        >
          <option value="all">全部</option>
          {parameterKeys.map((key) => (
            <option key={key} value={key}>
              {formatParameterKey(key)}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter
          label="審核狀態"
          value={filters.reviewStatus}
          onChange={(value) =>
            updateFilter('reviewStatus', value as LiteratureFilterState['reviewStatus'])
          }
        >
          <option value="all">全部</option>
          {reviewStatuses.map((status) => (
            <option key={status} value={status}>
              {formatReviewStatus(status)}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter
          label="支持 / 衝突"
          value={filters.agreementStatus}
          onChange={(value) =>
            updateFilter(
              'agreementStatus',
              value as LiteratureFilterState['agreementStatus'],
            )
          }
        >
          <option value="all">全部</option>
          {agreementStatuses.map((status) => (
            <option key={status} value={status}>
              {formatAgreementStatus(status)}
            </option>
          ))}
        </SelectFilter>
        <SelectFilter
          label="來源類型"
          value={filters.sourceType}
          onChange={(value) =>
            updateFilter('sourceType', value as LiteratureFilterState['sourceType'])
          }
        >
          <option value="all">全部</option>
          {sourceTypes.map((type) => (
            <option key={type} value={type}>
              {formatSourceType(type)}
            </option>
          ))}
        </SelectFilter>
      </div>
    </section>
  )
}

function SelectFilter({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="text-xs font-medium text-slate-400">
      {label}
      <select
        className="field-input mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  )
}
