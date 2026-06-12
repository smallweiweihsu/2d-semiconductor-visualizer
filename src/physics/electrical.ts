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
export const hbar_Js = 1.054571817e-34
export const m0_kg = 9.1093837015e-31
/** 自由電子 Richardson 常數 (A·cm⁻²·K⁻²)，Sze & Ng (2007)。 */
export const richardsonConstant_A_per_cm2K2 = 120

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

// ---------------------------------------------------------------------------
// 量子電容（Quantum capacitance）
// 參考：S. Luryi, "Quantum capacitance devices", Appl. Phys. Lett. 52, 501 (1988),
// DOI: 10.1063/1.99649；N. Ma & D. Jena, 2D Mater. 2, 015003 (2015),
// DOI: 10.1088/2053-1583/2/1/015003。
// 簡併極限下 2D 系統：Cq = g · q² · m* / (2π ħ²)，g 為自旋×谷簡併因子。
// g = 2（僅自旋）時化簡為 Luryi 的 Cq = m e² / (π ħ²)。
// ---------------------------------------------------------------------------
export function calculateQuantumCapacitance(
  effectiveMass_m0: number | null,
  degeneracyFactor: number | null,
): number | null {
  const g = degeneracyFactor ?? 2

  if (!isPositiveNumber(effectiveMass_m0) || !isPositiveNumber(g)) {
    return null
  }

  const effectiveMass_kg = effectiveMass_m0 * m0_kg

  return (g * q_C * q_C * effectiveMass_kg) / (2 * Math.PI * hbar_Js * hbar_Js)
}

/** 串聯電容：Ceff = (1/Cox + 1/Cq)⁻¹。Cq 缺失時回傳 Cox。 */
export function calculateEffectiveGateCapacitance(
  Cox_F_per_m2: number | null,
  Cq_F_per_m2: number | null,
): number | null {
  if (!isPositiveNumber(Cox_F_per_m2)) {
    return null
  }

  if (!isPositiveNumber(Cq_F_per_m2)) {
    return Cox_F_per_m2
  }

  return (Cox_F_per_m2 * Cq_F_per_m2) / (Cox_F_per_m2 + Cq_F_per_m2)
}

// ---------------------------------------------------------------------------
// 次臨界擺幅（Subthreshold swing）
// SS = n · (kB·T/q) · ln(10)，理想 n = 1 時室溫約 60 mV/dec。
// 參考：Sze & Ng, Physics of Semiconductor Devices, 3rd ed. (2007), Ch. 6。
// ---------------------------------------------------------------------------
export function calculateSubthresholdSwing(
  temperature_K: number,
  idealityFactor: number | null,
): number | null {
  const n = idealityFactor ?? 1

  if (!isPositiveNumber(temperature_K) || !isPositiveNumber(n)) {
    return null
  }

  return n * kB_eV_per_K * temperature_K * Math.log(10) * 1000
}

// ---------------------------------------------------------------------------
// Schottky 熱離子發射（Thermionic emission）
// J = A*·T²·exp(−qφB/kBT)，I-V：I = Is·(exp(qV/n·kBT) − 1)。
// 參考：Sze & Ng (2007), Ch. 3；二維材料接觸限制見 Allain et al.,
// Nature Materials 14, 1195 (2015), DOI: 10.1038/nmat4452。
// ---------------------------------------------------------------------------
export function calculateThermionicSaturationCurrent(
  barrierHeight_eV: number | null,
  temperature_K: number,
  contactArea_um2: number | null,
): number | null {
  if (
    !isFiniteNumber(barrierHeight_eV) ||
    barrierHeight_eV < 0 ||
    !isPositiveNumber(temperature_K) ||
    !isPositiveNumber(contactArea_um2)
  ) {
    return null
  }

  const J_A_per_cm2 =
    richardsonConstant_A_per_cm2K2 *
    temperature_K *
    temperature_K *
    Math.exp(-barrierHeight_eV / (kB_eV_per_K * temperature_K))
  const area_cm2 = contactArea_um2 * 1e-8

  return J_A_per_cm2 * area_cm2
}

export function calculateThermionicCurrent(
  saturationCurrent_A: number | null,
  voltage_V: number,
  temperature_K: number,
  idealityFactor: number | null,
): number | null {
  const n = idealityFactor ?? 1

  if (
    !isPositiveNumber(saturationCurrent_A) ||
    !Number.isFinite(voltage_V) ||
    !isPositiveNumber(temperature_K) ||
    !isPositiveNumber(n)
  ) {
    return null
  }

  const Vt = kB_eV_per_K * temperature_K

  // 限制指數避免溢位；正偏壓近似指數成長，負偏壓趨近 −Is。
  const exponent = Math.min(voltage_V / (n * Vt), 60)

  return saturationCurrent_A * (Math.exp(exponent) - 1)
}

// ---------------------------------------------------------------------------
// 漸變通道近似（Gradual channel approximation, square-law model）
// 線性區：Id = μ·C·(W/L)·[(Vg−Vth)·Vd − Vd²/2]
// 飽和區（Vd ≥ Vg−Vth）：Id,sat = μ·C·(W/L)·(Vg−Vth)²/2
// 參考：Sze & Ng (2007), Ch. 6。長通道、無速度飽和、無通道長度調變。
// ---------------------------------------------------------------------------
export function calculateSquareLawCurrent({
  gateOverdrive_V,
  Vd,
  mobility_cm2Vs,
  capacitance_F_per_m2,
  length_um,
  width_um,
}: {
  gateOverdrive_V: number
  Vd: number
  mobility_cm2Vs: number | null
  capacitance_F_per_m2: number | null
  length_um: number | null
  width_um: number | null
}): number | null {
  if (
    !isPositiveNumber(mobility_cm2Vs) ||
    !isPositiveNumber(capacitance_F_per_m2) ||
    !isPositiveNumber(length_um) ||
    !isPositiveNumber(width_um) ||
    !Number.isFinite(gateOverdrive_V) ||
    !Number.isFinite(Vd)
  ) {
    return null
  }

  if (gateOverdrive_V <= 0) {
    return 0
  }

  const mobility_m2Vs = mobility_cm2Vs * 1e-4
  const k = mobility_m2Vs * capacitance_F_per_m2 * (width_um / length_um)
  const sign = Vd < 0 ? -1 : 1
  const VdAbs = Math.abs(Vd)

  if (VdAbs >= gateOverdrive_V) {
    // 夾止飽和區
    return (sign * (k * gateOverdrive_V * gateOverdrive_V)) / 2
  }

  // 線性（triode）區
  return sign * k * (gateOverdrive_V * VdAbs - (VdAbs * VdAbs) / 2)
}

/**
 * 次臨界電流：Id = I₀·exp((Vg−Vth−n·Vt)/(n·Vt))，以 Vov = n·Vt 處的
 * square-law 電流為連續性錨點（EKV-like 平滑近似）。
 * 參考：Sze & Ng (2007), Ch. 6。
 */
export function calculateSubthresholdCurrent({
  gateOverdrive_V,
  Vd,
  temperature_K,
  idealityFactor,
  mobility_cm2Vs,
  capacitance_F_per_m2,
  length_um,
  width_um,
}: {
  gateOverdrive_V: number
  Vd: number
  temperature_K: number
  idealityFactor: number | null
  mobility_cm2Vs: number | null
  capacitance_F_per_m2: number | null
  length_um: number | null
  width_um: number | null
}): number | null {
  const n = idealityFactor ?? 1

  if (
    !isPositiveNumber(temperature_K) ||
    !isPositiveNumber(n) ||
    !Number.isFinite(gateOverdrive_V) ||
    !Number.isFinite(Vd)
  ) {
    return null
  }

  const Vt = kB_eV_per_K * temperature_K
  const anchorCurrent = calculateSquareLawCurrent({
    gateOverdrive_V: n * Vt,
    Vd,
    mobility_cm2Vs,
    capacitance_F_per_m2,
    length_um,
    width_um,
  })

  if (anchorCurrent === null) {
    return null
  }

  // 以 Vov = n·Vt 為交接點，確保與 square-law 區段連續。
  const exponent = Math.min((gateOverdrive_V - n * Vt) / (n * Vt), 0)

  return anchorCurrent * Math.exp(exponent)
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

/** 取得有效閘極電容（含選用的量子電容串聯修正）。 */
function getEffectiveCapacitance(scenario: ElectricalScenario) {
  const Cox = calculateGateCapacitancePerArea(
    scenario.dielectricConstant,
    scenario.dielectricThickness_nm,
  )
  const Cq = scenario.includeQuantumCapacitance
    ? calculateQuantumCapacitance(
        scenario.effectiveMass_m0 ?? null,
        scenario.quantumDegeneracyFactor ?? null,
      )
    : null

  return {
    Cox,
    Cq,
    Ceff: calculateEffectiveGateCapacitance(Cox, Cq),
  }
}

/**
 * 以熱離子發射上限限制通道電流（contact-limited regime 的簡化判讀）。
 * 取 min(|通道電流|, |熱離子上限|)，僅作為趨勢判讀，不是自洽串聯解。
 */
function applyThermionicLimit(
  scenario: ElectricalScenario,
  current: number,
  Vd: number,
) {
  if (scenario.contactModel !== 'schottky_like') {
    return current
  }

  const Is = calculateThermionicSaturationCurrent(
    scenario.schottkyBarrierHeight_eV ?? null,
    scenario.temperature_K,
    scenario.contactArea_um2 ?? null,
  )
  const contactCurrent = calculateThermionicCurrent(
    Is,
    Math.abs(Vd),
    scenario.temperature_K,
    scenario.schottkyIdealityFactor ?? null,
  )

  if (contactCurrent === null) {
    return current
  }

  const sign = current < 0 ? -1 : 1

  return sign * Math.min(Math.abs(current), Math.abs(contactCurrent))
}

function calculateAtBias(
  scenario: ElectricalScenario,
  Vg: number,
  Vd: number,
) {
  const outputModel = scenario.outputModel ?? 'square_law'
  const { Ceff } = getEffectiveCapacitance(scenario)
  const Vth = scenario.thresholdVoltage_V ?? 0
  // 電洞型通道以反向過驅動近似（symmetric approximation）。
  const gateOverdrive_V =
    scenario.carrierType === 'hole' ? Vth - Vg : Vg - Vth
  const floor = Math.max(scenario.offCurrentFloor_A, 0)
  const sign = Vd < 0 ? -1 : 1
  const includeSubthreshold = scenario.includeSubthreshold !== false
  const n = scenario.subthresholdIdealityFactor ?? 1
  const Vt = kB_eV_per_K * Math.max(scenario.temperature_K, 1)

  let current: number | null

  if (outputModel === 'linear_resistor') {
    const carrierDensity = calculateInducedCarrierDensity(
      Ceff,
      Vth + Math.max(gateOverdrive_V, 0),
      Vth,
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
    current = calculateOhmicCurrent(Vd, Rtotal)
  } else {
    const commonInputs = {
      Vd,
      mobility_cm2Vs: scenario.mobility_cm2Vs,
      capacitance_F_per_m2: Ceff,
      length_um: scenario.channelLength_um,
      width_um: scenario.channelWidth_um,
    }

    if (gateOverdrive_V >= n * Vt || !includeSubthreshold) {
      current = calculateSquareLawCurrent({
        gateOverdrive_V,
        ...commonInputs,
      })
    } else {
      current = calculateSubthresholdCurrent({
        gateOverdrive_V,
        temperature_K: scenario.temperature_K,
        idealityFactor: n,
        ...commonInputs,
      })
    }

    // square-law 模型的接觸電阻以一階修正近似：Vd' = Vd − Id·(Rs+Rd)。
    if (
      current !== null &&
      scenario.contactModel !== 'ideal_ohmic' &&
      isFiniteNumber(scenario.sourceContactResistance_ohm) &&
      isFiniteNumber(scenario.drainContactResistance_ohm)
    ) {
      const Rseries =
        Math.max(scenario.sourceContactResistance_ohm, 0) +
        Math.max(scenario.drainContactResistance_ohm, 0)

      for (let iteration = 0; iteration < 3; iteration += 1) {
        const VdEffective: number = Vd - (current ?? 0) * Rseries
        const corrected: number | null =
          gateOverdrive_V >= n * Vt || !includeSubthreshold
            ? calculateSquareLawCurrent({
                gateOverdrive_V,
                ...commonInputs,
                Vd: VdEffective,
              })
            : calculateSubthresholdCurrent({
                gateOverdrive_V,
                temperature_K: scenario.temperature_K,
                idealityFactor: n,
                ...commonInputs,
                Vd: VdEffective,
              })

        if (corrected === null) {
          break
        }

        current = corrected
      }
    }
  }

  if (current === null) {
    return sign * floor
  }

  current = applyThermionicLimit(scenario, current, Vd)

  if (Math.abs(current) < floor) {
    return sign * floor
  }

  return current
}

function hasRequiredCurveInputs(scenario: ElectricalScenario) {
  const hasContacts =
    scenario.contactModel === 'ideal_ohmic' ||
    (scenario.contactModel === 'schottky_like' &&
      isFiniteNumber(scenario.schottkyBarrierHeight_eV) &&
      isFiniteNumber(scenario.contactArea_um2)) ||
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
  const { Cox: Cox_F_per_m2, Cq, Ceff } = getEffectiveCapacitance(scenario)
  const carrierDensity_m2 = calculateInducedCarrierDensity(
    Ceff,
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

  const outputModel = scenario.outputModel ?? 'square_law'
  const includeSubthreshold = scenario.includeSubthreshold !== false
  const subthresholdSwing_mV_per_dec = includeSubthreshold
    ? calculateSubthresholdSwing(
        scenario.temperature_K,
        scenario.subthresholdIdealityFactor ?? null,
      )
    : null
  const saturationVoltage_V =
    outputModel === 'square_law' && isFiniteNumber(scenario.thresholdVoltage_V)
      ? scenario.gateVoltageStop_V - (scenario.thresholdVoltage_V ?? 0)
      : null
  const thermionicSaturationCurrent_A =
    scenario.contactModel === 'schottky_like'
      ? calculateThermionicSaturationCurrent(
          scenario.schottkyBarrierHeight_eV ?? null,
          scenario.temperature_K,
          scenario.contactArea_um2 ?? null,
        )
      : null

  if (
    scenario.contactModel === 'schottky_like' &&
    thermionicSaturationCurrent_A === null
  ) {
    warnings_zh.push(
      'Schottky-like 接觸缺少障礙高度或接觸面積，無法估算熱離子發射上限；曲線未含接觸限制。',
    )
  }

  if (scenario.includeQuantumCapacitance && Cq === null) {
    warnings_zh.push('已啟用量子電容但缺少有效質量，Cq 未被計算。')
  }

  const assumptions_zh = [
    outputModel === 'square_law'
      ? '通道電流使用漸變通道近似（線性區 + 夾止飽和區，Sze & Ng 2007 Ch. 6），未包含速度飽和與通道長度調變。'
      : 'I-V / Id-Vg 曲線使用 Ohmic-like 線性電阻趨勢模型，不代表真實量測資料。',
    scenario.includeQuantumCapacitance
      ? '閘極電容 = Cox 與 Cq 串聯（Luryi 1988; Ma & Jena 2015），Cq 取簡併極限常數值，未含載子統計完整修正。'
      : '閘極電容使用平行板電容近似，未包含邊緣電場、量子電容或陷阱電容。',
    includeSubthreshold
      ? '次臨界區使用指數近似 SS = n·(kT/q)·ln10（Sze & Ng 2007），n 為使用者輸入，未含界面陷阱自洽計算。'
      : '未啟用次臨界區，Vg < Vth 時以關態電流下限取代。',
    scenario.contactModel === 'schottky_like'
      ? 'Schottky 接觸以熱離子發射上限 J = A*T²exp(−qφB/kT) 限制電流（Sze & Ng 2007 Ch. 3；Allain et al. 2015），非自洽串聯解，亦未含穿隧與鏡像力降低。'
      : '金屬/二維半導體接觸可能由 pinning、界面態、缺陷、穿隧與污染主導。',
    '所有結果為定性 / 半定量趨勢，需文獻與實驗校準後才能定量解讀。',
  ]

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
    quantumCapacitance_F_per_m2: Cq,
    effectiveGateCapacitance_F_per_m2: Ceff,
    subthresholdSwing_mV_per_dec,
    saturationVoltage_V,
    thermionicSaturationCurrent_A,
    warnings_zh: [...new Set(warnings_zh)],
    assumptions_zh,
  }
}
