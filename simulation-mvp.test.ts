import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import {
  calculateCox,
  calculateTransferCurve,
  detectMissingParameters,
  extractDeviceParameters,
} from './src/simulation/mosfet'
import type { ExtractedDeviceParameters } from './src/simulation/mosfet'

describe('Simulation MVP device extraction', () => {
  it('extractDeviceParameters reads active device geometry and material parameters', () => {
    const extracted = extractDeviceParameters(seedProject.devices[0], seedProject.materials)

    expect(extracted.channelLayer?.role).toBe('semiconductor')
    expect(extracted.length_um).toBe(5)
    expect(extracted.width_um).toBe(2)
    expect(extracted.mobility_cm2Vs).toBeCloseTo(125.5)
    expect(extracted.bandGap_eV).toBeCloseTo(1.45)
    expect(extracted.electronAffinity_eV).toBeCloseTo(3.85)
    expect(extracted.contactWorkFunction_eV).toBeGreaterThan(4.5)
  })

  it('calculateCox converts nm to m', () => {
    expect(calculateCox(3.9, 10)).toBeCloseTo(0.003453, 5)
  })

  it('calculateTransferCurve applies leakage floor below threshold and rises above threshold', () => {
    const curve = calculateTransferCurve({
      mobility_cm2Vs: 100,
      dielectricConstant: 3.9,
      tox_nm: 10,
      width_um: 2,
      length_um: 5,
      vd: 1,
      vgMin: -1,
      vgMax: 2,
      vth: 0.5,
      rc_ohm: 0,
      leakage_A: 1e-12,
      points: 4,
    })

    expect(curve[0].id_A).toBe(1e-12)
    expect(curve.at(-1)?.id_A).toBeGreaterThan(curve[1].id_A)
  })

  it('detects missing parameters on an empty-layer imported device', () => {
    const missing = detectMissingParameters({
      deviceId: 'empty',
      deviceName: 'Empty',
      contactLayers: [],
      contactMaterials: [],
      missing: [],
    } satisfies ExtractedDeviceParameters)

    expect(missing).toContain('channel layer role=semiconductor')
    expect(missing).toContain('gate dielectric layer')
    expect(missing).toContain('source/drain/contact layer')
  })
})
