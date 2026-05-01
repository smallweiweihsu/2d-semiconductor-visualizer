import { cloneProcessStep, getProcessStepTemplate } from './processSteps'
import type { ProcessFlow, ProcessStep, ProcessStepType } from '../types/process'

function templateStep(type: ProcessStepType, name_zh?: string): ProcessStep {
  const template = getProcessStepTemplate(type)

  if (!template) {
    throw new Error(`Missing process step template: ${type}`)
  }

  return {
    ...cloneProcessStep(template, `${type}-default`),
    name_zh: name_zh ?? template.name_zh,
  }
}

function customStep(name_zh: string, description_zh: string): ProcessStep {
  const step = templateStep('custom', name_zh)

  return {
    ...step,
    description_zh,
    parameters: step.parameters.map((parameter) =>
      parameter.id === 'step_name'
        ? { ...parameter, value: name_zh, confidence: 'estimated' }
        : parameter,
    ),
  }
}

export const defaultProcessFlow: ProcessFlow = {
  id: 'sb-wse2-process-draft',
  name_zh: 'Sb/WSe₂ 元件製程草稿',
  description_zh:
    '用於整理 Sb/WSe₂ 元件從介電層處理、微影、金屬沉積到 Raman、電性與表面分析的初始流程。此流程尚未進行真實製程模擬。',
  steps: [
    templateStep('dielectric_deposition', 'Sb₂O₃ 沉積'),
    customStep('WSe₂ 轉移 / 放置', '記錄 WSe₂ 轉移、放置、對位與表面清潔條件。'),
    templateStep('ebeam_lithography', 'E-beam lithography'),
    templateStep('metal_deposition', 'Pd 金屬沉積'),
    customStep('Lift-off', '記錄 lift-off 溶劑、時間、溫度與殘膠風險。'),
    templateStep('raman', 'Raman'),
    templateStep('electrical_measurement', '電性量測'),
    templateStep('diffusion_annealing', '退火'),
    templateStep('low_temperature_electrical_measurement', '低溫電性量測'),
    customStep('AFM / XPS 候選量測', '視樣品需求安排 AFM 厚度/粗糙度或 XPS 表面化學分析。'),
  ],
}
