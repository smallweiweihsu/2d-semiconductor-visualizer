import type {
  OxidationResult,
  OxidationRiskLevel,
  OxidationScenario,
  OxidationValidationResult,
  RamanVisibilityLevel,
} from '../types/oxidation'

function isPositiveNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// ---------------------------------------------------------------------------
// 氧化成長律
//
// 1. 線性律：x = rate · t。適用反應限制的初期氧化或缺乏動力學資料時的趨勢估算。
// 2. Deal-Grove 線性-拋物線律：x² + A·x = B·(t+τ)
//    解析解：x(t) = (A/2)·[√(1 + 4B(t+τ)/A²) − 1]
//    短時間 → 線性（B/A 速率），長時間 → 拋物線（擴散限制）。
//    參考：B. E. Deal & A. S. Grove, "General Relationship for the Thermal
//    Oxidation of Silicon", J. Appl. Phys. 36, 3770–3778 (1965),
//    DOI: 10.1063/1.1713945。
// 3. Cabrera-Mott 反對數律（低溫薄膜、自限性）：1/x = a − b·ln(t/t₀)
//    適用金屬（如 Sb）常溫自然氧化形成的數 nm 自限氧化層。
//    參考：N. Cabrera & N. F. Mott, "Theory of the oxidation of metals",
//    Rep. Prog. Phys. 12, 163–184 (1949), DOI: 10.1088/0034-4885/12/1/308。
//
// nonuniformityFactor 仍為使用者判讀用修正因子，不屬於任何嚴格速率律。
// ---------------------------------------------------------------------------

/** Deal-Grove 線性-拋物線律厚度 (nm)。 */
export function calculateDealGroveThickness(
  A_nm: number | null,
  B_nm2_per_s: number | null,
  time_s: number | null,
  tau_s: number | null,
): number | null {
  const tau = tau_s ?? 0

  if (
    !isPositiveNumber(A_nm) ||
    !isPositiveNumber(B_nm2_per_s) ||
    !isPositiveNumber(time_s) ||
    !Number.isFinite(tau) ||
    tau < 0
  ) {
    return null
  }

  return (
    (A_nm / 2) *
    (Math.sqrt(1 + (4 * B_nm2_per_s * (time_s + tau)) / (A_nm * A_nm)) - 1)
  )
}

/** Cabrera-Mott 反對數律厚度 (nm)：1/x = a − b·ln(t/t₀)，並套用自限厚度上限。 */
export function calculateCabreraMottThickness(
  a_inv_nm: number | null,
  b_inv_nm: number | null,
  time_s: number | null,
  t0_s: number | null,
  limitThickness_nm: number | null,
): number | null {
  const t0 = t0_s ?? 1

  if (
    !isPositiveNumber(a_inv_nm) ||
    !isPositiveNumber(b_inv_nm) ||
    !isPositiveNumber(time_s) ||
    !isPositiveNumber(t0)
  ) {
    return null
  }

  const inverseThickness = a_inv_nm - b_inv_nm * Math.log(time_s / t0)

  let thickness_nm: number

  if (inverseThickness <= 0) {
    // 反對數律已超出適用範圍，取自限厚度（若有），否則無法估算。
    if (!isPositiveNumber(limitThickness_nm)) {
      return null
    }

    thickness_nm = limitThickness_nm
  } else {
    thickness_nm = 1 / inverseThickness
  }

  if (isPositiveNumber(limitThickness_nm)) {
    return Math.min(thickness_nm, limitThickness_nm)
  }

  return thickness_nm
}

export function calculateOxidizedThickness(
  scenario: OxidationScenario,
): number | null {
  const nonuniformityFactor = scenario.nonuniformityFactor
  const processTime = scenario.processTime_s
  const growthLaw = scenario.growthLaw ?? 'linear'

  if (!isPositiveNumber(nonuniformityFactor)) {
    return null
  }

  let baseThickness: number | null

  if (growthLaw === 'deal_grove') {
    baseThickness = calculateDealGroveThickness(
      scenario.dealGroveA_nm ?? null,
      scenario.dealGroveB_nm2_per_s ?? null,
      processTime,
      scenario.dealGroveTau_s ?? null,
    )
  } else if (growthLaw === 'cabrera_mott') {
    baseThickness = calculateCabreraMottThickness(
      scenario.cabreraMottA_inv_nm ?? null,
      scenario.cabreraMottB_inv_nm ?? null,
      processTime,
      scenario.cabreraMottT0_s ?? null,
      scenario.cabreraMottLimitThickness_nm ?? null,
    )
  } else {
    const oxidationRate = scenario.oxidationRate_nm_per_s

    if (!isPositiveNumber(oxidationRate) || !isPositiveNumber(processTime)) {
      return null
    }

    baseThickness = oxidationRate * processTime
  }

  if (baseThickness === null) {
    return null
  }

  return baseThickness * nonuniformityFactor
}

export function calculateRemainingThickness(
  initialThickness_nm: number | null,
  oxidizedThickness_nm: number | null,
): number | null {
  const initialThickness = initialThickness_nm

  if (!isPositiveNumber(initialThickness) || oxidizedThickness_nm === null) {
    return null
  }

  return Math.max(initialThickness - oxidizedThickness_nm, 0)
}

export function calculateOxidationFraction(
  initialThickness_nm: number | null,
  oxidizedThickness_nm: number | null,
): number | null {
  const initialThickness = initialThickness_nm

  if (!isPositiveNumber(initialThickness) || oxidizedThickness_nm === null) {
    return null
  }

  return clamp(oxidizedThickness_nm / initialThickness, 0, 1)
}

// Raman visibility is a heuristic. It estimates whether residual material may
// still contribute signal; it does not calculate Raman intensity or peak shape.
export function estimateRamanVisibility(
  scenario: OxidationScenario,
  result: Pick<
    OxidationResult,
    'estimatedRemainingThickness_nm' | 'remainingFraction'
  >,
): RamanVisibilityLevel {
  const remainingThickness = result.estimatedRemainingThickness_nm
  const remainingFraction = result.remainingFraction

  if (remainingThickness === null || remainingFraction === null) {
    return 'unknown'
  }

  if (scenario.nonuniformityFactor >= 1.8 && remainingFraction > 0) {
    return remainingFraction <= 0.05 ? 'weak_possible' : 'likely_visible'
  }

  if (remainingFraction <= 0.05) {
    return 'unlikely_visible'
  }

  if (remainingFraction <= 0.25) {
    return 'weak_possible'
  }

  const ramanProbeDepth = scenario.ramanProbeDepth_nm

  if (!isPositiveNumber(ramanProbeDepth)) {
    return 'weak_possible'
  }

  return remainingThickness <= ramanProbeDepth
    ? 'likely_visible'
    : 'weak_possible'
}

// Damage risk intentionally combines only broad process hints. It is not a
// defect-density model and cannot diagnose real plasma or thermal damage.
export function estimateDamageRisk(
  scenario: OxidationScenario,
): OxidationRiskLevel {
  const time = scenario.processTime_s ?? 0
  const power = scenario.power_W ?? 0
  const temperature = scenario.temperature_C ?? 25

  if (scenario.method === 'o2_rie' || scenario.method === 'plasma_oxidation') {
    if (power >= 50 || time >= 120 || scenario.damageFactor >= 2) {
      return 'high'
    }

    return power > 0 || time > 0 ? 'medium' : 'unknown'
  }

  if (scenario.method === 'uv_ozone') {
    return time >= 1800 || scenario.damageFactor >= 2 ? 'medium' : 'low'
  }

  if (scenario.method === 'thermal_oxidation') {
    if (temperature >= 300 || time >= 3600) {
      return 'high'
    }

    return temperature >= 150 ? 'medium' : 'low'
  }

  if (scenario.method === 'ambient_exposure') {
    return time >= 86400 ? 'medium' : 'low'
  }

  return 'unknown'
}

// Nonuniformity is inferred from process class and a user multiplier. Real
// spatial variation would need AFM, Raman mapping, XPS, or microscopy.
export function estimateNonuniformityRisk(
  scenario: OxidationScenario,
): OxidationRiskLevel {
  if (!isPositiveNumber(scenario.nonuniformityFactor)) {
    return 'unknown'
  }

  if (scenario.nonuniformityFactor >= 2) {
    return 'high'
  }

  if (
    scenario.nonuniformityFactor >= 1.4 ||
    scenario.method === 'o2_rie' ||
    scenario.method === 'plasma_oxidation'
  ) {
    return 'medium'
  }

  return 'low'
}

export function generateRamanExplanationRanking(
  scenario: OxidationScenario,
  result: Pick<
    OxidationResult,
    'estimatedRemainingThickness_nm' | 'remainingFraction' | 'ramanVisibility'
  >,
): string[] {
  const explanations = [
    '表面只氧化，底下仍有 WSe₂。',
    '氧化不完全，仍有殘留 WSe₂。',
    '氧化不均勻，局部區域仍保留 WSe₂。',
    'Raman 雷射仍可探測到下層 WSe₂。',
    '氧化產物 Raman 訊號較弱或峰位不明顯。',
    'WSe₂ / 氧化產物 / 基板訊號可能重疊。',
    '材料層數或厚度不均造成局部 Raman 差異。',
    'RIE 可能造成缺陷而非單純完全氧化。',
  ]

  if (scenario.method === 'o2_rie' || scenario.method === 'plasma_oxidation') {
    explanations.unshift('O₂ RIE / plasma 可能同時造成氧化、缺陷與蝕刻。')
  }

  if (
    result.ramanVisibility === 'likely_visible' ||
    result.ramanVisibility === 'weak_possible'
  ) {
    explanations.unshift('Raman 仍看到 WSe₂ 不代表完全沒有氧化。')
  }

  if (
    result.estimatedRemainingThickness_nm === 0 ||
    result.remainingFraction === 0
  ) {
    explanations.push('Raman 看不到 WSe₂ 也不代表已完整轉化為單一化學計量氧化物。')
  }

  return [...new Set(explanations)]
}

export function validateOxidationScenario(
  scenario: OxidationScenario,
): OxidationValidationResult {
  const errors_zh: string[] = []
  const warnings_zh: string[] = []
  const info_zh: string[] = []

  if (!scenario.targetMaterialId) {
    errors_zh.push('尚未選擇氧化目標材料。')
  }

  if (scenario.oxidationRate_nm_per_s !== null && !isPositiveNumber(scenario.processTime_s)) {
    errors_zh.push('已填入氧化速率時，製程時間必須大於 0。')
  }

  if (
    !isPositiveNumber(scenario.initialThickness_nm) &&
    !isPositiveNumber(scenario.initialLayerCount)
  ) {
    errors_zh.push('需要初始厚度或層數，才能判斷氧化比例。')
  }

  const numericFields = [
    ['製程時間', scenario.processTime_s],
    ['溫度', scenario.temperature_C],
    ['功率', scenario.power_W],
    ['氧氣濃度', scenario.oxygenConcentration_percent],
    ['濕度', scenario.humidity_percent],
    ['初始厚度', scenario.initialThickness_nm],
    ['氧化速率', scenario.oxidationRate_nm_per_s],
    ['Raman 探測深度', scenario.ramanProbeDepth_nm],
    ['雷射穿透深度', scenario.laserPenetrationDepth_nm],
  ] as const

  numericFields.forEach(([label, value]) => {
    if (typeof value === 'number' && value < 0) {
      errors_zh.push(`${label}不可為負值。`)
    }
  })

  const growthLaw = scenario.growthLaw ?? 'linear'

  if (growthLaw === 'linear' && scenario.oxidationRate_nm_per_s === null) {
    warnings_zh.push('缺少氧化速率，無法定量估算氧化厚度。')
  }

  if (
    growthLaw === 'deal_grove' &&
    (!isPositiveNumber(scenario.dealGroveA_nm ?? null) ||
      !isPositiveNumber(scenario.dealGroveB_nm2_per_s ?? null))
  ) {
    warnings_zh.push(
      'Deal-Grove 模型缺少 A 或 B 常數，無法估算厚度；A、B 需由該材料系統的氧化實驗擬合（Deal & Grove 1965 為 Si/SiO₂ 系統）。',
    )
  }

  if (
    growthLaw === 'cabrera_mott' &&
    (!isPositiveNumber(scenario.cabreraMottA_inv_nm ?? null) ||
      !isPositiveNumber(scenario.cabreraMottB_inv_nm ?? null))
  ) {
    warnings_zh.push(
      'Cabrera-Mott 反對數律缺少 a 或 b 參數，無法估算厚度；參數需由薄氧化層厚度-時間實驗擬合（Cabrera & Mott 1949）。',
    )
  }

  if (growthLaw === 'deal_grove') {
    info_zh.push(
      'Deal-Grove 律假設氧化劑經氧化層擴散後在界面反應；二維材料逐層氧化與金屬薄膜氧化可能偏離此假設，僅作趨勢判讀。',
    )
  }

  if (growthLaw === 'cabrera_mott') {
    info_zh.push(
      'Cabrera-Mott 律適用低溫薄膜（數 nm）自限性氧化，常用於金屬（如 Sb）常溫自然氧化；長時間或高溫不適用。',
    )
  }

  if (scenario.ramanProbeDepth_nm === null) {
    warnings_zh.push('缺少 Raman 探測深度，Raman 可見性只能定性判斷。')
  }

  if (scenario.method === 'o2_rie' && (scenario.power_W ?? 0) >= 30) {
    warnings_zh.push('O₂ RIE 功率偏高時可能同時造成氧化、缺陷與蝕刻。')
  }

  if ((scenario.temperature_C ?? 0) >= 300) {
    warnings_zh.push('高溫氧化可能造成材料退化、界面反應或非均勻氧化。')
  }

  if (scenario.confidence === 'unknown') {
    warnings_zh.push('此情境信心等級為未知，結果不可視為定量預測。')
  }

  if (!scenario.targetLayerId) {
    info_zh.push('尚未選擇目標材料層，因此無法直接比較氧化厚度與材料層厚度。')
  }

  info_zh.push('此結果應作為定性 / 半定量輔助判讀，不可取代 Raman、AFM、XPS 或製程校準。')

  return {
    valid: errors_zh.length === 0,
    errors_zh,
    warnings_zh,
    info_zh,
  }
}

export function calculateOxidationScenario(
  scenario: OxidationScenario,
): OxidationResult {
  const validation = validateOxidationScenario(scenario)
  const estimatedOxidizedThickness_nm = calculateOxidizedThickness(scenario)
  const estimatedRemainingThickness_nm = calculateRemainingThickness(
    scenario.initialThickness_nm,
    estimatedOxidizedThickness_nm,
  )
  const oxidationFraction = calculateOxidationFraction(
    scenario.initialThickness_nm,
    estimatedOxidizedThickness_nm,
  )
  const remainingFraction =
    oxidationFraction === null ? null : clamp(1 - oxidationFraction, 0, 1)
  const partialResult = {
    estimatedRemainingThickness_nm,
    remainingFraction,
  }
  const ramanVisibility = estimateRamanVisibility(scenario, partialResult)
  const damageRisk = estimateDamageRisk(scenario)
  const nonuniformityRisk = estimateNonuniformityRisk(scenario)

  const warnings_zh = [
    ...validation.errors_zh,
    ...validation.warnings_zh,
    ...validation.info_zh,
  ]

  if (scenario.targetMaterialId === 'sb-bulk' || scenario.productMaterialId === 'sb2o3') {
    warnings_zh.push('Sb 表面氧化層厚度與化學態需 AFM/XPS 或製程校準確認。')
  }

  return {
    estimatedOxidizedThickness_nm,
    estimatedRemainingThickness_nm,
    oxidationFraction,
    remainingFraction,
    ramanVisibility,
    damageRisk,
    nonuniformityRisk,
    explanations_zh: generateRamanExplanationRanking(scenario, {
      estimatedRemainingThickness_nm,
      remainingFraction,
      ramanVisibility,
    }),
    warnings_zh: [...new Set(warnings_zh)],
    assumptions_zh: [
      (scenario.growthLaw ?? 'linear') === 'deal_grove'
        ? '氧化厚度使用 Deal-Grove 線性-拋物線律 x²+Ax=B(t+τ)（Deal & Grove 1965, J. Appl. Phys. 36, 3770），A、B 需由實驗擬合。'
        : (scenario.growthLaw ?? 'linear') === 'cabrera_mott'
          ? '氧化厚度使用 Cabrera-Mott 反對數律 1/x = a − b·ln(t/t₀)（Cabrera & Mott 1949, Rep. Prog. Phys. 12, 163），適用低溫自限性薄氧化層。'
          : '氧化厚度以線性律（氧化速率 × 時間）做簡化估算。',
      'nonuniformity factor 是定性修正因子，不是嚴格反應動力學。',
      'Raman 可見性是基於殘留厚度與探測深度的簡化判斷，不代表 Raman 強度。',
      '此模型尚未處理真實化學計量、缺陷態、蝕刻、表面粗糙度或界面反應。',
    ],
  }
}
