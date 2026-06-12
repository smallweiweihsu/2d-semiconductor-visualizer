import type { DeviceLayer, Material, MaterialCategory } from '../types/semiviz'

export interface MaterialAppearance {
  color: string
  emissive: string
  emissiveIntensity: number
  metalness: number
  roughness: number
  opacity: number
  transparent: boolean
}

export function getMaterialAppearance(material: Material | undefined, layer?: DeviceLayer): MaterialAppearance {
  const id = material?.id.toLowerCase() ?? ''
  const category = material?.category ?? 'custom'
  const electricalRole = layer?.electricalRole

  if (id === 'wse2') return appearance('#7c3aed', '#a855f7', 0.9, 0.04, 0.34, 1)
  if (id === 'mos2') return appearance('#3b82f6', '#1d4ed8', 0.22, 0.04, 0.5, 0.92)
  if (id === 'sb2o3') return appearance('#8ee7ff', '#0891b2', 0.16, 0.02, 0.14, 0.28)
  if (id === 'hbn') return appearance('#dff7ff', '#67e8f9', 0.14, 0.01, 0.16, 0.38)
  if (id === 'wox') return appearance('#fb923c', '#c2410c', 0.14, 0.02, 0.32, 0.58)
  if (id === 'pd' || id === 'pt') return appearance('#d7dde7', '#94a3b8', 0.04, 0.82, 0.28, 0.98)
  if (id === 'ti' || id === 'nb') return appearance('#56606f', '#0f172a', 0.02, 0.78, 0.36, 0.98)
  if (id === 'in') return appearance('#b9d8ff', '#60a5fa', 0.08, 0.62, 0.26, 0.96)
  if (id === 'sb-bulk' || electricalRole === 'substrate') return appearance('#162033', '#020617', 0.01, 0.12, 0.48, 1)
  if (id === 'hfo2' || id === 'sio2') return appearance('#d9ecff', '#93c5fd', 0.12, 0.02, 0.2, 0.46)

  if (category === 'metal') return appearance('#cbd5e1', '#64748b', 0.04, 0.72, 0.32, 0.96)
  if (category === 'dielectric' || category === 'oxide') return appearance('#a5f3fc', '#06b6d4', 0.12, 0.02, 0.2, 0.45)
  if (category === 'two_d_semiconductor') return appearance('#8b5cf6', '#6d28d9', 0.2, 0.04, 0.48, 0.9)
  if (category === 'bulk_conductor' || category === 'substrate') return appearance('#334155', '#020617', 0.02, 0.2, 0.42, 1)

  return appearance('#22d3ee', '#0891b2', 0.12, 0.08, 0.5, 0.72)
}

export function getCategoryOpacity(category: MaterialCategory, role?: DeviceLayer['electricalRole']) {
  if (role === 'channel') return 0.92
  if (role === 'gate_dielectric' || role === 'buffer' || role === 'passivation') return 0.42
  if (category === 'oxide' || category === 'dielectric') return 0.45
  return 1
}

function appearance(
  color: string,
  emissive: string,
  emissiveIntensity: number,
  metalness: number,
  roughness: number,
  opacity: number,
): MaterialAppearance {
  return {
    color,
    emissive,
    emissiveIntensity,
    metalness,
    roughness,
    opacity,
    transparent: opacity < 0.98,
  }
}
