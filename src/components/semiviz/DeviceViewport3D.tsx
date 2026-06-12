import { ContactShadows, Html, OrbitControls, RoundedBox } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { RotateCcw, Scan, Tags, Waypoints } from 'lucide-react'
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { DeviceLayer, Material } from '../../types/semiviz'
import {
  createDeviceMeshLayers,
  defaultDisplayMode,
  getCameraPreset,
  getSceneBounds,
  isWebGLAvailable,
  type DeviceMeshLayer,
  type DeviceViewportMode,
  type DisplayMode,
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
  const [showAxes, setShowAxes] = useState(false)
  const [displayMode, setDisplayMode] = useState<DisplayMode>(defaultDisplayMode)
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
        <label className="viewport-select">
          Display
          <select value={displayMode} onChange={(event) => setDisplayMode(event.target.value as DisplayMode)}>
            <option value="Render">Render</option>
            <option value="Inspect">Inspect</option>
            <option value="Debug">Debug</option>
          </select>
        </label>
        <button className={showLabels && displayMode !== 'Render' ? 'manus-button primary' : 'manus-button ghost'} type="button" onClick={() => setShowLabels((current) => !current)} disabled={displayMode === 'Render'}>
          <Tags size={14} />
          Show labels
        </button>
        <button className={showAxes && displayMode === 'Debug' ? 'manus-button primary' : 'manus-button ghost'} type="button" onClick={() => setShowAxes((current) => !current)} disabled={displayMode !== 'Debug'}>
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
        {displayMode === 'Debug' && showLabels ? (
        <div className="viewport-label-strip" data-testid="viewport-label-strip">
          {meshLayers.filter((layer) => layer.labelVisible).map((layer) => (
            <button
              className={layer.isSelected ? 'viewport-label selected' : 'viewport-label'}
              key={layer.id}
              type="button"
              onClick={() => onSelectLayer(layer.selectLayerId)}
            >
              {layer.name}
            </button>
          ))}
        </div>
        ) : null}
        <Canvas
          camera={{ fov: 42, near: 0.01, far: 1000 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          onPointerMissed={() => setHoveredLayer(null)}
        >
          <color attach="background" args={['#07111f']} />
          <fog attach="fog" args={['#07111f', 10, 22]} />
          <ambientLight intensity={0.58} />
          <directionalLight castShadow intensity={1.9} position={[4.5, 6.5, 5]} />
          <pointLight color="#67e8f9" intensity={1.45} position={[-4, 2.8, -2.6]} />
          <pointLight color="#8b5cf6" intensity={0.78} position={[3.5, 2.2, 3.8]} />
          <Suspense fallback={null}>
            <CameraRig
              action={cameraAction}
              actionKey={cameraKey}
              center={bounds.center}
              radius={bounds.radius}
              viewMode={viewMode}
            />
            {displayMode === 'Debug' && showAxes ? (
              <>
                <gridHelper args={[Math.max(8, bounds.radius * 1.35), 10, '#1d4b5f', '#132231']} position={[0, -0.05, 0]} />
                <axesHelper args={[2.4]} />
              </>
            ) : null}
            {meshLayers.map((meshLayer, index) => (
              <LayerSlab
                index={index}
                key={meshLayer.id}
                layer={meshLayer}
                showLabel={displayMode !== 'Render' && showLabels}
                showTooltip={displayMode !== 'Render'}
                onHover={setHoveredLayer}
                onSelect={onSelectLayer}
              />
            ))}
            {displayMode !== 'Render' && hoveredLayer ? <LayerTooltip layer={hoveredLayer} /> : null}
            {displayMode === 'Inspect' && !hoveredLayer ? <LayerTooltip layer={meshLayers.find((layer) => layer.isSelected)} /> : null}
            <ContactShadows opacity={0.34} scale={10} blur={2.9} far={4.5} position={[0, -0.04, 0]} color="#020617" />
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
  showTooltip,
  onHover,
  onSelect,
}: {
  index: number
  layer: DeviceMeshLayer
  showLabel: boolean
  showTooltip: boolean
  onHover: (layer: DeviceMeshLayer | null) => void
  onSelect: (layerId: string) => void
}) {
  return (
    <group>
      <RoundedBox
        args={layer.size}
        data-layer-id={layer.id}
        name={`layer-${layer.id}`}
        position={layer.position}
        radius={getRadius(layer)}
        smoothness={6}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(layer.selectLayerId)
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          document.body.style.cursor = ''
          onHover(null)
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          document.body.style.cursor = 'pointer'
          onHover(layer)
        }}
      >
        {layer.unlit ? (
          <meshBasicMaterial color={layer.appearance.color} opacity={layer.opacity} transparent={layer.opacity < 0.98} />
        ) : (
          <meshStandardMaterial
            color={layer.appearance.color}
            emissive={layer.isSelected ? '#22d3ee' : layer.appearance.emissive}
            emissiveIntensity={layer.isSelected ? 0.42 : layer.appearance.emissiveIntensity}
            metalness={layer.appearance.metalness}
            opacity={layer.opacity}
            roughness={layer.appearance.roughness}
            transparent={layer.opacity < 0.98}
          />
        )}
      </RoundedBox>
      {layer.glow > 0 ? (
        <RoundedBox args={layer.size} position={layer.position} radius={getRadius(layer) * 1.2} scale={[1.035, 1.18, 1.035]} smoothness={6}>
          <meshBasicMaterial color="#22d3ee" opacity={layer.isSelected ? 0.14 : 0.06} transparent depthWrite={false} />
        </RoundedBox>
      ) : null}
      {layer.isSelected ? (
        <RoundedBox args={layer.size} position={layer.position} radius={getRadius(layer) * 1.1} scale={[1.012, 1.08, 1.012]} smoothness={6}>
          <meshBasicMaterial color="#67e8f9" opacity={0.18} transparent depthWrite={false} />
        </RoundedBox>
      ) : null}
      {showLabel && layer.labelVisible && showTooltip ? (
        <Html
          center
          distanceFactor={7.5}
          position={[
            layer.position[0] + layer.size[0] / 2 + 0.42,
            layer.position[1] + 0.38 + (index % 3) * 0.12,
            layer.position[2] + layer.size[2] / 2 + 0.2,
          ]}
          transform
          sprite
        >
          <div className={layer.isSelected ? 'viewport-label selected' : 'viewport-label'}>{layer.name}</div>
        </Html>
      ) : null}
    </group>
  )
}

function getRadius(layer: DeviceMeshLayer) {
  if (layer.electricalRole === 'channel') return 0.025
  if (layer.electricalRole === 'substrate') return 0.1
  return 0.07
}

function LayerTooltip({ layer }: { layer?: DeviceMeshLayer }) {
  if (!layer) return null
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
