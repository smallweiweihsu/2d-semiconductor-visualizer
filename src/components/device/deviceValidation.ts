import { deviceRoles } from '../../data/deviceRoles'
import { materials } from '../../data/materials'
import type {
  DeviceLayer,
  DeviceStructure,
  DeviceValidationSeverity,
  DeviceValidationWarning,
} from '../../types/device'

function createWarning(
  id: string,
  severity: DeviceValidationSeverity,
  message_zh: string,
  layerId?: string,
): DeviceValidationWarning {
  return { id, severity, message_zh, layerId }
}

export function validateDeviceStructure(
  structure: DeviceStructure,
): DeviceValidationWarning[] {
  const warnings: DeviceValidationWarning[] = []

  if (structure.layers.length === 0) {
    return [
      createWarning(
        'no-layers',
        'error',
        '目前沒有任何材料層。',
      ),
    ]
  }

  const thicknesses = structure.layers
    .map((layer) => layer.geometry.thickness_nm)
    .filter((thickness) => thickness > 0)
  const medianThickness =
    thicknesses.length > 0
      ? thicknesses.sort((a, b) => a - b)[Math.floor(thicknesses.length / 2)]
      : 0

  structure.layers.forEach((layer) => {
    warnings.push(...validateLayer(layer, medianThickness))
  })

  if (!structure.layers.some((layer) => layer.role === 'semiconductor')) {
    warnings.push(
      createWarning(
        'missing-semiconductor',
        'warning',
        '目前元件沒有半導體通道層。',
      ),
    )
  }

  const hasSource = structure.layers.some((layer) => layer.role === 'source')
  const hasDrain = structure.layers.some((layer) => layer.role === 'drain')
  const hasGate = structure.layers.some((layer) => layer.role === 'gate')

  if (!hasSource || !hasDrain) {
    warnings.push(
      createWarning(
        'missing-source-drain',
        'warning',
        '目前元件尚未同時設定源極與汲極。',
      ),
    )
  }

  if (!hasGate) {
    warnings.push(
      createWarning(
        'missing-gate',
        'info',
        '目前元件沒有閘極；若是二端元件可忽略此提醒。',
      ),
    )
  }

  const hasDielectric = structure.layers.some((layer) =>
    ['dielectric', 'oxide', 'passivation'].includes(layer.role),
  )

  if (hasGate && !hasDielectric) {
    warnings.push(
      createWarning(
        'gate-without-dielectric',
        'warning',
        '若後續要做閘極控制，請確認閘極與通道之間有介電層。',
      ),
    )
  }

  return warnings
}

export function validateLayer(
  layer: DeviceLayer,
  referenceThickness_nm = 0,
): DeviceValidationWarning[] {
  const warnings: DeviceValidationWarning[] = []
  const material = materials.find((item) => item.id === layer.materialId)

  if (!material) {
    warnings.push(
      createWarning(
        `${layer.id}-missing-material`,
        'error',
        '此層尚未選擇有效材料。',
        layer.id,
      ),
    )
  }

  if (!Number.isFinite(layer.geometry.thickness_nm) || layer.geometry.thickness_nm <= 0) {
    warnings.push(
      createWarning(
        `${layer.id}-invalid-thickness`,
        'error',
        '厚度必須大於 0。',
        layer.id,
      ),
    )
  } else if (layer.geometry.thickness_nm < 2) {
    warnings.push(
      createWarning(
        `${layer.id}-very-thin`,
        'info',
        '厚度小於 2 nm，可能代表單層或少層二維材料，視覺預覽已放大顯示。',
        layer.id,
      ),
    )
  }

  const isVeryThickByAbsoluteScale = layer.geometry.thickness_nm > 10000
  const isVeryThickComparedToStack =
    referenceThickness_nm > 0 && layer.geometry.thickness_nm > referenceThickness_nm * 100

  if (isVeryThickByAbsoluteScale || isVeryThickComparedToStack) {
    warnings.push(
      createWarning(
        `${layer.id}-very-thick`,
        'info',
        '此層厚度遠大於其他層，預覽比例已被壓縮。',
        layer.id,
      ),
    )
  }

  const roleDefinition = deviceRoles.find((role) => role.id === layer.role)
  const materialCategory = material?.category

  if (
    materialCategory &&
    roleDefinition &&
    !roleDefinition.suggestedCategories.includes(materialCategory)
  ) {
    warnings.push(
      createWarning(
        `${layer.id}-role-material-mismatch`,
        'warning',
        '此層角色與材料分類可能不一致，請確認設定。',
        layer.id,
      ),
    )
  }

  return warnings
}

export function getLayerWarnings(
  layerId: string,
  warnings: DeviceValidationWarning[],
) {
  return warnings.filter((warning) => warning.layerId === layerId)
}

export function countWarningsBySeverity(warnings: DeviceValidationWarning[]) {
  return warnings.reduce(
    (counts, warning) => {
      counts[warning.severity] += 1
      return counts
    },
    { info: 0, warning: 0, error: 0 },
  )
}
