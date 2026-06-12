import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import {
  calculateCox,
  calculateTransferCurve,
  detectMissingParameters,
  extractDeviceParameters,
  resolveSimulationModel,
} from './src/simulation/mosfet'
import type { ExtractedDeviceParameters } from './src/simulation/mosfet'

describe('Simulation MVP device extraction', () => {
  it('extractDeviceParameters reads active device geometry and material parameters', () => {
    const extracted = extractDeviceParameters(seedProject.devices[0], seedProject.materials)

    expect(extracted.channelLayer?.role).toBe('semiconductor')
    expect(extracted.length_um).toBe(5)
    expect(extracted.width_um).toBe(2)
    expect(extracted.mobility_cm2Vs).toBe(80)
    expect(extracted.mobilityMeta?.confidence).toBe('estimated')
    expect(extracted.bandGap_eV).toBe(1.4)
    expect(extracted.electronAffinity_eV).toBe(3.9)
    expect(extracted.contactWorkFunction_eV).toBeCloseTo(4.95)
  })

  it('calculateCox converts nm to m', () => {
    expect(calculateCox(3.9, 10)).toBeCloseTo(0.003453, 5)
  })

  it('calculateTransferCurve applies leakage floor below threshold and rises above threshold', () => {
    const curve = calculateTransferCurve({
      mobility_cm2Vs: 100,
      carrierType: 'n',
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
      carrierType: 'unknown',
      contactLayers: [],
      contactMaterials: [],
      missing: [],
    } satisfies ExtractedDeviceParameters)

    expect(missing).toContain('channel layer electricalRole=channel')
    expect(missing).toContain('gate dielectric layer')
    expect(missing).toContain('source/drain/contact layer')
  })

  it('n-type device conducts at positive Vg', () => {
    const curve = calculateTransferCurve({
      carrierType: 'n',
      mobility_cm2Vs: 100,
      dielectricConstant: 10,
      tox_nm: 10,
      width_um: 2,
      length_um: 1,
      vd: 1,
      vgMin: -2,
      vgMax: 2,
      vth: 0.5,
      rc_ohm: 0,
      leakage_A: 1e-12,
      points: 3,
    })

    expect(curve[0].id_A).toBe(1e-12)
    expect(curve[2].id_A).toBeGreaterThan(curve[0].id_A)
  })

  it('p-type device conducts at negative Vg', () => {
    const curve = calculateTransferCurve({
      carrierType: 'p',
      mobility_cm2Vs: 100,
      dielectricConstant: 10,
      tox_nm: 10,
      width_um: 2,
      length_um: 1,
      vd: 1,
      vgMin: -2,
      vgMax: 2,
      vth: 0.5,
      rc_ohm: 0,
      leakage_A: 1e-12,
      points: 3,
    })

    expect(curve[0].id_A).toBeGreaterThan(curve[2].id_A)
    expect(curve[2].id_A).toBe(1e-12)
  })

  it('missing dielectric without fallback is blocked', () => {
    const device = {
      ...seedProject.devices[0],
      layers: seedProject.devices[0].layers.filter((layer) => layer.electricalRole !== 'gate_dielectric'),
    }
    const extracted = extractDeviceParameters(device, seedProject.materials)
    const resolved = resolveSimulationModel(extracted, simulationOptions(false))

    expect(resolved.status).toBe('blocked_missing_parameters')
    expect(resolved.input).toBeUndefined()
    expect(resolved.missing).toContain('tox')
  })

  it('missing dielectric with fallback becomes fallback_preview', () => {
    const device = {
      ...seedProject.devices[0],
      layers: seedProject.devices[0].layers.filter((layer) => layer.electricalRole !== 'gate_dielectric'),
    }
    const extracted = extractDeviceParameters(device, seedProject.materials)
    const resolved = resolveSimulationModel(extracted, simulationOptions(true))

    expect(resolved.status).toBe('fallback_preview')
    expect(resolved.input?.tox_nm).toBe(20)
    expect(resolved.parameters.find((parameter) => parameter.key === 'tox_nm')?.source).toBe('fallback')
  })

  it('gate metal is not used as contact work function', () => {
    const device = {
      ...seedProject.devices[0],
      layers: seedProject.devices[0].layers.filter((layer) =>
        layer.electricalRole === 'channel'
        || layer.electricalRole === 'gate'
        || layer.electricalRole === 'gate_dielectric'
      ),
    }
    const extracted = extractDeviceParameters(device, seedProject.materials)

    expect(extracted.contactLayers).toHaveLength(0)
    expect(extracted.contactWorkFunction_eV).toBeUndefined()
  })

  it('electricalRole gate_dielectric is preferred over ordinary dielectric role', () => {
    const hbnBuffer = {
      ...seedProject.devices[0].layers[4],
      id: 'hbn-buffer',
      materialId: 'hbn',
      role: 'dielectric' as const,
      electricalRole: 'buffer' as const,
      geometry: { ...seedProject.devices[0].layers[4].geometry, thickness_nm: 8 },
    }
    const hfo2GateDielectric = {
      ...seedProject.devices[0].layers[4],
      id: 'hfo2-gate-dielectric',
      materialId: 'hfo2',
      role: 'oxide' as const,
      electricalRole: 'gate_dielectric' as const,
      geometry: { ...seedProject.devices[0].layers[4].geometry, thickness_nm: 12 },
    }
    const device = {
      ...seedProject.devices[0],
      layers: [
        hbnBuffer,
        ...seedProject.devices[0].layers.filter((layer) => layer.electricalRole !== 'gate_dielectric'),
        hfo2GateDielectric,
      ],
    }
    const extracted = extractDeviceParameters(device, seedProject.materials)

    expect(extracted.dielectricLayer?.id).toBe('hfo2-gate-dielectric')
    expect(extracted.dielectricConstant).toBeUndefined()
  })
})

function simulationOptions(useFallback: boolean) {
  return {
    useFallback,
    vd: 1,
    vgMin: -2,
    vgMax: 2,
    vth: 0.5,
    rc_ohm: 0,
    leakage_A: 1e-12,
  }
}
