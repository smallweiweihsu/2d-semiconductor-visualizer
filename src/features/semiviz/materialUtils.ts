import type { Material } from '../../types/semiviz'

export function findMaterial(materials: Material[], id: string) {
  return materials.find((material) => material.id === id) ?? materials[0]
}
