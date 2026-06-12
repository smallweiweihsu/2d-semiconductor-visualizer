import { Edges, Html, OrbitControls, Text } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { RotateCcw, Scan, Tags, Waypoints } from 'lucide-react'
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { DeviceLayer, Material } from '../../types/semiviz'
import {
  createDeviceMeshLayers,
  getCameraPreset,
  getSceneBounds,
  isWebGLAvailable,
  type DeviceMeshLayer,
  type DeviceViewportMode,
  type OpacityMode,
} from './deviceViewport3DUtils'

interface DeviceViewport3DProps {
  layers: DeviceLayer[]
  materials: Material[]
  selectedId: string
  viewMode: DeviceViewportMode
  fallbackPreview: ReactNode
  onSelectLayer: (layerId: string) => void
}

export function DeviceViewport3D({
  layers,
  materials,
  selectedId,
  viewMode,
  fallbackPreview,
  onSelectLayer,
}: DeviceViewport3DProps) {
  const [showLabels, setShowLabels] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [opacityMode, setOpacityMode] = useState<OpacityMode>('normal')
  const [cameraAction, setCameraAction] = useState<'reset' | 'fit'>('reset')
  const [cameraKey, setCameraKey] = useState(0)
  const [hoveredLayer, setHoveredLayer] = useState<DeviceMeshLayer | null>(null)
  const webglAvailable = useMemo(() => isWebGLAvailable(), [])
  const meshLayers = useMemo(
    () => createDeviceMeshLayers({ layers, materials, selectedId, mode: viewMode, opacityMode }),
    [layers, materials, opacityMode, selectedId, viewMode],
  )
  const bounds = useMemo(() => getSceneBounds(meshLayers), [meshLayers])

  function triggerCamera(action: 'reset' | 'fit') {
    setCameraAction(action)
    setCameraKey((current) => current + 1)
  }

  if (!webglAvailable) {
    return (
      <div className="viewport-fallback">
        <div className="viewport-fallback-message">3D viewport unavailable. Showing 2D stack preview.</div>
        {fallbackPreview}
      </div>
    )
  }

  return (
    <div className="device-viewport3d">
      <div className="viewport-controls">
        <button className="manus-button ghost" type="button" onClick={() => triggerCamera('reset')}>
          <RotateCcw size={14} />
          Reset view
        </button>
        <button className="manus-button ghost" type="button" onClick={() => triggerCamera('fit')}>
          <Scan size={14} />
          Fit view
        </button>
        <button className={showLabels ? 'manus-button primary' : 'manus-button ghost'} type="button" onClick={() => setShowLabels((current) => !current)}>
          <Tags size={14} />
          Show labels
        </button>
        <button className={showAxes ? 'manus-button primary' : 'manus-button ghost'} type="button" onClick={() => setShowAxes((current) => !current)}>
          <Waypoints size={14} />
          Show axes
        </button>
        <label className="viewport-select">
          Opacity mode
          <select value={opacityMode} onChange={(event) => setOpacityMode(event.target.value as OpacityMode)}>
            <option value="normal">normal</option>
            <option value="semi-transparent">semi-transparent</option>
            <option value="selected-only">selected-only focus</option>
          </select>
        </label>
      </div>

      <div className="viewport-canvas-wrap" data-testid="device-viewport3d">
        <Canvas
          camera={{ fov: 42, near: 0.01, far: 1000 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => setHoveredLayer(null)}
        >
          <color attach="background" args={['#07111f']} />
          <ambientLight intensity={0.62} />
          <directionalLight intensity={1.1} position={[6, 8, 6]} />
          <pointLight intensity={0.75} position={[-5, 4, -4]} />
          <Suspense fallback={null}>
            <CameraRig
              action={cameraAction}
              actionKey={cameraKey}
              center={bounds.center}
              radius={bounds.radius}
              viewMode={viewMode}
            />
            {showAxes ? (
              <>
                <gridHelper args={[Math.max(8, bounds.radius * 1.45), 12, '#334155', '#1e293b']} position={[0, -0.03, 0]} />
                <axesHelper args={[2.4]} />
              </>
            ) : null}
            {meshLayers.map((meshLayer, index) => (
              <LayerSlab
                index={index}
                key={meshLayer.id}
                layer={meshLayer}
                showLabel={showLabels}
                onHover={setHoveredLayer}
                onSelect={onSelectLayer}
              />
            ))}
            {hoveredLayer ? <LayerTooltip layer={hoveredLayer} /> : null}
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

function CameraRig({
  action,
  actionKey,
  center,
  radius,
  viewMode,
}: {
  action: 'reset' | 'fit'
  actionKey: number
  center: [number, number, number]
  radius: number
  viewMode: DeviceViewportMode
}) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    const fitScale = action === 'fit' ? 0.78 : 1
    const offset = getCameraPreset(viewMode, radius * fitScale)
    camera.position.set(center[0] + offset[0], center[1] + offset[1], center[2] + offset[2])
    camera.lookAt(center[0], center[1], center[2])
    camera.updateProjectionMatrix()
    controlsRef.current?.target.set(center[0], center[1], center[2])
    controlsRef.current?.update()
  }, [action, actionKey, camera, center, radius, viewMode])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      enablePan
      enableRotate={viewMode !== 'TOP' && viewMode !== 'SIDE'}
      enableZoom
      makeDefault
      maxDistance={radius * 4}
      minDistance={Math.max(1.2, radius * 0.18)}
      mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }}
    />
  )
}

function LayerSlab({
  index,
  layer,
  showLabel,
  onHover,
  onSelect,
}: {
  index: number
  layer: DeviceMeshLayer
  showLabel: boolean
  onHover: (layer: DeviceMeshLayer | null) => void
  onSelect: (layerId: string) => void
}) {
  return (
    <group>
      <mesh
        data-layer-id={layer.id}
        name={`layer-${layer.id}`}
        position={layer.position}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(layer.id)
        }}
        onPointerOut={() => onHover(null)}
        onPointerOver={(event) => {
          event.stopPropagation()
          onHover(layer)
        }}
      >
        <boxGeometry args={layer.size} />
        <meshStandardMaterial
          color={layer.color}
          emissive={layer.isSelected ? '#0e7490' : '#000000'}
          emissiveIntensity={layer.isSelected ? 0.35 : 0}
          metalness={layer.role === 'gate' || layer.role === 'source' || layer.role === 'drain' || layer.role === 'contact' ? 0.38 : 0.08}
          opacity={layer.opacity}
          roughness={0.55}
          transparent={layer.opacity < 0.98}
        />
      </mesh>
      <mesh position={layer.position}>
        <boxGeometry args={layer.size} />
        <meshBasicMaterial transparent opacity={0} />
        <Edges color={layer.highlightColor} linewidth={layer.isSelected ? 2 : 1} scale={1.004} />
      </mesh>
      {showLabel ? (
        <Text
          anchorX="left"
          anchorY="middle"
          color={layer.isSelected ? '#ffffff' : '#cbd5e1'}
          fontSize={layer.isSelected ? 0.16 : 0.125}
          maxWidth={2.2}
          outlineColor="#020617"
          outlineWidth={0.012}
          position={[
            layer.position[0] + layer.size[0] / 2 + 0.18,
            layer.position[1] + (index % 2) * 0.14,
            layer.position[2] + layer.size[2] / 2 + 0.1,
          ]}
        >
          {layer.name}
        </Text>
      ) : null}
    </group>
  )
}

function LayerTooltip({ layer }: { layer: DeviceMeshLayer }) {
  return (
    <Html position={[layer.position[0], layer.position[1] + layer.size[1] / 2 + 0.35, layer.position[2]]} center>
      <div className="viewport-tooltip">
        <strong>{layer.name}</strong>
        <span>{layer.materialName}</span>
        <span>{layer.role} · {layer.electricalRole}</span>
        <span>{layer.thickness_nm} nm</span>
      </div>
    </Html>
  )
}
