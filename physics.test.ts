import { describe, expect, it } from 'vitest'
import {
  calculatePinnedBarrier,
  calculateSchottkyMottBarrier,
  estimateSchottkyBarrier,
} from './src/physics/bandAlignment'
import {
  erfc,
  generateErfcProfile,
  generateGaussianProfile,
} from './src/physics/diffusion'
import {
  calculateEffectiveGateCapacitance,
  calculateQuantumCapacitance,
  calculateSquareLawCurrent,
  calculateSubthresholdCurrent,
  calculateSubthresholdSwing,
  calculateThermionicSaturationCurrent,
} from './src/physics/electrical'
import {
  calculateCabreraMottThickness,
  calculateDealGroveThickness,
} from './src/physics/oxidation'

describe('band alignment', () => {
  it('Schottky-Mott: phiBn = Wm - chi', () => {
    expect(calculateSchottkyMottBarrier(5.1, 4.0)).toBeCloseTo(1.1, 10)
  })
  it('pinned S=1 equals Schottky-Mott', () => {
    expect(calculatePinnedBarrier(5.1, 4.0, 1, 4.5)).toBeCloseTo(1.1, 10)
  })
  it('pinned S=0 fully pinned at CNL', () => {
    expect(calculatePinnedBarrier(5.1, 4.0, 0, 4.5)).toBeCloseTo(0.5, 10)
  })
  it('hole barrier = Eg - phiBn', () => {
    const r = estimateSchottkyBarrier({
      metalWorkFunction_eV: 5.1,
      electronAffinity_eV: 4.0,
      bandGap_eV: 1.6,
    })
    expect(r.electronBarrier_eV).toBeCloseTo(1.1, 10)
    expect(r.holeBarrier_eV).toBeCloseTo(0.5, 10)
  })
})

describe('erfc / diffusion profiles', () => {
  it('erfc(0) = 1, erfc(inf)->0, erfc(-x)=2-erfc(x)', () => {
    expect(erfc(0)).toBeCloseTo(1, 6)
    expect(erfc(2)).toBeCloseTo(0.004678, 4)
    expect(erfc(-1)).toBeCloseTo(2 - erfc(1), 6)
  })
  it('erfc profile monotonic decreasing from 1', () => {
    const profile = generateErfcProfile(1e-18, 600, 20, 50)
    expect(profile[0].normalizedConcentration).toBeCloseTo(1, 5)
    for (let i = 1; i < profile.length; i++) {
      expect(profile[i].normalizedConcentration).toBeLessThanOrEqual(
        profile[i - 1].normalizedConcentration + 1e-12,
      )
    }
  })
  it('erfc(u) < exp(-u^2) at depth (mathematical relation for u > 0.57)', () => {
    const g = generateGaussianProfile(1e-18, 600, 20, 50)
    const e = generateErfcProfile(1e-18, 600, 20, 50)
    // 兩者皆以表面值 1 正規化；深處 erfc(u) ≈ exp(−u²)/(u√π) 小於 exp(−u²)。
    expect(e[30].normalizedConcentration).toBeLessThan(
      g[30].normalizedConcentration,
    )
  })
})

describe('electrical physics', () => {
  it('SS at 300K, n=1 is ~59.6 mV/dec', () => {
    expect(calculateSubthresholdSwing(300, 1)).toBeCloseTo(59.6, 0)
  })
  it('quantum capacitance matches Luryi formula for g=2', () => {
    const q = 1.602176634e-19
    const m0 = 9.1093837015e-31
    const hbar = 1.054571817e-34
    const expected = (q * q * m0) / (Math.PI * hbar * hbar)
    expect(calculateQuantumCapacitance(1, 2)).toBeCloseTo(expected, 6)
  })
  it('series capacitance is smaller than both', () => {
    const c = calculateEffectiveGateCapacitance(0.01, 0.5)
    expect(c).not.toBeNull()
    expect(c!).toBeLessThan(0.01)
    expect(c!).toBeCloseTo((0.01 * 0.5) / 0.51, 8)
  })
  it('square law: linear->saturation continuity and flat saturation', () => {
    const base = {
      mobility_cm2Vs: 100,
      capacitance_F_per_m2: 0.01,
      length_um: 1,
      width_um: 10,
    }
    const atSat = calculateSquareLawCurrent({ gateOverdrive_V: 1, Vd: 1, ...base })
    const justBelow = calculateSquareLawCurrent({ gateOverdrive_V: 1, Vd: 0.999, ...base })
    const beyond = calculateSquareLawCurrent({ gateOverdrive_V: 1, Vd: 2, ...base })
    expect(atSat).not.toBeNull()
    expect(Math.abs(atSat! - justBelow!) / atSat!).toBeLessThan(0.01)
    expect(beyond!).toBeCloseTo(atSat!, 12)
  })
  it('square law zero below threshold', () => {
    expect(
      calculateSquareLawCurrent({
        gateOverdrive_V: -0.5,
        Vd: 1,
        mobility_cm2Vs: 100,
        capacitance_F_per_m2: 0.01,
        length_um: 1,
        width_um: 10,
      }),
    ).toBe(0)
  })
  it('subthreshold continuous at handoff Vov = n*Vt and decays ~1 dec per SS', () => {
    const base = {
      Vd: 1,
      temperature_K: 300,
      idealityFactor: 1,
      mobility_cm2Vs: 100,
      capacitance_F_per_m2: 0.01,
      length_um: 1,
      width_um: 10,
    }
    const Vt = 8.617333262e-5 * 300
    const atHandoff = calculateSubthresholdCurrent({ gateOverdrive_V: Vt, ...base })
    const squareAtHandoff = calculateSquareLawCurrent({
      gateOverdrive_V: Vt,
      Vd: 1,
      mobility_cm2Vs: 100,
      capacitance_F_per_m2: 0.01,
      length_um: 1,
      width_um: 10,
    })
    expect(atHandoff!).toBeCloseTo(squareAtHandoff!, 12)
    const oneSwingBelow = calculateSubthresholdCurrent({
      gateOverdrive_V: Vt - Vt * Math.log(10),
      ...base,
    })
    expect(atHandoff! / oneSwingBelow!).toBeCloseTo(10, 3)
  })
  it('thermionic saturation current magnitude', () => {
    // A*=120, T=300, phiB=0.3 eV, area=1 um^2 = 1e-8 cm^2
    const kT = 8.617333262e-5 * 300
    const expected = 120 * 300 * 300 * Math.exp(-0.3 / kT) * 1e-8
    expect(calculateThermionicSaturationCurrent(0.3, 300, 1)).toBeCloseTo(expected, 12)
  })
})

describe('oxidation growth laws', () => {
  it('Deal-Grove short time ~ linear (B/A)t, long time ~ sqrt(Bt)', () => {
    const A = 10, B = 1
    const short = calculateDealGroveThickness(A, B, 1, 0)
    expect(short!).toBeCloseTo((B / A) * 1, 1)
    const long = calculateDealGroveThickness(A, B, 1e6, 0)
    expect(long! / Math.sqrt(B * 1e6)).toBeCloseTo(1, 1)
  })
  it('Deal-Grove exact solution satisfies x^2 + Ax = B(t+tau)', () => {
    const A = 5, B = 2, t = 100, tau = 10
    const x = calculateDealGroveThickness(A, B, t, tau)!
    expect(x * x + A * x).toBeCloseTo(B * (t + tau), 6)
  })
  it('Cabrera-Mott increases with time and respects limit', () => {
    const x1 = calculateCabreraMottThickness(1, 0.05, 10, 1, 5)
    const x2 = calculateCabreraMottThickness(1, 0.05, 1000, 1, 5)
    expect(x2!).toBeGreaterThan(x1!)
    const capped = calculateCabreraMottThickness(1, 0.05, 1e30, 1, 5)
    expect(capped!).toBeLessThanOrEqual(5)
  })
})
