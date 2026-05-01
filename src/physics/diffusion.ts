import type {
  DiffusionDimensionality,
  DiffusionResult,
  DiffusionRiskLevel,
  DiffusionScenario,
  DiffusionValidationResult,
} from '../types/diffusion'

export const kB_eV_per_K = 8.617333262e-5

export function celsiusToKelvin(temp_C: number): number {
  return temp_C + 273.15
}

export function calculateArrheniusDiffusionCoefficient(
  D0_m2s: number | null,
  Ea_eV: number | null,
  temperature_C: number | null,
) {
  if (
    D0_m2s === null ||
    Ea_eV === null ||
    temperature_C === null ||
    !Number.isFinite(D0_m2s) ||
    !Number.isFinite(Ea_eV) ||
    !Number.isFinite(temperature_C) ||
    D0_m2s <= 0 ||
    Ea_eV < 0 ||
    temperature_C <= -273.15
  ) {
    return null
  }

  const temperature_K = celsiusToKelvin(temperature_C)

  // Arrhenius diffusion coefficient using Ea in eV and kB in eV/K.
  // This assumes one effective activation energy and ignores interface chemistry,
  // grain-scale paths, defects, deposition damage, and chemical reactions.
  return D0_m2s * Math.exp(-Ea_eV / (kB_eV_per_K * temperature_K))
}

export function applyDiffusionCorrectionFactors(
  D_m2s: number | null,
  interfaceBarrierFactor: number,
  grainBoundaryMultiplier: number,
  defectMultiplier: number,
) {
  if (
    D_m2s === null ||
    !Number.isFinite(D_m2s) ||
    !Number.isFinite(interfaceBarrierFactor) ||
    !Number.isFinite(grainBoundaryMultiplier) ||
    !Number.isFinite(defectMultiplier) ||
    D_m2s < 0 ||
    grainBoundaryMultiplier < 0 ||
    defectMultiplier < 0
  ) {
    return null
  }

  const safeBarrier = Math.max(interfaceBarrierFactor, 1e-12)

  return (D_m2s * grainBoundaryMultiplier * defectMultiplier) / safeBarrier
}

export function calculateDiffusionLength(
  effectiveD_m2s: number | null,
  time_s: number | null,
  dimensionality: DiffusionDimensionality,
) {
  if (
    effectiveD_m2s === null ||
    time_s === null ||
    !Number.isFinite(effectiveD_m2s) ||
    !Number.isFinite(time_s) ||
    effectiveD_m2s < 0 ||
    time_s <= 0
  ) {
    return null
  }

  // Fick-like characteristic length. This is a simplified dimensional trend,
  // not a boundary-condition-complete process simulation.
  const dimensionalFactor =
    dimensionality === 'three_d' ? 6 : dimensionality === 'two_d' ? 4 : 2

  return Math.sqrt(dimensionalFactor * effectiveD_m2s * time_s)
}

export function generateGaussianProfile(
  effectiveD_m2s: number | null,
  time_s: number | null,
  maxDepth_nm: number,
  pointCount: number,
) {
  if (
    effectiveD_m2s === null ||
    time_s === null ||
    !Number.isFinite(effectiveD_m2s) ||
    !Number.isFinite(time_s) ||
    !Number.isFinite(maxDepth_nm) ||
    effectiveD_m2s <= 0 ||
    time_s <= 0 ||
    maxDepth_nm <= 0 ||
    pointCount < 2
  ) {
    return []
  }

  const maxDepth_m = maxDepth_nm * 1e-9

  return Array.from({ length: pointCount }, (_, index) => {
    const fraction = index / (pointCount - 1)
    const depth_m = maxDepth_m * fraction
    const concentration = Math.exp(
      -(depth_m * depth_m) / (4 * effectiveD_m2s * time_s),
    )

    return {
      depth_nm: maxDepth_nm * fraction,
      normalizedConcentration: concentration,
    }
  })
}

export function calculateRiskLevel(
  affectedDepth_nm: number | null,
  targetLayerThickness_nm?: number | null,
): DiffusionRiskLevel {
  if (affectedDepth_nm === null || !Number.isFinite(affectedDepth_nm)) {
    return 'unknown'
  }

  if (
    targetLayerThickness_nm &&
    targetLayerThickness_nm > 0 &&
    affectedDepth_nm / targetLayerThickness_nm > 0.5
  ) {
    return 'high'
  }

  if (affectedDepth_nm < 1) {
    return 'low'
  }

  if (affectedDepth_nm <= 5) {
    return 'medium'
  }

  return 'high'
}

export function validateDiffusionScenario(
  scenario: DiffusionScenario,
): DiffusionValidationResult {
  const errors_zh: string[] = []
  const warnings_zh: string[] = []
  const info_zh: string[] = []

  if (!scenario.hostMaterialId) {
    errors_zh.push('尚未選擇 host material。')
  }

  if (scenario.D0_m2s === null || !Number.isFinite(scenario.D0_m2s)) {
    errors_zh.push('D0 尚未填入，無法進行定量擴散估算。')
  }

  if (scenario.Ea_eV === null || !Number.isFinite(scenario.Ea_eV)) {
    errors_zh.push('Ea 尚未填入，無法進行定量擴散估算。')
  }

  if (scenario.temperature_C === null || !Number.isFinite(scenario.temperature_C)) {
    errors_zh.push('退火溫度尚未填入。')
  } else if (scenario.temperature_C <= -273.15) {
    errors_zh.push('退火溫度不可低於絕對零度。')
  } else if (scenario.temperature_C >= 300) {
    warnings_zh.push('高溫退火可能增加金屬 / 氧化層界面混合風險。')
  }

  if (scenario.time_s === null || !Number.isFinite(scenario.time_s)) {
    errors_zh.push('退火時間尚未填入。')
  } else if (scenario.time_s <= 0) {
    errors_zh.push('退火時間必須大於 0。')
  } else if (scenario.time_s >= 3600) {
    warnings_zh.push('長時間退火可能放大慢速擴散或缺陷輔助擴散影響。')
  }

  if (!scenario.targetLayerId) {
    info_zh.push('尚未選擇目標材料層，因此無法比較受影響深度與層厚。')
  }

  if (scenario.confidence === 'unknown') {
    warnings_zh.push('此情境的 D0 / Ea 信心等級為未知，結果不可視為定量預測。')
  } else if (scenario.confidence === 'estimated') {
    warnings_zh.push('此情境使用估計參數，結果只能作為趨勢參考。')
  }

  if (scenario.grainBoundaryMultiplier > 100 || scenario.defectMultiplier > 100) {
    warnings_zh.push('晶界或缺陷倍率非常大，結果可能被修正因子主導。')
  }

  if (scenario.interfaceBarrierFactor > 0 && scenario.interfaceBarrierFactor < 0.1) {
    warnings_zh.push('界面障礙因子過小會大幅放大有效擴散，請確認設定。')
  }

  if (scenario.diffusingSpecies.toLowerCase() === 'in') {
    info_zh.push('In 可作為候選緩衝金屬，但是否降低 Sb₂O₃ 介面衝擊需要文獻與實驗驗證。')
  }

  info_zh.push('金屬沉積造成的初始混入不等同於熱擴散，需分開解讀。')

  return {
    valid: errors_zh.length === 0,
    errors_zh,
    warnings_zh,
    info_zh,
  }
}

export function calculateDiffusionScenario(
  scenario: DiffusionScenario,
  targetLayerThickness_nm?: number | null,
): DiffusionResult {
  const validation = validateDiffusionScenario(scenario)
  const temperature_K =
    scenario.temperature_C === null || !Number.isFinite(scenario.temperature_C)
      ? null
      : celsiusToKelvin(scenario.temperature_C)
  const D_m2s = calculateArrheniusDiffusionCoefficient(
    scenario.D0_m2s,
    scenario.Ea_eV,
    scenario.temperature_C,
  )
  const effectiveD_m2s = applyDiffusionCorrectionFactors(
    D_m2s,
    scenario.interfaceBarrierFactor,
    scenario.grainBoundaryMultiplier,
    scenario.defectMultiplier,
  )
  const diffusionLength_m = calculateDiffusionLength(
    effectiveD_m2s,
    scenario.time_s,
    scenario.dimensionality,
  )
  const diffusionLength_nm =
    diffusionLength_m === null ? null : diffusionLength_m * 1e9
  const affectedDepth_nm =
    diffusionLength_nm === null
      ? null
      : diffusionLength_nm + Math.max(0, scenario.initialMixingDepth_nm)
  const affectedDepthToLayerThicknessRatio =
    affectedDepth_nm !== null && targetLayerThickness_nm && targetLayerThickness_nm > 0
      ? affectedDepth_nm / targetLayerThickness_nm
      : null
  const riskLevel = calculateRiskLevel(affectedDepth_nm, targetLayerThickness_nm)
  const maxDepth_nm = Math.max(
    targetLayerThickness_nm ?? 0,
    affectedDepth_nm ? affectedDepth_nm * 3 : 20,
    20,
  )

  return {
    temperature_K,
    D_m2s,
    effectiveD_m2s,
    diffusionLength_m,
    diffusionLength_nm,
    affectedDepth_nm,
    affectedDepthToLayerThicknessRatio,
    riskLevel,
    profile: generateGaussianProfile(effectiveD_m2s, scenario.time_s, maxDepth_nm, 80),
    warnings_zh: [...validation.errors_zh, ...validation.warnings_zh, ...validation.info_zh],
    assumptions_zh: [
      '使用 Arrhenius 擴散係數 D(T) = D0 exp(-Ea / kBT)。',
      '使用 Fick-like 特徵長度估算擴散距離，未套用完整邊界條件。',
      '界面障礙因子 > 1 會降低有效擴散；晶界與缺陷倍率 > 1 會提高有效擴散。',
      '初始混入深度用於近似沉積造成的界面混合，需與熱擴散分開解讀。',
      '風險分級只是輔助判讀，不代表真實實驗結果。',
    ],
  }
}
