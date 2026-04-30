import type {
  Material,
  MaterialParameter,
  MaterialParameterKey,
  ParameterConfidence,
} from '../../types/material'

export const parameterLabels: Record<MaterialParameterKey, string> = {
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
}

export const parameterOrder = Object.keys(
  parameterLabels,
) as MaterialParameterKey[]

export interface MaterialParameterStats {
  known: number
  estimated: number
  unknown: number
}

export function getMaterialParameterStats(
  material: Material,
): MaterialParameterStats {
  return parameterOrder.reduce(
    (stats, parameterKey) => {
      stats[material.parameters[parameterKey].confidence] += 1
      return stats
    },
    { known: 0, estimated: 0, unknown: 0 },
  )
}

export function getMaterialStatus(material: Material) {
  const stats = getMaterialParameterStats(material)

  if (stats.unknown > 0) {
    return {
      confidence: 'unknown' as ParameterConfidence,
      label: '需要文獻參數',
    }
  }

  if (stats.estimated > 0) {
    return {
      confidence: 'estimated' as ParameterConfidence,
      label: '含估計值',
    }
  }

  return {
    confidence: 'known' as ParameterConfidence,
    label: '已知',
  }
}

export function formatParameterValue(parameter: MaterialParameter) {
  if (parameter.value === null) {
    return '未知'
  }

  return String(parameter.value)
}
