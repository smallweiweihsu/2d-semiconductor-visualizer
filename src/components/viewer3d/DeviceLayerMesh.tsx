import { Edges } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { ReactNode } from 'react'
import { getOpacity } from './viewerScaling'
import type { RenderableLayer3D } from './viewerTypes'

interface DeviceLayerMeshProps {
  renderLayer: RenderableLayer3D
  selectedLayerId: string | null
  showLabels: boolean
  onSelectLayer: (layerId: string) => void
  children?: ReactNode
}

export function DeviceLayerMesh({
  renderLayer,
  selectedLayerId,
  showLabels,
  onSelectLayer,
  children,
}: DeviceLayerMeshProps) {
  const { layer, material, position, size } = renderLayer
  const opacity = getOpacity(layer.opacity)
  const isSelected = layer.id === selectedLayerId

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    onSelectLayer(layer.id)
  }

  return (
    <group>
      <mesh position={position} onPointerDown={handlePointerDown}>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={material.color}
          depthWrite={opacity >= 0.95}
          metalness={material.category === 'metal' ? 0.45 : 0.12}
          opacity={opacity}
          roughness={0.55}
          transparent={opacity < 1}
        />
        <Edges
          color={isSelected ? '#67e8f9' : '#0f172a'}
          linewidth={isSelected ? 2 : 1}
          scale={1.003}
        />
      </mesh>
      {showLabels ? children : null}
    </group>
  )
}
