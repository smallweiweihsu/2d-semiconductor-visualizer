import type {
  LiteratureAgreementStatus,
  LiteratureReviewStatus,
  LiteratureSourceType,
  MaterialParameterKey,
  MaterialLiteratureTodo,
  ParameterConflictGroup,
  ParameterRecommendation,
} from '../../types/literature'

export function formatReviewStatus(status: LiteratureReviewStatus) {
  const labels: Record<LiteratureReviewStatus, string> = {
    candidate: '候選',
    reviewed: '已閱讀',
    verified: '已驗證',
    rejected: '不採用',
  }

  return labels[status]
}

export function formatAgreementStatus(status: LiteratureAgreementStatus) {
  const labels: Record<LiteratureAgreementStatus, string> = {
    supports: '支持',
    contradicts: '衝突',
    condition_dependent: '依條件而定',
    not_applicable: '不適用',
    unclear: '尚不明確',
  }

  return labels[status]
}

export function formatSourceType(type: LiteratureSourceType) {
  const labels: Record<LiteratureSourceType, string> = {
    journal_article: '期刊論文',
    conference_paper: '會議論文',
    thesis: '論文 / 學位論文',
    review_article: '綜述',
    datasheet: '資料表',
    book: '書籍',
    webpage: '網頁',
    unknown: '未知',
  }

  return labels[type]
}

export function formatParameterKey(key: MaterialParameterKey) {
  const labels: Record<MaterialParameterKey, string> = {
    workFunction_eV: '功函數',
    bandGap_eV: '能隙',
    electronAffinity_eV: '電子親和能',
    dielectricConstant: '介電常數',
    mobility_cm2Vs: '遷移率',
    resistivity_ohm_m: '電阻率',
    latticeConstant_A: '晶格常數',
    defaultThickness_nm: '預設厚度',
    breakdownField_MVcm: '崩潰電場',
    meltingPoint_C: '熔點',
    D0_m2s: 'D0',
    Ea_eV: 'Ea',
    oxidationRate_nm_per_s: '氧化速率',
    ramanProbeDepth_nm: 'Raman 探測深度',
    contactResistance_ohm: '接觸電阻',
    bandOffset_eV: '能帶偏移',
    custom: '自訂參數',
  }

  return labels[key]
}

export function formatRecommendationStatus(
  status: ParameterConflictGroup['recommendedStatus'],
) {
  const labels: Record<ParameterConflictGroup['recommendedStatus'], string> = {
    no_recommendation: '暫無建議值',
    condition_dependent: '依條件分類',
    needs_review: '需要審核',
    ready_to_use: '可候選使用',
  }

  return labels[status]
}

export function formatParameterRecommendationStatus(
  status: ParameterRecommendation['status'],
) {
  const labels: Record<ParameterRecommendation['status'], string> = {
    draft: '草稿',
    reviewed: '已檢閱',
    ready_to_promote: '可候選推廣',
    rejected: '不採用',
  }

  return labels[status]
}

export function formatTodoPriority(priority: MaterialLiteratureTodo['priority']) {
  const labels: Record<MaterialLiteratureTodo['priority'], string> = {
    high: '高',
    medium: '中',
    low: '低',
  }

  return labels[priority]
}

export function formatTodoStatus(status: MaterialLiteratureTodo['status']) {
  const labels: Record<MaterialLiteratureTodo['status'], string> = {
    todo: '待查',
    in_progress: '查找中',
    candidate_found: '已有候選',
    reviewed: '已檢閱',
    verified: '已驗證',
  }

  return labels[status]
}
