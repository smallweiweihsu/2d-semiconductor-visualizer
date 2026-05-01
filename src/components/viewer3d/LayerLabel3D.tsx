import { Billboard, Text } from '@react-three/drei'
import { formatVoltage, getMaterialDisplayName } from '../device/deviceFormatting'
import type { RenderableLayer3D } from './viewerTypes'

interface LayerLabel3DProps {
  renderLayer: RenderableLayer3D
}

export function LayerLabel3D({ renderLayer }: LayerLabel3DProps) {
  const { layer, position, size } = renderLayer
  const voltage = formatVoltage(layer)
  const label = voltage
    ? `${layer.name} / ${voltage}`
    : `${layer.name}\n${getMaterialDisplayName(layer.materialId)}`

  return (
    <Billboard
      follow
      position={[
        position[0],
        position[1] + size[1] / 2 + 0.16,
        position[2] + size[2] / 2 + 0.12,
      ]}
    >
      <Text
        anchorX="center"
        anchorY="middle"
        color="#e2e8f0"
        fontSize={0.16}
        maxWidth={2.4}
        outlineColor="#020617"
        outlineWidth={0.012}
        textAlign="center"
      >
        {label}
      </Text>
    </Billboard>
  )
}
