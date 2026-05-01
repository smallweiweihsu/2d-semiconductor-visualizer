import { getDeviceRoleDefinition } from '../../data/deviceRoles'
import { materialCategories } from '../../data/materialCategories'
import { materials } from '../../data/materials'
import { getProcessStepTypeDefinition } from '../../data/processStepTypes'
import type { DeviceLayer } from '../../types/device'
import type {
  ProcessParameter,
  ProcessParameterValue,
  ProcessStep,
  ProcessStepType,
  ProcessValidationSeverity,
} from '../../types/process'

export function getProcessTypeLabel(type: ProcessStepType) {
  return getProcessStepTypeDefinition(type)?.label_zh ?? '自訂步驟'
}

export function getProcessTypeCategory(type: ProcessStepType) {
  return getProcessStepTypeDefinition(type)?.category_zh ?? '自訂'
}

export function getProcessTypeAccentClass(type: ProcessStepType) {
  return (
    getProcessStepTypeDefinition(type)?.accentClass ??
    'border-slate-700 bg-slate-950/50 text-slate-300'
  )
}

export function formatProcessValue(value: ProcessParameterValue) {
  if (value === null || value === '') {
    return '未填寫'
  }

  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }

  return String(value)
}

export function isParameterEmpty(parameter: ProcessParameter) {
  return (
    parameter.value === null ||
    parameter.value === '' ||
    (typeof parameter.value === 'number' && Number.isNaN(parameter.value))
  )
}

export function getSeverityClass(severity: ProcessValidationSeverity) {
  if (severity === 'error') {
    return 'border-rose-800/60 bg-rose-950/35 text-rose-100'
  }

  if (severity === 'warning') {
    return 'border-amber-800/60 bg-amber-950/35 text-amber-100'
  }

  return 'border-sky-800/60 bg-sky-950/30 text-sky-100'
}

export function getLinkedLayerLabel(layer: DeviceLayer) {
  const material = materials.find((item) => item.id === layer.materialId)
  const category = materialCategories.find((item) => item.id === material?.category)
  const role = getDeviceRoleDefinition(layer.role)

  return {
    materialName: material?.displayName ?? '未知材料',
    categoryLabel: category?.label_zh ?? '未分類',
    roleLabel: role?.label_zh ?? '自訂角色',
  }
}

export function getStepParameter(step: ProcessStep, parameterId: string) {
  return step.parameters.find((parameter) => parameter.id === parameterId)
}
