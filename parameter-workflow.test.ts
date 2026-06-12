import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { seedProject } from './src/data/seedProject'
import { extractDeviceParameters, resolveSimulationModel } from './src/simulation/mosfet'
import {
  detectParameterConflict,
  getReferenceUsage,
  normalizeMaterialParameter,
  resolveMaterialParameter,
} from './src/store/materialParameterUtils'
import type { MaterialParameter, SemivizProject } from './src/types/semiviz'

describe('material parameter confidence and provenance workflow', () => {
  it('normalizes old scalar parameter', () => {
    const parameter = normalizeMaterialParameter({ value: 80, confidence: 'estimated', unit: 'cm²/V·s' }, 'mobility_cm2Vs')

    expect(parameter.valueType).toBe('scalar')
    expect(parameter.value).toBe(80)
    expect(parameter.sourceIds).toEqual([])
  })

  it('normalizes old string range parameter without averaging', () => {
    const parameter = normalizeMaterialParameter({ value: '50-100', confidence: 'estimated' }, 'mobility_cm2Vs')

    expect(parameter.valueType).toBe('range')
    expect(parameter.range).toEqual({ min: 50, max: 100 })
    expect(resolveMaterialParameter(parameter).value).toBeUndefined()
  })

  it('range without selectedValue should be missing', () => {
    const parameter = normalizeMaterialParameter({ range: { min: 1, max: 4 }, confidence: 'estimated', valueType: 'range' }, 'dielectricConstant')

    expect(resolveMaterialParameter(parameter).missingReason).toBe('range requires selectedValue or typical')
  })

  it('range with typical should resolve', () => {
    const parameter = normalizeMaterialParameter({ range: { min: 1, max: 4, typical: 3 }, confidence: 'estimated', valueType: 'range' }, 'dielectricConstant')

    expect(resolveMaterialParameter(parameter).value).toBe(3)
  })

  it('selected candidate should be used by simulation', () => {
    const device = structuredClone(seedProject.devices[0])
    const materials = structuredClone(seedProject.materials)
    const wse2 = materials.find((material) => material.id === 'wse2')!
    wse2.mobility_cm2Vs = candidateParameter('mobility_cm2Vs', 120)
    const sb2o3 = materials.find((material) => material.id === 'sb2o3')!
    sb2o3.dielectricConstant = scalarParameter('dielectricConstant', 4, 'known')
    const extracted = extractDeviceParameters(device, materials)
    const resolved = resolveSimulationModel(extracted, options(false))

    expect(resolved.input?.mobility_cm2Vs).toBe(120)
  })

  it('conflict candidate should be detected', () => {
    const parameter = {
      ...scalarParameter('mobility_cm2Vs', null, 'estimated'),
      candidates: [
        { id: 'a', value: 10, confidence: 'estimated', valueType: 'scalar', selected: false },
        { id: 'b', value: 40, confidence: 'estimated', valueType: 'scalar', selected: false },
      ],
    } satisfies MaterialParameter

    expect(detectParameterConflict(parameter)).toBe(true)
    expect(resolveMaterialParameter(parameter).missingReason).toBe('conflict candidates require selectedValue')
  })

  it('estimated parameter makes status ready_with_estimates', () => {
    const materials = readyMaterials('estimated')
    const extracted = extractDeviceParameters(seedProject.devices[0], materials)
    const resolved = resolveSimulationModel(extracted, options(false))

    expect(resolved.status).toBe('ready_with_estimates')
  })

  it('unknown parameter blocks simulation', () => {
    const materials = readyMaterials('known')
    materials.find((material) => material.id === 'wse2')!.mobility_cm2Vs = scalarParameter('mobility_cm2Vs', null, 'unknown')
    const extracted = extractDeviceParameters(seedProject.devices[0], materials)
    const resolved = resolveSimulationModel(extracted, options(false))

    expect(resolved.status).toBe('blocked_missing_parameters')
  })

  it('material parameter keeps sourceIds', () => {
    const parameter = normalizeMaterialParameter({ value: 80, confidence: 'known', sourceIds: ['lit-1'] }, 'mobility_cm2Vs')

    expect(parameter.sourceIds).toEqual(['lit-1'])
  })

  it('reference reverse lookup works', () => {
    const project: SemivizProject = structuredClone(seedProject)
    project.materials[0].mobility_cm2Vs = { ...project.materials[0].mobility_cm2Vs, sourceIds: ['lit-001'] }

    expect(getReferenceUsage(project, 'lit-001')[0].parameterKey).toBe('mobility_cm2Vs')
  })

  it('vercel.json destination is /index.html', () => {
    const config = JSON.parse(readFileSync('vercel.json', 'utf8')) as { rewrites: Array<{ destination: string }> }

    expect(config.rewrites[0].destination).toBe('/index.html')
  })
})

function scalarParameter(key: string, value: number | null, confidence: 'known' | 'estimated' | 'unknown'): MaterialParameter {
  return normalizeMaterialParameter({ value, confidence, valueType: value === null ? 'unknown' : 'scalar' }, key)
}

function candidateParameter(key: string, value: number): MaterialParameter {
  return normalizeMaterialParameter({
    confidence: 'estimated',
    valueType: 'unknown',
    candidates: [{ id: 'selected', value, confidence: 'estimated', valueType: 'scalar', selected: true }],
  }, key)
}

function readyMaterials(confidence: 'known' | 'estimated') {
  const materials = structuredClone(seedProject.materials)
  materials.find((material) => material.id === 'wse2')!.mobility_cm2Vs = scalarParameter('mobility_cm2Vs', 100, confidence)
  materials.find((material) => material.id === 'wse2')!.bandGap_eV = scalarParameter('bandGap_eV', 1.4, confidence)
  materials.find((material) => material.id === 'wse2')!.electronAffinity_eV = scalarParameter('electronAffinity_eV', 3.9, confidence)
  materials.find((material) => material.id === 'sb2o3')!.dielectricConstant = scalarParameter('dielectricConstant', 4, confidence)
  return materials
}

function options(useFallback: boolean) {
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
