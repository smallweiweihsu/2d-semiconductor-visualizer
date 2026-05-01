import type {
  ElectricalCurve,
  ElectricalResult,
  ElectricalRiskLevel,
  ElectricalScenario,
  ElectricalValidationResult,
} from '../types/electrical'

export const q_C = 1.602176634e-19
export const epsilon0_F_per_m = 8.8541878128e-12
export const kB_J_per_K = 1.380649e-23
export const kB_eV_per_K = 8.617333262e-5

const emptyIdVdCurve: ElectricalCurve = {
  id: 'id-vd',
  label_zh: 'Id-Vd',
  xLabel_zh: 'Vd (V)',
  yLabel_zh: 'Id (A)',
  points: [],
}

const emptyIdVgCurve: ElectricalCurve = {
  id: 'id-vg',
  label_zh: 'Id-Vg',
  xLabel_zh: 'Vg (V)',
  yLabel_zh: 'Id (A)',
  points: [],
}

function isPositiveNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function range(start: number, stop: number, step: number) {
  if (!Number.isFinite(start) || !Number.isFinite(stop) || !isPositiveNumber(Math.abs(step))) {
    return []
  }

  const direction = stop >= start ? 1 : -1
  const signedStep = Math.abs(step) * direction
  const values: number[] = []
  let current = start
  let guard = 0

  while (
    guard < 500 &&
    (direction > 0 ? current <= stop + 1e-12 : current >= stop - 1e-12)
  ) {
    values.push(Number(current.toFixed(10)))
    current += signedStep
    guard += 1
  }

  return values
}

// Parallel-plate gate oxide approximation. tox is converted from nm to meters.
// This ignores fringing fields, quantum capacitance, traps, and nonuniform gates.
export function calculateGateCapacitancePerArea(
  dielectricConstant: number | null,
  thickness_nm: number | null,
): number | null {
  if (!isPositiveNumber(dielectricConstant) || !isPositiveNumber(thickness_nm)) {
    return null
  }

  return (epsilon0_F_per_m * dielectricConstant) / (thickness_nm * 1e-9)
}

// Simple field-effect charge density. It treats Vg - Vth as an ideal overdrive.
// It does not include quantum capacitance, traps, hysteresis, or contact gating.
export function calculateInducedCarrierDensity(
  Cox_F_per_m2: number | null,
  Vg: number | null,
  Vth: number | null,
): number | null {
  if (!isPositiveNumber(Cox_F_per_m2) || !isFiniteNumber(Vg) || !isFiniteNumber(Vth)) {
    return null
  }

  return (Cox_F_per_m2 * Math.max(Vg - Vth, 0)) / q_C
}

// Drift resistance approximation: Rch = L / (q n mu W).
// L/W are converted from um to m, mobility from cm^2/Vs to m^2/Vs.
export function calculateChannelResistance({
  length_um,
  width_um,
  mobility_cm2Vs,
  carrierDensity_m2,
}: {
  length_um: number | null
  width_um: number | null
  mobility_cm2Vs: number | null
  carrierDensity_m2: number | null
}): number | null {
  if (
    !isPositiveNumber(length_um) ||
    !isPositiveNumber(width_um) ||
    !isPositiveNumber(mobility_cm2Vs) ||
    !isPositiveNumber(carrierDensity_m2)
  ) {
    return null
  }

  const length_m = length_um * 1e-6
  const width_m = width_um * 1e-6
  const mobility_m2Vs = mobility_cm2Vs * 1e-4
  const conductance = q_C * carrierDensity_m2 * mobility_m2Vs * (width_m / length_m)

  return conductance > 0 ? 1 / conductance : null
}

export function calculateTotalResistance(
  Rch: number | null,
  Rs: number | null,
  Rd: number | null,
): number | null {
  if (!isPositiveNumber(Rch) || !isFiniteNumber(Rs) || !isFiniteNumber(Rd)) {
    return null
  }

  return Rch + Math.max(Rs, 0) + Math.max(Rd, 0)
}

export function calculateOhmicCurrent(Vd: number, Rtotal: number | null) {
  if (!isPositiveNumber(Rtotal) || !Number.isFinite(Vd)) {
    return null
  }

  return Vd / Rtotal
}

export function calculateDielectricField(
  gateVoltage: number,
  dielectricThickness_nm: number | null,
): number | null {
  if (!isPositiveNumber(dielectricThickness_nm) || !Number.isFinite(gateVoltage)) {
    return null
  }

  const field_V_per_m = Math.abs(gateVoltage) / (dielectricThickness_nm * 1e-9)

  return field_V_per_m / 1e8
}

export function estimateBreakdownRisk(
  E_MVcm: number | null,
  materialBreakdownField_MVcm?: number | null,
): ElectricalRiskLevel {
  if (!isPositiveNumber(E_MVcm) || !isPositiveNumber(materialBreakdownField_MVcm)) {
    return 'unknown'
  }

  const ratio = E_MVcm / materialBreakdownField_MVcm

  if (ratio < 0.3) {
    return 'low'
  }

  if (ratio <= 0.7) {
    return 'medium'
  }

  return 'high'
}

export function estimateContactRisk(scenario: ElectricalScenario): ElectricalRiskLevel {
  const missingContactResistance =
    scenario.sourceContactResistance_ohm === null ||
    scenario.drainContactResistance_ohm === null

  if (scenario.contactModel === 'unknown') {
    return 'unknown'
  }

  if (missingContactResistance && scenario.contactModel === 'manual_contact_resistance') {
    return 'high'
  }

  if (scenario.contactModel === 'schottky_like') {
    return 'high'
  }

  if (scenario.contactModel === 'tunneling_assisted') {
    return 'medium'
  }

  if (
    (scenario.sourceContactResistance_ohm ?? 0) > 1e6 ||
    (scenario.drainContactResistance_ohm ?? 0) > 1e6
  ) {
    return 'high'
  }

  if (scenario.channelMaterialId === 'wse2' && scenario.contactModel === 'ideal_ohmic') {
    return 'medium'
  }

  return 'low'
}

export function estimateGateControlRisk(
  scenario: ElectricalScenario,
  Cox_F_per_m2: number | null,
): ElectricalRiskLevel {
  if (!scenario.gateLayerId || !scenario.gateDielectricLayerId) {
    return 'high'
  }

  if (!isPositiveNumber(scenario.dielectricConstant) || !isPositiveNumber(scenario.dielectricThickness_nm)) {
    return 'unknown'
  }

  if (scenario.dielectricThickness_nm > 100) {
    return 'high'
  }

  if (scenario.dielectricThickness_nm > 30 || (Cox_F_per_m2 !== null && Cox_F_per_m2 < 1e-3)) {
    return 'medium'
  }

  return 'low'
}

function calculateAtBias(
  scenario: ElectricalScenario,
  Vg: number,
  Vd: number,
) {
  const Cox = calculateGateCapacitancePerArea(
    scenario.dielectricConstant,
    scenario.dielectricThickness_nm,
  )
  const carrierDensity = calculateInducedCarrierDensity(
    Cox,
    Vg,
    scenario.thresholdVoltage_V ?? 0,
  )
  const Rch = calculateChannelResistance({
    length_um: scenario.channelLength_um,
    width_um: scenario.channelWidth_um,
    mobility_cm2Vs: scenario.mobility_cm2Vs,
    carrierDensity_m2: carrierDensity,
  })
  const idealContacts = scenario.contactModel === 'ideal_ohmic'
  const Rs = idealContacts ? 0 : scenario.sourceContactResistance_ohm
  const Rd = idealContacts ? 0 : scenario.drainContactResistance_ohm
  const Rtotal = calculateTotalResistance(Rch, Rs, Rd)
  const current = calculateOhmicCurrent(Vd, Rtotal)

  if (current === null) {
    const sign = Vd < 0 ? -1 : 1
    return sign * Math.max(scenario.offCurrentFloor_A, 0)
  }

  return current
}

function hasRequiredCurveInputs(scenario: ElectricalScenario) {
  const hasContacts =
    scenario.contactModel === 'ideal_ohmic' ||
    (isFiniteNumber(scenario.sourceContactResistance_ohm) &&
      isFiniteNumber(scenario.drainContactResistance_ohm))

  return (
    isPositiveNumber(scenario.dielectricThickness_nm) &&
    isPositiveNumber(scenario.dielectricConstant) &&
    isPositiveNumber(scenario.mobility_cm2Vs) &&
    isPositiveNumber(scenario.channelLength_um) &&
    isPositiveNumber(scenario.channelWidth_um) &&
    hasContacts &&
    isPositiveNumber(Math.abs(scenario.drainVoltageStep_V)) &&
    isPositiveNumber(Math.abs(scenario.gateVoltageStep_V))
  )
}

export function generateIdVdCurve(scenario: ElectricalScenario): ElectricalCurve {
  if (!hasRequiredCurveInputs(scenario)) {
    return emptyIdVdCurve
  }

  const points = range(
    scenario.drainVoltageStart_V,
    scenario.drainVoltageStop_V,
    scenario.drainVoltageStep_V,
  ).map((Vd) => ({
    x: Vd,
    y: calculateAtBias(scenario, scenario.gateVoltageStop_V, Vd),
  }))

  return {
    ...emptyIdVdCurve,
    points,
  }
}

export function generateIdVgCurve(scenario: ElectricalScenario): ElectricalCurve {
  if (!hasRequiredCurveInputs(scenario)) {
    return emptyIdVgCurve
  }

  const points = range(
    scenario.gateVoltageStart_V,
    scenario.gateVoltageStop_V,
    scenario.gateVoltageStep_V,
  ).map((Vg) => ({
    x: Vg,
    y: calculateAtBias(scenario, Vg, scenario.drainVoltageStop_V),
  }))

  return {
    ...emptyIdVgCurve,
    points,
  }
}

export function validateElectricalScenario(
  scenario: ElectricalScenario,
): ElectricalValidationResult {
  const errors_zh: string[] = []
  const warnings_zh: string[] = []
  const info_zh: string[] = []

  if (!scenario.channelLayerId && !scenario.channelMaterialId) {
    errors_zh.push('尚未選擇半導體通道層。')
  }

  if (!isPositiveNumber(scenario.dielectricThickness_nm)) {
    errors_zh.push('介電層厚度缺失，無法計算閘極電容。')
  }

  if (!isPositiveNumber(scenario.dielectricConstant)) {
    errors_zh.push('介電常數缺失，無法計算閘極電容。')
  }

  if (!isPositiveNumber(scenario.mobility_cm2Vs)) {
    errors_zh.push('遷移率缺失，無法估算通道電阻。')
  }

  if (!isPositiveNumber(scenario.channelLength_um) || !isPositiveNumber(scenario.channelWidth_um)) {
    errors_zh.push('通道長度與寬度必須大於 0。')
  }

  if (
    !isPositiveNumber(Math.abs(scenario.drainVoltageStep_V)) ||
    !isPositiveNumber(Math.abs(scenario.gateVoltageStep_V))
  ) {
    errors_zh.push('Vd / Vg 掃描步階不可為 0。')
  }

  if (
    scenario.contactModel === 'manual_contact_resistance' &&
    (scenario.sourceContactResistance_ohm === null ||
      scenario.drainContactResistance_ohm === null)
  ) {
    warnings_zh.push('接觸電阻缺失，I-V 只能作為理想化趨勢。')
  }

  if (scenario.thresholdVoltage_V === null) {
    warnings_zh.push('閾值電壓缺失，目前會以 0 V 作近似。')
  }

  if (scenario.breakdownField_MVcm === null || scenario.breakdownField_MVcm === undefined) {
    warnings_zh.push('介電層崩潰電場缺失，漏電與崩潰風險需校準。')
  }

  if (scenario.channelMaterialId === 'wse2') {
    warnings_zh.push('Pd/WSe₂ 或其他金屬/WSe₂ 接觸可能受 Fermi-level pinning、界面態與退火影響。')
  }

  if ((scenario.dielectricThickness_nm ?? 0) > 100) {
    warnings_zh.push('介電層很厚，gate control 可能較弱。')
  }

  if ((scenario.dielectricThickness_nm ?? Number.POSITIVE_INFINITY) < 5) {
    warnings_zh.push('介電層很薄，可能有漏電或崩潰風險。')
  }

  info_zh.push('關態電流下限是人為設定，不代表真實漏電。')
  info_zh.push('低溫電性尚未建模，不能直接解釋低溫輸運。')

  return {
    valid: errors_zh.length === 0,
    errors_zh,
    warnings_zh,
    info_zh,
  }
}

export function calculateElectricalScenario(
  scenario: ElectricalScenario,
): ElectricalResult {
  const validation = validateElectricalScenario(scenario)
  const Cox_F_per_m2 = calculateGateCapacitancePerArea(
    scenario.dielectricConstant,
    scenario.dielectricThickness_nm,
  )
  const carrierDensity_m2 = calculateInducedCarrierDensity(
    Cox_F_per_m2,
    scenario.gateVoltageStop_V,
    scenario.thresholdVoltage_V ?? 0,
  )
  const carrierDensity_cm2 =
    carrierDensity_m2 === null ? null : carrierDensity_m2 / 1e4
  const channelResistance_ohm = calculateChannelResistance({
    length_um: scenario.channelLength_um,
    width_um: scenario.channelWidth_um,
    mobility_cm2Vs: scenario.mobility_cm2Vs,
    carrierDensity_m2,
  })
  const idealContacts = scenario.contactModel === 'ideal_ohmic'
  const totalResistance_ohm = calculateTotalResistance(
    channelResistance_ohm,
    idealContacts ? 0 : scenario.sourceContactResistance_ohm,
    idealContacts ? 0 : scenario.drainContactResistance_ohm,
  )
  const dielectricField_MV_per_cm = calculateDielectricField(
    scenario.gateVoltageStop_V,
    scenario.dielectricThickness_nm,
  )
  const breakdownRisk = estimateBreakdownRisk(
    dielectricField_MV_per_cm,
    scenario.breakdownField_MVcm,
  )
  const contactRisk = estimateContactRisk(scenario)
  const gateControlRisk = estimateGateControlRisk(scenario, Cox_F_per_m2)
  const warnings_zh = [
    ...validation.errors_zh,
    ...validation.warnings_zh,
    ...validation.info_zh,
  ]

  if (contactRisk === 'high') {
    warnings_zh.push('接觸風險偏高，請避免把模型曲線視為真實量測 I-V。')
  }

  if (breakdownRisk === 'high') {
    warnings_zh.push('估計介電層電場接近或超過崩潰風險區間。')
  }

  return {
    Cox_F_per_m2,
    carrierDensity_m2,
    carrierDensity_cm2,
    channelResistance_ohm,
    totalResistance_ohm,
    dielectricField_MV_per_cm,
    breakdownRisk,
    contactRisk,
    gateControlRisk,
    idVdCurve: generateIdVdCurve(scenario),
    idVgCurve: generateIdVgCurve(scenario),
    warnings_zh: [...new Set(warnings_zh)],
    assumptions_zh: [
      '閘極電容使用平行板電容近似，未包含邊緣電場、量子電容或陷阱電容。',
      '通道電阻使用漂移電導近似，未包含速度飽和、局部加熱或二維接觸注入限制。',
      'I-V / Id-Vg 曲線使用 Ohmic-like 趨勢模型，不代表真實量測資料。',
      '金屬/二維半導體接觸可能由 pinning、界面態、缺陷、穿隧與污染主導。',
    ],
  }
}
