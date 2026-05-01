import type { ProcessFlow, ProcessStep, ProcessValidationWarning } from '../../types/process'
import { getStepParameter, isParameterEmpty } from './processFormatting'

export function validateProcessFlow(flow: ProcessFlow): ProcessValidationWarning[] {
  const warnings: ProcessValidationWarning[] = []

  if (flow.steps.length === 0) {
    warnings.push({
      id: 'no-steps',
      severity: 'error',
      message_zh: '目前沒有任何製程或量測步驟。',
    })
  }

  flow.steps.forEach((step) => {
    addStepWarnings(step, warnings)
  })

  if (!flow.steps.some((step) => isMeasurementStep(step))) {
    warnings.push({
      id: 'no-measurement-step',
      severity: 'info',
      message_zh: '目前流程尚未包含量測步驟，後續將難以對照製程結果。',
    })
  }

  if (!flow.steps.some((step) => step.type === 'electrical_measurement')) {
    warnings.push({
      id: 'no-electrical-measurement',
      severity: 'info',
      message_zh: '目前流程尚未包含電性量測。',
    })
  }

  if (!flow.steps.some((step) => step.type === 'raman' || step.type === 'low_power_raman')) {
    warnings.push({
      id: 'no-raman',
      severity: 'info',
      message_zh: '目前流程尚未包含 Raman 量測。',
    })
  }

  return warnings
}

function addStepWarnings(
  step: ProcessStep,
  warnings: ProcessValidationWarning[],
) {
  step.parameters
    .filter((parameter) => parameter.required && isParameterEmpty(parameter))
    .forEach((parameter) => {
      warnings.push({
        id: `${step.id}-${parameter.id}-missing`,
        severity: 'warning',
        stepId: step.id,
        message_zh: `「${step.name_zh}」的必要參數「${parameter.label_zh}」尚未填寫。`,
      })
    })

  if (step.type === 'metal_deposition') {
    const metalMaterial = getStepParameter(step, 'metal_material')

    if (!metalMaterial || isParameterEmpty(metalMaterial)) {
      warnings.push({
        id: `${step.id}-metal-missing`,
        severity: 'warning',
        stepId: step.id,
        message_zh: '金屬沉積步驟尚未指定金屬材料。',
      })
    }

    if (!step.linkedLayerIds || step.linkedLayerIds.length === 0) {
      warnings.push({
        id: `${step.id}-metal-no-linked-layer`,
        severity: 'info',
        stepId: step.id,
        message_zh: '金屬沉積尚未關聯到特定材料層。',
      })
    }
  }

  if (step.type === 'diffusion_annealing') {
    const temperature = getStepParameter(step, 'temperature_C')
    const time = getStepParameter(step, 'time_min')
    const d0 = getStepParameter(step, 'D0_m2s')
    const ea = getStepParameter(step, 'Ea_eV')

    if (!temperature || isParameterEmpty(temperature) || !time || isParameterEmpty(time)) {
      warnings.push({
        id: `${step.id}-anneal-temperature-time`,
        severity: 'warning',
        stepId: step.id,
        message_zh: '退火步驟需要溫度與時間，後續才可進行擴散估算。',
      })
    }

    if (!d0 || isParameterEmpty(d0) || !ea || isParameterEmpty(ea)) {
      warnings.push({
        id: `${step.id}-diffusion-missing-d0-ea`,
        severity: 'info',
        stepId: step.id,
        message_zh: 'D0 與 Ea 尚未填入；未來擴散長度只能作定性示意。',
      })
    }
  }

  if (step.type === 'rie') {
    const power = getStepParameter(step, 'power_W')
    const time = getStepParameter(step, 'time_s')

    if (!power || isParameterEmpty(power) || !time || isParameterEmpty(time)) {
      warnings.push({
        id: `${step.id}-rie-power-time`,
        severity: 'warning',
        stepId: step.id,
        message_zh: 'RIE 步驟尚未設定功率或時間。',
      })
    }
  }

  if (step.type === 'raman') {
    const power = getStepParameter(step, 'laser_power_mW')

    if (typeof power?.value === 'number' && power.value >= 1) {
      warnings.push({
        id: `${step.id}-raman-high-power`,
        severity: 'warning',
        stepId: step.id,
        message_zh: 'Raman 功率偏高時可能造成二維材料局部加熱或損傷。',
      })
    }
  }

  if (step.type === 'xps') {
    const depthProfile = getStepParameter(step, 'depth_profiling_enabled')

    if (depthProfile?.value === true) {
      warnings.push({
        id: `${step.id}-xps-depth-profile`,
        severity: 'info',
        stepId: step.id,
        message_zh: 'XPS 深度分析可能改變表面化學狀態，需謹慎解讀。',
      })
    }
  }

  if (step.type === 'oxidation') {
    const targetMaterial = getStepParameter(step, 'initial_material')

    if (!targetMaterial || isParameterEmpty(targetMaterial)) {
      warnings.push({
        id: `${step.id}-oxidation-target`,
        severity: 'warning',
        stepId: step.id,
        message_zh: '氧化步驟尚未指定目標材料。',
      })
    }
  }
}

function isMeasurementStep(step: ProcessStep) {
  return [
    'sem',
    'electrical_measurement',
    'low_temperature_electrical_measurement',
    'raman',
    'low_power_raman',
    'pl',
    'afm',
    'xps',
  ].includes(step.type)
}
