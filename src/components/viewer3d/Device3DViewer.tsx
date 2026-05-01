import { GizmoHelper, GizmoViewport, OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { deviceRoleLabels } from '../../data/deviceRoles'
import type { DeviceLayer } from '../../types/device'
import { formatThickness } from '../device/deviceFormatting'
import { DeviceLayerMesh } from './DeviceLayerMesh'
import { LayerLabel3D } from './LayerLabel3D'
import { createDeviceSceneGeometry } from './viewerScaling'
import type { CameraViewPreset, DeviceSceneGeometry } from './viewerTypes'
import { ViewerControls } from './ViewerControls'

interface Device3DViewerProps {
  layers: DeviceLayer[]
  selectedLayerId: string | null
  onSelectLayer: (layerId: string) => void
}

export function Device3DViewer({
  layers,
  selectedLayerId,
  onSelectLayer,
}: Device3DViewerProps) {
  const [currentView, setCurrentView] = useState<CameraViewPreset>('three_d')
  const [exploded, setExploded] = useState(false)
  const [showLabels, setShowLabels] = useState(true)
  const [resetKey, setResetKey] = useState(0)
  const geometry = useMemo(
    () => createDeviceSceneGeometry(layers, exploded),
    [exploded, layers],
  )
  const visibleLayerCount = layers.filter((layer) => layer.visible).length
  const fallbackMessage = getFallbackMessage(visibleLayerCount, geometry)

  function handleResetView() {
    setCurrentView('three_d')
    setResetKey((current) => current + 1)
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <div className="grid min-w-0 gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-slate-200">
            3D 元件視覺化
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            此 3D 視覺化僅根據 layer stack 幾何參數產生結構示意，尚未代表真實製程形貌、晶格、能帶、擴散或電性結果。
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            厚度與位置經過視覺縮放，並非真實比例。
          </p>
        </div>

        <div className="min-w-0 rounded-md border border-slate-800 bg-slate-950/50 p-2">
          <ViewerControls
            currentView={currentView}
            exploded={exploded}
            showLabels={showLabels}
            onResetView={handleResetView}
            onSetView={setCurrentView}
            onToggleExploded={() => setExploded((current) => !current)}
            onToggleLabels={() => setShowLabels((current) => !current)}
          />
        </div>
      </div>

      <div className="mt-4 h-[420px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950 xl:h-[520px]">
        {fallbackMessage ? (
          <div className="grid h-full place-items-center px-6 text-center text-sm text-slate-500">
            {fallbackMessage}
          </div>
        ) : (
          <Canvas
            camera={{ fov: 42, near: 0.01, far: 1000 }}
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: false }}
          >
            <color attach="background" args={['#020617']} />
            <ambientLight intensity={0.55} />
            <directionalLight intensity={1.25} position={[6, 8, 5]} />
            <pointLight intensity={0.8} position={[-5, 5, -4]} />

            <Suspense fallback={null}>
              <CameraController
                center={geometry.center}
                radius={geometry.radius}
                resetKey={resetKey}
                view={currentView}
              />
              <gridHelper
                args={[Math.max(12, geometry.radius * 2), 20, '#334155', '#1e293b']}
                position={[0, -0.02, 0]}
              />
              {geometry.renderLayers.map((renderLayer) => (
                <DeviceLayerMesh
                  key={renderLayer.layer.id}
                  renderLayer={renderLayer}
                  selectedLayerId={selectedLayerId}
                  showLabels={showLabels}
                  onSelectLayer={onSelectLayer}
                >
                  <LayerLabel3D renderLayer={renderLayer} />
                </DeviceLayerMesh>
              ))}
              <GizmoHelper alignment="bottom-right" margin={[72, 72]}>
                <GizmoViewport
                  axisColors={['#f87171', '#34d399', '#60a5fa']}
                  labelColor="#e2e8f0"
                />
              </GizmoHelper>
            </Suspense>
          </Canvas>
        )}
      </div>

      <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1 text-xs text-slate-500">
        {geometry.renderLayers.map((renderLayer) => (
          <button
            className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-left hover:border-slate-700"
            key={renderLayer.layer.id}
            onClick={() => onSelectLayer(renderLayer.layer.id)}
            type="button"
          >
            <span
              className="h-3 w-3 rounded-full border border-white/20"
              style={{ backgroundColor: renderLayer.material.color }}
            />
            <span className="text-slate-300">{renderLayer.layer.name}</span>
            <span>{deviceRoleLabels[renderLayer.layer.role]}</span>
            <span>{formatThickness(renderLayer.layer.geometry.thickness_nm)}</span>
          </button>
        ))}
      </div>

      {geometry.skippedLayers.length > 0 ? (
        <div className="mt-3 rounded-md border border-amber-900/40 bg-amber-950/15 px-3 py-2 text-xs leading-5 text-amber-100/85">
          {geometry.skippedLayers.map((skippedLayer) => (
            <div key={skippedLayer.layer.id}>
              {skippedLayer.layer.name}：
              {skippedLayer.reason === 'missing_material'
                ? '此材料層缺少有效材料資料。'
                : '尺寸設定不完整，無法正確顯示。'}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

interface CameraControllerProps {
  center: [number, number, number]
  radius: number
  resetKey: number
  view: CameraViewPreset
}

function CameraController({
  center,
  radius,
  resetKey,
  view,
}: CameraControllerProps) {
  const { camera } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    const cameraOffset = getCameraOffset(view, radius)

    camera.position.set(
      center[0] + cameraOffset[0],
      center[1] + cameraOffset[1],
      center[2] + cameraOffset[2],
    )
    camera.lookAt(center[0], center[1], center[2])
    camera.updateProjectionMatrix()
    controlsRef.current?.target.set(center[0], center[1], center[2])
    controlsRef.current?.update()
  }, [camera, center, radius, resetKey, view])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      makeDefault
      maxDistance={radius * 4}
      minDistance={Math.max(1.5, radius * 0.25)}
    />
  )
}

function getCameraOffset(
  view: CameraViewPreset,
  radius: number,
): [number, number, number] {
  switch (view) {
    case 'top':
      return [0, radius * 1.45, 0.02]
    case 'side':
      return [radius * 1.35, radius * 0.25, 0]
    case 'front':
      return [0, radius * 0.25, radius * 1.35]
    case 'three_d':
    default:
      return [radius * 0.95, radius * 0.68, radius * 0.95]
  }
}

function getFallbackMessage(
  visibleLayerCount: number,
  geometry: DeviceSceneGeometry,
) {
  if (visibleLayerCount === 0) {
    return '目前沒有可顯示的材料層。'
  }

  if (geometry.renderLayers.length === 0) {
    const hasMissingMaterial = geometry.skippedLayers.some(
      (layer) => layer.reason === 'missing_material',
    )

    return hasMissingMaterial
      ? '此材料層缺少有效材料資料。'
      : '尺寸設定不完整，無法正確顯示。'
  }

  return ''
}
