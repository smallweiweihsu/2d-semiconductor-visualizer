export type LiteratureReviewStatus =
  | 'candidate'
  | 'reviewed'
  | 'verified'
  | 'rejected'

export type LiteratureAgreementStatus =
  | 'supports'
  | 'contradicts'
  | 'condition_dependent'
  | 'not_applicable'
  | 'unclear'

export type LiteratureSourceType =
  | 'journal_article'
  | 'conference_paper'
  | 'thesis'
  | 'review_article'
  | 'datasheet'
  | 'book'
  | 'webpage'
  | 'unknown'

export type MaterialParameterKey =
  | 'workFunction_eV'
  | 'bandGap_eV'
  | 'electronAffinity_eV'
  | 'dielectricConstant'
  | 'mobility_cm2Vs'
  | 'resistivity_ohm_m'
  | 'latticeConstant_A'
  | 'defaultThickness_nm'
  | 'breakdownField_MVcm'
  | 'meltingPoint_C'
  | 'D0_m2s'
  | 'Ea_eV'
  | 'oxidationRate_nm_per_s'
  | 'ramanProbeDepth_nm'
  | 'contactResistance_ohm'
  | 'bandOffset_eV'
  | 'custom'

export interface LiteratureSource {
  id: string
  title: string
  authors?: string[]
  year?: number | null
  sourceType: LiteratureSourceType
  journal?: string
  doi?: string
  url?: string
  notes_zh?: string
  reviewStatus: LiteratureReviewStatus
  tags_zh?: string[]
}

export type LiteratureSourceInput = Omit<LiteratureSource, 'id'> & {
  id?: string
}

export interface ParameterEvidence {
  id: string
  sourceId: string
  materialIds: string[]
  parameterKey: MaterialParameterKey
  value: number | string | null
  unit?: string
  condition_zh?: string
  method_zh?: string
  agreementStatus: LiteratureAgreementStatus
  confidence: 'low' | 'medium' | 'high' | 'unknown'
  quoteOrSummary_zh?: string
  applicability_zh?: string
  warnings_zh?: string[]
}

export type ParameterEvidenceInput = Omit<ParameterEvidence, 'id'> & {
  id?: string
}

export interface ParameterConflictGroup {
  id: string
  materialId: string
  parameterKey: MaterialParameterKey
  evidenceIds: string[]
  summary_zh: string
  recommendedStatus:
    | 'no_recommendation'
    | 'condition_dependent'
    | 'needs_review'
    | 'ready_to_use'
  recommendedValue?: number | string | null
  recommendedUnit?: string
  warnings_zh?: string[]
}

export type ConflictGroupInput = Omit<ParameterConflictGroup, 'id'> & {
  id?: string
}

export interface ParameterRecommendation {
  id: string
  materialId: string
  parameterKey: MaterialParameterKey
  recommendedValue: number | string | null
  unit?: string
  status: 'draft' | 'reviewed' | 'ready_to_promote' | 'rejected'
  basedOnEvidenceIds: string[]
  rationale_zh: string
  limitation_zh?: string
  condition_zh?: string
  createdAt: string
  updatedAt: string
}

export interface MaterialLiteratureTodo {
  id: string
  materialId: string
  priority: 'high' | 'medium' | 'low'
  parameterKey: MaterialParameterKey
  reason_zh: string
  suggestedSearchTerms: string[]
  status: 'todo' | 'in_progress' | 'candidate_found' | 'reviewed' | 'verified'
  notes_zh?: string
}

export interface LiteratureDatabase {
  sources: LiteratureSource[]
  evidence: ParameterEvidence[]
  conflictGroups: ParameterConflictGroup[]
  recommendations: ParameterRecommendation[]
  todos: MaterialLiteratureTodo[]
}
