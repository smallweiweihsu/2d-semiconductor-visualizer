import { Component, lazy, Suspense, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Box,
  Clock,
  Database,
  FlaskConical,
  GitBranch,
  GitCompare,
  Layers,
  Lightbulb,
  Plus,
  Zap,
} from 'lucide-react'
import { Link } from 'wouter'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DevicePreview } from '../../components/semiviz/DevicePreview'
import { LayerPropertyEditor } from './LayerPropertyEditor'
import { LayerStackPanel } from './LayerStackPanel'
import { findMaterial } from './materialUtils'
import { SimulationConfigEditor } from './SimulationConfigEditor'
import {
  getGeometryWarning,
  normalizeDeviceZPositions,
  normalizeViewportLayers,
} from '../../visualization/viewportGeometry'
import {
  calculateCox,
  calculateOutputCurve,
  calculateTransferCurve,
  extractDeviceParameters,
  prototypeFallbackValues,
  resolveSimulationModel,
  scaleCurrent,
} from '../../simulation/mosfet'
import {
  addLayer,
  deleteLayer,
  duplicateLayer,
  reorderLayer,
  updateLayer,
  updateSimulationConfig,
} from '../../store/layerOperations'
import { useProjectStore } from '../../store/projectStore'
import type {
  CarrierType,
  DeviceLayer,
  HypothesisStatus,
  LiteratureSource,
  LiteratureStatus,
  Material,
  MaterialCategory,
  MaterialParameter,
  ParameterCandidate,
  ParameterConfidence,
  ProcessType,
} from '../../types/semiviz'
import { getMaterialParameters, getReferenceUsage } from '../../store/materialParameterUtils'
import type { DeviceViewportMode } from '../../components/semiviz/deviceViewport3DUtils'

const DeviceViewport3D = lazy(() =>
  import('../../components/semiviz/DeviceViewport3D').then((module) => ({ default: module.DeviceViewport3D })),
)

const heroImage =
  'https://d2xsxph8kpxj0f.cloudfront.net/310519663719279500/Cfdeom2BqRqeA6yyQXzySn/hero-semiconductor-3d-NhSiKiaawo3GDQQmrbNUaz.webp'

const processLabels: Record<ProcessType, string> = {
  exfoliation: '機械剝離',
  dry_transfer: '乾式轉移',
  metal_deposition: '金屬沉積',
  thermal_evaporation: '熱蒸鍍',
  ebeam_evaporation: '電子束蒸鍍',
  rie: 'RIE 蝕刻',
  oxidation: '氧化',
  annealing: '退火',
  metal_diffusion: '金屬擴散',
  dielectric_deposition: '介電層沉積',
  lithography: '微影',
  liftoff: 'Lift-off',
  raman_check: 'Raman 量測',
  pl_check: 'PL 量測',
  afm_check: 'AFM 量測',
  xps_check: 'XPS 量測',
  electrical_measurement: '電性量測',
}

const statusLabels: Record<HypothesisStatus, string> = {
  open: '開放',
  testing: '測試中',
  confirmed: '已確認',
  rejected: '已否定',
}

const simulationStatusLabels = {
  ready: 'ready',
  ready_with_estimates: 'ready with estimates',
  fallback_preview: 'fallback preview',
  blocked_missing_parameters: 'blocked: missing parameters',
}

const materialCategories: MaterialCategory[] = ['metal', 'two_d_semiconductor', 'dielectric', 'oxide', 'bulk_conductor', 'substrate', 'custom']
const carrierTypes: CarrierType[] = ['n', 'p', 'ambipolar', 'unknown']
const confidenceOptions: ParameterConfidence[] = ['known', 'estimated', 'unknown']
const referenceStatusOptions: LiteratureStatus[] = ['candidate', 'reviewed', 'accepted', 'rejected']

export function DashboardPage() {
  const { project, activeDevice } = useProjectStore()
  const missingMaterials = project.materials.filter((material) =>
    ['wse2', 'mos2', 'hbn', 'sb2o3', 'wox'].includes(material.id),
  )

  return (
    <div className="manus-page dashboard-page">
      <section className="manus-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,13,24,.96), rgba(8,13,24,.48)), url(${heroImage})` }}>
        <h1>2D Semiconductor Device Visualizer</h1>
        <p>二維半導體元件視覺化與模擬平台 — 支援結構設計、製程規劃、電性模擬與量測資料管理</p>
        <div className="manus-hero-actions">
          <Link className="manus-button primary" href="/device-builder">
            <Layers size={16} />
            開啟 Device Builder
          </Link>
          <Link className="manus-button ghost" href="/iv-simulator">
            <Activity size={16} />
            I–V Simulator
          </Link>
        </div>
      </section>

      <section className="manus-stats-grid">
        <StatCard icon={<Layers size={18} />} label="元件結構" value={`${project.devices.length}`} suffix="active" tone="cyan" />
        <StatCard icon={<Database size={18} />} label="材料資料" value={`${project.materials.length}`} suffix="materials" tone="purple" />
        <StatCard icon={<FlaskConical size={18} />} label="量測資料" value={`${project.measurements.length}`} suffix="datasets" tone="green" />
        <StatCard icon={<BookOpen size={18} />} label="文獻來源" value={`${project.references.length}`} suffix="papers" tone="orange" />
      </section>

      <section className="manus-dashboard-main">
        <Card className="active-device-card" title="目前活躍元件" icon={<Zap size={16} />}>
          <div className="active-device-content">
            <div>
              <h2>{activeDevice.name}</h2>
              <p>{activeDevice.description}</p>
              <div className="tag-row">
                {activeDevice.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <Link className="manus-link" href="/device-builder">編輯結構 →</Link>
            </div>
            <DevicePreview layers={activeDevice.layers} />
          </div>
        </Card>

        <Card className="warning-card" title="缺少參數警告" icon={<AlertTriangle size={16} />}>
          <div className="missing-list">
            {missingMaterials.map((material) => (
              <div className="missing-row" key={material.id}>
                <span style={{ backgroundColor: material.color }} />
                <strong>{material.displayName}</strong>
                <small>— 缺少 work function / bandgap</small>
              </div>
            ))}
          </div>
          <Link className="manus-link orange" href="/materials">查看全部 →</Link>
        </Card>
      </section>

      <section className="manus-bottom-grid">
        <Card title="最近量測" icon={<Clock size={16} />}>
          {project.measurements.slice(0, 4).map((measurement) => (
            <div className="split-row" key={measurement.id}>
              <div><strong>{measurement.deviceName}</strong><span>{measurement.type}</span></div>
              <time>{measurement.date}</time>
            </div>
          ))}
        </Card>
        <Card title="製程進度" icon={<GitBranch size={16} />}>
          <div className="process-progress">
            <div><span>Sb/WSe₂ 上閘極製程</span><strong>8/12 步</strong></div>
            <div className="progress-track"><span /></div>
            <p>下一步：RIE O₂ 處理 WSe₂ 表面</p>
            <Link className="manus-link" href="/process-flow">查看製程 →</Link>
          </div>
        </Card>
        <Card title="待審文獻" icon={<BookOpen size={16} />}>
          {project.references.filter((entry) => entry.status === 'candidate').map((entry) => (
            <div className="paper-row" key={entry.id}>
              <strong>{entry.title}</strong>
              <span>{entry.authors} ({entry.year})</span>
            </div>
          ))}
          <Link className="manus-link" href="/references">管理文獻 →</Link>
        </Card>
      </section>
    </div>
  )
}

export function DeviceBuilderPage() {
  const { project, activeDevice, setActiveDeviceId, updateActiveDevice } = useProjectStore()
  const [selectedId, setSelectedId] = useState(activeDevice.layers[2]?.id ?? activeDevice.layers[0]?.id ?? '')
  const [viewMode, setViewMode] = useState<DeviceViewportMode>('3D')
  const [normalizeMessage, setNormalizeMessage] = useState('')
  const selected = activeDevice.layers.find((layer) => layer.id === selectedId) ?? activeDevice.layers[2] ?? activeDevice.layers[0]
  const material = selected ? findMaterial(project.materials, selected.materialId) : undefined

  function handleAddLayer() {
    const result = addLayer(activeDevice)
    updateActiveDevice(() => result.device)
    setSelectedId(result.layer.id)
  }

  function handleDuplicateLayer(layerId: string) {
    const result = duplicateLayer(activeDevice, layerId)
    updateActiveDevice(() => result.device)
    if (result.layer) {
      setSelectedId(result.layer.id)
    }
  }

  function handleDeleteLayer(layerId: string) {
    const nextDevice = deleteLayer(activeDevice, layerId)
    updateActiveDevice(() => nextDevice)
    setSelectedId(nextDevice.layers[0]?.id ?? '')
  }

  return (
    <div className="manus-page three-pane-page">
      <Card className="pane-list" title="Layer Stack">
        <label className="device-select-field">
          Active device
          <select value={activeDevice.id} onChange={(event) => setActiveDeviceId(event.target.value)}>
            {project.devices.map((deviceOption) => (
              <option value={deviceOption.id} key={deviceOption.id}>{deviceOption.name}</option>
            ))}
          </select>
        </label>
        <div className="template-panel">
          <small>Sb/WSe₂ TG</small>
          <strong>{activeDevice.name}</strong>
          <span>{activeDevice.layers.length ? 'Sb / WSe₂ / top gate / Sb₂O₃' : '尚無 layer，請匯入或新增 layer。'}</span>
        </div>
        <LayerStackPanel
          device={activeDevice}
          materials={project.materials}
          selectedId={selected?.id ?? ''}
          onSelect={setSelectedId}
          onAdd={handleAddLayer}
          onDelete={handleDeleteLayer}
          onDuplicate={handleDuplicateLayer}
          onMove={(layerId, direction) => updateActiveDevice((device) => reorderLayer(device, layerId, direction))}
        />
      </Card>

      <Card className="viewport-card" title="3D Viewport">
        <div className="view-tabs">
          {(['3D', 'TOP', 'SIDE', 'EXPLODED'] as DeviceViewportMode[]).map((mode) => (
            <button className={viewMode === mode ? 'active' : ''} key={mode} onClick={() => setViewMode(mode)}>
              {mode}
            </button>
          ))}
        </div>
        <div className={`large-device-stage ${viewMode.toLowerCase()}`}>
          {activeDevice.layers.length
            ? (
                <ViewportErrorBoundary fallback={<ViewportFallback layers={activeDevice.layers} selectedId={selected?.id ?? ''} viewMode={viewMode} />}>
                  <Suspense fallback={<ViewportFallback layers={activeDevice.layers} selectedId={selected?.id ?? ''} viewMode={viewMode} />}>
                    <DeviceViewport3D
                      fallbackPreview={<LayerStackGraphic layers={activeDevice.layers} selectedId={selected?.id ?? ''} viewMode={viewMode} />}
                      layers={activeDevice.layers}
                      materials={project.materials}
                      selectedId={selected?.id ?? ''}
                      viewMode={viewMode}
                      onSelectLayer={setSelectedId}
                    />
                  </Suspense>
                </ViewportErrorBoundary>
              )
            : <EmptyState text="此 active device 尚未定義 layer stack。" />}
        </div>
      </Card>

      <Card className="inspector-card" title="Properties">
        {selected && material ? (
          <>
            <div className="selected-material">
              <span style={{ backgroundColor: material.color }} />
              <div><h2>{selected.name}</h2><p>{material.displayName} · {selected.role}</p></div>
            </div>
            <LayerPropertyEditor
              layer={selected}
              materials={project.materials}
              geometryWarning={getGeometryWarning(selected)}
              normalizeMessage={normalizeMessage}
              onNormalizeZ={() => {
                updateActiveDevice((device) => normalizeDeviceZPositions(device))
                setNormalizeMessage('z positions normalized and saved.')
              }}
              onChange={(patch) => {
                setNormalizeMessage('')
                updateActiveDevice((device) => updateLayer(device, selected.id, patch))
              }}
            />
            <SimulationConfigEditor
              device={activeDevice}
              onChange={(config) => updateActiveDevice((device) => updateSimulationConfig(device, config))}
            />
          </>
        ) : <EmptyState text="選取 active device 後，這裡會顯示 layer 參數。" />}
      </Card>
    </div>
  )
}

export function ProcessFlowPage() {
  const { project } = useProjectStore()
  const [selectedOrder, setSelectedOrder] = useState(8)
  const flow = project.processes[0]
  const selected = flow.steps.find((step) => step.order === selectedOrder) ?? flow.steps[0]

  return (
    <WorkspacePage title="製程流程" icon={<GitBranch size={18} />}>
      <div className="flow-grid">
        <Card title="製程步驟">
          {flow.steps.map((step) => (
            <button className={step.order === selected.order ? 'process-row active' : 'process-row'} key={step.id} onClick={() => setSelectedOrder(step.order)}>
              <span>{step.order}</span>
              <div><strong>{processLabels[step.type]}</strong><small>{step.notes}</small></div>
            </button>
          ))}
        </Card>
        <Card title={flow.name}>
          <div className="timeline-row">
            {flow.steps.map((step) => (
              <button className={step.order === selected.order ? 'active' : ''} key={step.id} onClick={() => setSelectedOrder(step.order)}>{step.order}</button>
            ))}
          </div>
          <div className="detail-callout">
            <h2>{processLabels[selected.type]}</h2>
            <p>{selected.expectedResult ?? selected.notes}</p>
          </div>
        </Card>
      </div>
    </WorkspacePage>
  )
}

export function IVSimulatorPage() {
  const { project, activeDevice } = useProjectStore()
  const extracted = useMemo(
    () => extractDeviceParameters(activeDevice, project.materials),
    [activeDevice, project.materials],
  )
  const [vd, setVd] = useState(1)
  const [vgMin, setVgMin] = useState(-2)
  const [vgMax, setVgMax] = useState(2)
  const [vth, setVth] = useState(0.6)
  const [mobilityOverrides, setMobilityOverrides] = useState<Record<string, number>>({})
  const [rc, setRc] = useState(1000)
  const [leakageFloor, setLeakageFloor] = useState(1e-12)
  const [currentUnit, setCurrentUnit] = useState<'A' | 'uA' | 'nA'>('uA')
  const [useFallbackValues, setUseFallbackValues] = useState(false)
  const mobilityOverride = mobilityOverrides[activeDevice.id]
  const extractedForModel = useMemo(
    () => ({
      ...extracted,
      mobility_cm2Vs: mobilityOverride ?? extracted.mobility_cm2Vs,
    }),
    [extracted, mobilityOverride],
  )
  const simulation = useMemo(
    () => resolveSimulationModel(extractedForModel, {
      useFallback: useFallbackValues,
      vd,
      vgMin,
      vgMax,
      vth,
      rc_ohm: rc,
      leakage_A: leakageFloor,
    }),
    [extractedForModel, leakageFloor, rc, useFallbackValues, vd, vgMax, vgMin, vth],
  )
  const transferData = useMemo(
    () => simulation.input ? calculateTransferCurve(simulation.input).map((point) => ({
      vg: point.vg,
      id: scaleCurrent(point.id_A, currentUnit),
      region: point.region,
    })) : [],
    [currentUnit, simulation.input],
  )
  const outputGateValues = useMemo(
    () => simulation.input ? createOutputGateValues(simulation.input.carrierType, vth) : [],
    [simulation.input, vth],
  )
  const outputData = useMemo(
    () => simulation.input ? calculateOutputCurve({
      ...simulation.input,
      vdMax: Math.max(0.2, vd * 2),
      vgValues: outputGateValues,
    }).map((point) => {
      const scaled = { vd: point.vd }
      outputGateValues.forEach((vg) => {
        Object.assign(scaled, {
          [formatGateSeries(vg)]: scaleCurrent(point[`Vg=${Number(vg.toFixed(1))}V`] ?? 0, currentUnit),
        })
      })
      return scaled
    }) : [],
    [currentUnit, outputGateValues, simulation.input, vd],
  )
  const cox = simulation.input ? calculateCox(simulation.input.dielectricConstant, simulation.input.tox_nm) : undefined
  const chartDisabled = !simulation.input

  return (
    <WorkspacePage title="I–V Simulator" icon={<Activity size={18} />}>
      <div className="simulation-grid">
        <Card title="Active device summary">
          <div className="summary-stack">
            <h2>{activeDevice.name}</h2>
            <p>{activeDevice.description}</p>
            <Meta label="Channel" value={extracted.channelMaterial?.displayName ?? 'missing'} />
            <Meta label="Gate dielectric" value={extracted.dielectricMaterial?.displayName ?? 'missing'} />
            <Meta label="Contacts" value={extracted.contactMaterials.map((material) => material.displayName).join(', ') || 'missing'} />
            <Meta label="Role detection" value={`channel ${extracted.detection.channel} · dielectric ${extracted.detection.gateDielectric}`} />
            <Meta label="Carrier type" value={extracted.carrierType} />
            <div className={`status-pill status-${simulation.status}`}>{simulationStatusLabels[simulation.status]}</div>
            {simulation.status === 'fallback_preview' ? (
              <div className="simulation-status-note warning">Using fallback values because project parameters are missing. Go to Materials to review parameters or reset local project.</div>
            ) : null}
            {simulation.status === 'ready_with_estimates' ? (
              <div className="simulation-status-note estimate">Simulation uses estimated seed parameters. Replace with reviewed literature before quantitative use.</div>
            ) : null}
          </div>
        </Card>
        <Card title="Extracted parameters">
          <ParameterTable rows={[
            ...simulation.parameters.map((parameter) => ({
              label: parameter.label,
              value: parameter.value,
              unit: parameter.unit,
              source: parameter.source,
              sourceIds: parameter.sourceIds,
              notes: parameter.notes,
              conditions: parameter.conditions,
            })),
            { label: 'Cox', value: cox, unit: 'F/m²', source: cox === undefined ? 'missing' : 'derived' },
            { label: 'Eg', value: extracted.bandGap_eV, unit: 'eV', source: confidenceLabel(extracted.bandGapMeta?.confidence), sourceIds: extracted.bandGapMeta?.sourceIds, conditions: extracted.bandGapMeta?.conditions },
            { label: 'χ', value: extracted.electronAffinity_eV, unit: 'eV', source: confidenceLabel(extracted.electronAffinityMeta?.confidence), sourceIds: extracted.electronAffinityMeta?.sourceIds, conditions: extracted.electronAffinityMeta?.conditions },
            { label: 'contact φ', value: extracted.contactWorkFunction_eV, unit: 'eV', source: confidenceLabel(extracted.contactWorkFunctionMeta?.confidence), sourceIds: extracted.contactWorkFunctionMeta?.sourceIds, conditions: extracted.contactWorkFunctionMeta?.conditions },
          ]} references={project.references} />
        </Card>
        <Card title="Missing parameter warnings">
          {simulation.warnings.length ? (
            <div className="prototype-warning">
              <AlertTriangle size={14} />
              {simulation.warnings[0]}
            </div>
          ) : null}
          {extracted.missing.length || simulation.missing.length ? (
            <div className="warning-list">
              {[...new Set([...extracted.missing, ...simulation.missing])].map((item) => <div key={item}><AlertTriangle size={14} />{item}</div>)}
            </div>
          ) : <EmptyState text="Active device 已具備 MVP 模型需要的主要參數。" />}
        </Card>
        <Card title="Model controls">
          <label className="toggle-field">
            <input type="checkbox" checked={useFallbackValues} onChange={(event) => setUseFallbackValues(event.target.checked)} />
            Use fallback values for prototype preview
          </label>
          <RangeInput label="Vd" value={vd} min={0.05} max={5} step={0.05} unit="V" onChange={setVd} />
          <RangeInput label="Vg min" value={vgMin} min={-5} max={vgMax - 0.1} step={0.1} unit="V" onChange={setVgMin} />
          <RangeInput label="Vg max" value={vgMax} min={vgMin + 0.1} max={5} step={0.1} unit="V" onChange={setVgMax} />
          <RangeInput label="Vth override" value={vth} min={-3} max={3} step={0.05} unit="V" onChange={setVth} />
          <RangeInput
            label="Mobility override"
            value={mobilityOverride ?? extracted.mobility_cm2Vs ?? prototypeFallbackValues.mobility_cm2Vs}
            min={0}
            max={300}
            step={1}
            unit="cm²/V·s"
            onChange={(value) => setMobilityOverrides((current) => ({ ...current, [activeDevice.id]: value }))}
          />
          <RangeInput label="Rc override" value={rc} min={0} max={100000} step={100} unit="Ω" onChange={setRc} />
          <RangeInput label="Leakage floor" value={leakageFloor} min={1e-13} max={1e-8} step={1e-13} unit="A" onChange={setLeakageFloor} />
          <label className="device-select-field">
            Current unit
            <select value={currentUnit} onChange={(event) => setCurrentUnit(event.target.value as 'A' | 'uA' | 'nA')}>
              <option value="A">A</option>
              <option value="uA">µA</option>
              <option value="nA">nA</option>
            </select>
          </label>
        </Card>
        <Card title="Id-Vg Transfer Curve">
          {chartDisabled ? <DisabledChart missing={simulation.missing} /> : (
            <>
              {simulation.status === 'fallback_preview' ? <div className="prototype-warning"><AlertTriangle size={14} />Prototype preview using fallback values, not calibrated.</div> : null}
              <Chart data={transferData} xKey="vg" unit={currentUnit} lines={[{ key: 'id', color: 'oklch(0.78 0.15 195)' }]} />
            </>
          )}
        </Card>
        <Card title="Id-Vd Output Curve">
          {chartDisabled ? <DisabledChart missing={simulation.missing} /> : (
            <Chart
              data={outputData}
              xKey="vd"
              unit={currentUnit}
              lines={outputGateValues.map((vg, index) => ({
                key: formatGateSeries(vg),
                color: ['oklch(0.78 0.15 195)', 'oklch(0.7 0.15 160)', 'oklch(0.7 0.15 290)'][index] ?? 'oklch(0.78 0.15 195)',
              }))}
            />
          )}
        </Card>
        <Card title="Model assumptions">
          <div className="assumption-list">
            <p>使用長通道 MOSFET prototype 模型，Cox = ε0k/tox。</p>
            <p>Vg 小於 Vth 時採用 leakage floor；接觸電阻 Rc 以簡化電流限制處理。</p>
            <p>這批先不做 Supabase、DOI lookup 或 CSV fitting。</p>
          </div>
        </Card>
      </div>
    </WorkspacePage>
  )
}

export function BandDiagramPage() {
  return (
    <WorkspacePage title="Band Diagram" icon={<BarChart3 size={18} />}>
      <PlaceholderGrid items={['Pd φ=5.3 eV', 'Ti φ=4.33 eV', 'In φ=4.12 eV', 'WSe₂ χ=3.9 Eg=1.4']} />
    </WorkspacePage>
  )
}

export function MaterialsPage() {
  const { project, updateMaterial } = useProjectStore()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(project.materials[0]?.id ?? '')
  const [selectedParameterKey, setSelectedParameterKey] = useState('mobility_cm2Vs')
  const filtered = project.materials.filter((material) => material.displayName.toLowerCase().includes(query.toLowerCase()) || material.name.toLowerCase().includes(query.toLowerCase()))
  const selected = project.materials.find((material) => material.id === selectedId) ?? filtered[0] ?? project.materials[0]
  const selectedParameter = selected ? getMaterialParameter(selected, selectedParameterKey) : undefined
  const linkedReferences = selectedParameter?.sourceIds
    .map((sourceId) => project.references.find((reference) => reference.id === sourceId))
    .filter((reference): reference is LiteratureSource => Boolean(reference)) ?? []

  return (
    <WorkspacePage title="Materials" icon={<Database size={18} />}>
      <div className="library-grid">
        <Card title="材料資料庫">
          <input className="manus-field" placeholder="搜尋材料" value={query} onChange={(event) => setQuery(event.target.value)} />
          {filtered.map((material) => (
            <button className={material.id === selected?.id ? 'material-select-row active' : 'material-select-row'} key={material.id} onClick={() => setSelectedId(material.id)}>
              <span style={{ backgroundColor: material.color }} />
              <div><strong>{material.displayName}</strong><small>{material.description}</small></div>
            </button>
          ))}
        </Card>
        <Card title="Material detail">
          {selected ? (
            <div className="material-detail-editor">
              <div className="form-grid-2">
                <label>Name<input value={selected.name} onChange={(event) => updateMaterial(selected.id, (material) => ({ ...material, name: event.target.value }))} /></label>
                <label>Display name<input value={selected.displayName} onChange={(event) => updateMaterial(selected.id, (material) => ({ ...material, displayName: event.target.value }))} /></label>
                <label>Category<select value={selected.category} onChange={(event) => updateMaterial(selected.id, (material) => ({ ...material, category: event.target.value as MaterialCategory }))}>{materialCategories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
                <label>Carrier type<select value={selected.carrierType} onChange={(event) => updateMaterial(selected.id, (material) => ({ ...material, carrierType: event.target.value as CarrierType }))}>{carrierTypes.map((type) => <option value={type} key={type}>{type}</option>)}</select></label>
                <label>Color<input value={selected.color} onChange={(event) => updateMaterial(selected.id, (material) => ({ ...material, color: event.target.value }))} /></label>
              </div>
              <label>Description<textarea value={selected.description} onChange={(event) => updateMaterial(selected.id, (material) => ({ ...material, description: event.target.value }))} /></label>
              <label>
                Parameter
                <select value={selectedParameterKey} onChange={(event) => setSelectedParameterKey(event.target.value)}>
                  {getMaterialParameters(selected).map(([key, parameter]) => <option value={key} key={key}>{parameter.label}</option>)}
                </select>
              </label>
              {selectedParameter ? (
                <ParameterEditor
                  parameter={selectedParameter}
                  references={project.references}
                  linkedReferences={linkedReferences}
                  onChange={(parameter) => updateMaterial(selected.id, (material) => ({ ...material, [selectedParameterKey]: parameter } as Material))}
                />
              ) : null}
            </div>
          ) : <EmptyState text="選擇 material 後可編輯參數。" />}
        </Card>
      </div>
    </WorkspacePage>
  )
}

export function ReferencesPage() {
  const { project, addReference, updateReference } = useProjectStore()
  const [selectedId, setSelectedId] = useState(project.references[0]?.id ?? '')
  const selected = project.references.find((reference) => reference.id === selectedId) ?? project.references[0]

  return (
    <WorkspacePage title="References" icon={<BookOpen size={18} />}>
      <div className="library-grid">
        <Card title="文獻來源">
          <button className="manus-button primary" type="button" onClick={() => setSelectedId(addReference().id)}>新增 reference</button>
          {project.references.map((reference) => (
            <button className={reference.id === selected?.id ? 'paper-select-row active' : 'paper-select-row'} key={reference.id} onClick={() => setSelectedId(reference.id)}>
              <strong>{reference.title}</strong>
              <span>{reference.authors} ({reference.year}) · score {reference.reliabilityScore}/10</span>
            </button>
          ))}
        </Card>
        <Card title="Reference detail">
          {selected ? (
            <ReferenceEditor
              reference={selected}
              usages={getReferenceUsage(project, selected.id)}
              onChange={(reference) => updateReference(selected.id, () => reference)}
            />
          ) : <EmptyState text="新增或選擇 reference。" />}
        </Card>
      </div>
    </WorkspacePage>
  )
}

export function MeasurementsPage() {
  const { project } = useProjectStore()

  return (
    <WorkspacePage title="Measurements" icon={<FlaskConical size={18} />}>
      <Card title="量測資料">
        {project.measurements.map((measurement) => (
          <div className="split-row" key={measurement.id}>
            <div><strong>{measurement.deviceName}</strong><span>{measurement.type} · {measurement.tool}</span></div>
            <time>{measurement.date}</time>
          </div>
        ))}
      </Card>
    </WorkspacePage>
  )
}

export function ComparisonLabPage() {
  const { project } = useProjectStore()
  const compared = ['wse2', 'mos2', 'pd', 'ti'].map((id) => findMaterial(project.materials, id))

  return (
    <WorkspacePage title="Comparison Lab" icon={<GitCompare size={18} />}>
      <Card title="材料比較">
        <div className="comparison-row">
          {compared.map((material) => <MaterialRow key={material.id} material={material} />)}
        </div>
      </Card>
    </WorkspacePage>
  )
}

export function ResearchNotesPage() {
  const { project } = useProjectStore()
  const [selectedId, setSelectedId] = useState(project.hypotheses[0].id)
  const selected = project.hypotheses.find((hypothesis) => hypothesis.id === selectedId) ?? project.hypotheses[0]

  return (
    <div className="research-notes-page">
      <aside className="hypothesis-list">
        <header>
          <div><h1>研究假說</h1><p>{project.hypotheses.length} hypotheses</p></div>
          <button aria-label="新增研究假說"><Plus size={18} /></button>
        </header>
        {project.hypotheses.map((hypothesis) => (
          <button className={hypothesis.id === selected.id ? 'active' : ''} key={hypothesis.id} onClick={() => setSelectedId(hypothesis.id)}>
            <Lightbulb size={16} />
            <div><strong>{hypothesis.title}</strong><span>{statusLabels[hypothesis.status]} · {hypothesis.createdAt}</span></div>
          </button>
        ))}
      </aside>
      <section className="hypothesis-detail">
        <header>
          <Lightbulb size={24} />
          <div>
            <h2>{selected.title}</h2>
            <p><span>{statusLabels[selected.status]}</span>{selected.createdAt}</p>
          </div>
        </header>
        <div className="detail-section">
          <small>描述</small>
          <p>{selected.description}</p>
        </div>
        <div className="linked-panels">
          <div><span>相關元件</span><strong>0 linked</strong></div>
          <div><span>相關文獻</span><strong>0 linked</strong></div>
        </div>
        <div className="scroll-spacer" aria-hidden="true" />
      </section>
    </div>
  )
}

function WorkspacePage({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="manus-page workspace-page">
      <header className="workspace-heading">{icon}<h1>{title}</h1></header>
      {children}
      <div className="scroll-spacer" aria-hidden="true" />
    </div>
  )
}

function Card({ title, icon, className = '', children }: { title: string; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={`manus-card ${className}`}>
      <header>{icon}{title}</header>
      <div className="manus-card-body">{children}</div>
    </section>
  )
}

function StatCard({ icon, label, value, suffix, tone }: { icon: ReactNode; label: string; value: string; suffix: string; tone: string }) {
  return (
    <section className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{icon}</div>
      <div><span>{label}</span><strong>{value} <small>{suffix}</small></strong></div>
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="meta-box"><span>{label}</span><strong>{value}</strong></div>
}

function MaterialRow({ material }: { material: Material }) {
  return (
    <div className="material-row">
      <span style={{ backgroundColor: material.color }} />
      <div><strong>{material.displayName}</strong><small>{material.description}</small></div>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state">{text}</div>
}

function DisabledChart({ missing }: { missing: string[] }) {
  return (
    <div className="disabled-chart">
      <AlertTriangle size={18} />
      <strong>Simulation disabled</strong>
      <span>{missing.length ? `Missing: ${missing.join(', ')}` : 'Enable fallback preview to inspect a non-calibrated prototype curve.'}</span>
    </div>
  )
}

function LayerStackGraphic({ layers, selectedId, viewMode }: { layers: DeviceLayer[]; selectedId: string; viewMode: string }) {
  const { project } = useProjectStore()
  const normalized = normalizeViewportLayers(layers, project.materials, selectedId, viewMode === 'EXPLODED')

  return (
    <div className={`layer-stack-graphic normalized-${viewMode.toLowerCase()}`}>
      {normalized.map((layer) => (
        <span
          className={layer.isSelected ? 'selected' : ''}
          key={layer.id}
          style={{
            '--layer-color': layer.color,
            '--layer-y': `${layer.visualY}px`,
            '--layer-thickness': `${layer.visualThickness}px`,
            '--layer-width': `${layer.visualWidth * 100}%`,
            '--layer-offset-x': `${layer.visualOffsetX * 100}%`,
          } as CSSProperties}
        >
          {layer.name}
        </span>
      ))}
    </div>
  )
}

class ViewportErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('3D viewport unavailable:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="viewport-fallback">
          <div className="viewport-fallback-message">3D viewport unavailable. Showing 2D stack preview.</div>
          {this.props.fallback}
        </div>
      )
    }

    return this.props.children
  }
}

function ViewportFallback({ layers, selectedId, viewMode }: { layers: DeviceLayer[]; selectedId: string; viewMode: DeviceViewportMode }) {
  return (
    <div className="viewport-fallback">
      <LayerStackGraphic layers={layers} selectedId={selectedId} viewMode={viewMode} />
    </div>
  )
}

function RangeInput({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="range-field">
      <span>{label}<strong>{value} {unit}</strong></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function Chart({
  data,
  xKey,
  lines,
  unit,
}: {
  data: Array<Record<string, number | string>>
  xKey: string
  lines: Array<{ key: string; color: string }>
  unit: string
}) {
  return (
    <ResponsiveContainer height={320}>
      <LineChart data={data}>
        <CartesianGrid stroke="oklch(0.25 0.02 250)" />
        <XAxis dataKey={xKey} stroke="oklch(0.65 0.02 250)" />
        <YAxis stroke="oklch(0.65 0.02 250)" />
        <Tooltip
          formatter={(value) => [`${Number(value).toExponential(3)} ${unit}`, 'Id']}
          contentStyle={{ background: 'oklch(0.17 0.02 250)', border: '1px solid oklch(0.25 0.02 250)' }}
        />
        {lines.map((line) => (
          <Line dataKey={line.key} stroke={line.color} dot={false} key={line.key} strokeWidth={2} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

function ParameterTable({
  rows,
  references = [],
}: {
  rows: Array<{
    label: string
    value: number | string | undefined
    unit: string
    source: string
    sourceIds?: string[]
    notes?: string
    conditions?: object
  }>
  references?: LiteratureSource[]
}) {
  return (
    <div className="parameter-table">
      {rows.map(({ label, value, unit, source, sourceIds, conditions }) => (
        <div key={label}>
          <span>
            {label}
            {sourceIds?.length ? <small>{formatSourceSummary(sourceIds, references)}</small> : null}
            {conditions ? <small>{formatConditions(conditions)}</small> : null}
          </span>
          <strong>
            {value === undefined ? 'missing' : `${formatParameterValue(value)} ${unit}`}
            <em className={`source-${source}`}>{source}</em>
          </strong>
        </div>
      ))}
    </div>
  )
}

function ParameterEditor({
  parameter,
  references,
  linkedReferences,
  onChange,
}: {
  parameter: MaterialParameter
  references: LiteratureSource[]
  linkedReferences: LiteratureSource[]
  onChange: (parameter: MaterialParameter) => void
}) {
  const sourceValue = parameter.sourceIds[0] ?? ''

  return (
    <div className="parameter-editor">
      <div className="parameter-editor-heading">
        <strong>{parameter.label}</strong>
        <ConfidenceBadge confidence={parameter.confidence} conflict={Boolean(parameter.candidates?.length && hasCandidateConflict(parameter))} />
      </div>
      <div className="form-grid-2">
        <label>
          Value type
          <select value={parameter.valueType} onChange={(event) => onChange({ ...parameter, valueType: event.target.value as MaterialParameter['valueType'] })}>
            <option value="scalar">scalar</option>
            <option value="range">range</option>
            <option value="text">text</option>
            <option value="unknown">unknown</option>
          </select>
        </label>
        <label>
          Confidence
          <select aria-label={`${parameter.key} confidence`} value={parameter.confidence} onChange={(event) => onChange({ ...parameter, confidence: event.target.value as ParameterConfidence })}>
            {confidenceOptions.map((confidence) => <option value={confidence} key={confidence}>{confidence}</option>)}
          </select>
        </label>
        <label>Value<input type="number" value={typeof parameter.value === 'number' ? parameter.value : ''} onChange={(event) => onChange({ ...parameter, value: event.target.value === '' ? null : Number(event.target.value), valueType: 'scalar' })} /></label>
        <label>Unit<input value={parameter.unit ?? ''} onChange={(event) => onChange({ ...parameter, unit: event.target.value })} /></label>
        <label>Range min<input type="number" value={parameter.range?.min ?? ''} onChange={(event) => onChange({ ...parameter, valueType: 'range', range: { ...parameter.range, min: event.target.value === '' ? undefined : Number(event.target.value) } })} /></label>
        <label>Range max<input type="number" value={parameter.range?.max ?? ''} onChange={(event) => onChange({ ...parameter, valueType: 'range', range: { ...parameter.range, max: event.target.value === '' ? undefined : Number(event.target.value) } })} /></label>
        <label>Typical<input type="number" value={parameter.range?.typical ?? ''} onChange={(event) => onChange({ ...parameter, valueType: 'range', range: { ...parameter.range, typical: event.target.value === '' ? undefined : Number(event.target.value) } })} /></label>
        <label>Selected value<input type="number" value={typeof parameter.selectedValue === 'number' ? parameter.selectedValue : ''} onChange={(event) => onChange({ ...parameter, selectedValue: event.target.value === '' ? null : Number(event.target.value) })} /></label>
        <label>Substrate<input value={parameter.conditions.substrate ?? ''} onChange={(event) => onChange({ ...parameter, conditions: { ...parameter.conditions, substrate: event.target.value } })} /></label>
        <label>Temperature K<input type="number" value={parameter.conditions.temperature_K ?? ''} onChange={(event) => onChange({ ...parameter, conditions: { ...parameter.conditions, temperature_K: event.target.value === '' ? undefined : Number(event.target.value) } })} /></label>
        <label>Measurement method<input value={parameter.conditions.measurementMethod ?? ''} onChange={(event) => onChange({ ...parameter, conditions: { ...parameter.conditions, measurementMethod: event.target.value } })} /></label>
        <label>Environment<input value={parameter.conditions.environment ?? ''} onChange={(event) => onChange({ ...parameter, conditions: { ...parameter.conditions, environment: event.target.value } })} /></label>
      </div>
      <label>
        Source reference
        <select aria-label={`${parameter.key} source reference`} value={sourceValue} onChange={(event) => onChange({ ...parameter, sourceIds: event.target.value ? [event.target.value] : [] })}>
          <option value="">No source</option>
          {references.map((reference) => <option value={reference.id} key={reference.id}>{reference.title}</option>)}
        </select>
      </label>
      <label>Notes<textarea value={parameter.notes ?? ''} onChange={(event) => onChange({ ...parameter, notes: event.target.value })} /></label>
      <div className="linked-source-list">
        {linkedReferences.length ? linkedReferences.map((reference) => (
          <span key={reference.id}>{reference.title}{reference.doi ? ` · ${reference.doi}` : ''}</span>
        )) : <span>No linked references</span>}
      </div>
      <CandidateEditor parameter={parameter} onChange={onChange} />
    </div>
  )
}

function CandidateEditor({ parameter, onChange }: { parameter: MaterialParameter; onChange: (parameter: MaterialParameter) => void }) {
  function updateCandidate(candidateId: string, patch: Partial<ParameterCandidate>) {
    onChange({
      ...parameter,
      candidates: (parameter.candidates ?? []).map((candidate) => candidate.id === candidateId ? { ...candidate, ...patch } : candidate),
    })
  }

  return (
    <div className="candidate-editor">
      <div>
        <strong>Candidate values</strong>
        <button className="manus-button ghost" type="button" onClick={() => onChange({
          ...parameter,
          candidates: [
            ...(parameter.candidates ?? []),
            {
              id: `${parameter.key}-candidate-${Date.now()}`,
              value: null,
              unit: parameter.unit,
              confidence: 'estimated',
              valueType: 'scalar',
              sourceIds: parameter.sourceIds,
              conditions: {},
              notes: '',
              selected: false,
            },
          ],
        })}>新增 candidate</button>
      </div>
      {(parameter.candidates ?? []).map((candidate) => (
        <div className="candidate-row" key={candidate.id}>
          <label className="toggle-field compact">
            <input type="radio" checked={candidate.selected === true} onChange={() => onChange({ ...parameter, candidates: (parameter.candidates ?? []).map((entry) => ({ ...entry, selected: entry.id === candidate.id })) })} />
            selected
          </label>
          <input aria-label={`${candidate.id} value`} type="number" value={typeof candidate.value === 'number' ? candidate.value : ''} onChange={(event) => updateCandidate(candidate.id, { value: event.target.value === '' ? null : Number(event.target.value), valueType: 'scalar' })} />
          <select value={candidate.confidence} onChange={(event) => updateCandidate(candidate.id, { confidence: event.target.value as ParameterConfidence })}>
            {confidenceOptions.map((confidence) => <option value={confidence} key={confidence}>{confidence}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}

function ReferenceEditor({
  reference,
  usages,
  onChange,
}: {
  reference: LiteratureSource
  usages: ReturnType<typeof getReferenceUsage>
  onChange: (reference: LiteratureSource) => void
}) {
  return (
    <div className="reference-editor">
      <label>Title<input value={reference.title} onChange={(event) => onChange({ ...reference, title: event.target.value })} /></label>
      <div className="form-grid-2">
        <label>Authors<input value={reference.authors} onChange={(event) => onChange({ ...reference, authors: event.target.value })} /></label>
        <label>Year<input type="number" value={reference.year} onChange={(event) => onChange({ ...reference, year: Number(event.target.value) })} /></label>
        <label>Journal<input value={reference.journal ?? ''} onChange={(event) => onChange({ ...reference, journal: event.target.value })} /></label>
        <label>DOI<input value={reference.doi ?? ''} onChange={(event) => onChange({ ...reference, doi: event.target.value })} /></label>
        <label>URL<input value={reference.url ?? ''} onChange={(event) => onChange({ ...reference, url: event.target.value })} /></label>
        <label>Status<select value={reference.status} onChange={(event) => onChange({ ...reference, status: event.target.value as LiteratureStatus })}>{referenceStatusOptions.map((status) => <option value={status} key={status}>{status}</option>)}</select></label>
        <label>Reliability score<input type="number" min={0} max={10} value={reference.reliabilityScore} onChange={(event) => onChange({ ...reference, reliabilityScore: Number(event.target.value) })} /></label>
      </div>
      <label>Notes<textarea value={reference.notes ?? ''} onChange={(event) => onChange({ ...reference, notes: event.target.value })} /></label>
      <div className="linked-source-list">
        <strong>Used by</strong>
        {usages.length ? usages.map((usage) => <span key={`${usage.materialId}-${usage.parameterKey}`}>{usage.materialName} · {usage.parameterLabel}</span>) : <span>No material parameters linked yet</span>}
      </div>
    </div>
  )
}

function ConfidenceBadge({ confidence, conflict = false }: { confidence: ParameterConfidence | 'fallback'; conflict?: boolean }) {
  return <span className={`confidence-badge confidence-${conflict ? 'conflict' : confidence}`}>{conflict ? 'conflict' : confidence}</span>
}

function PlaceholderGrid({ items }: { items: string[] }) {
  return (
    <div className="placeholder-grid">
      {items.map((item) => <div key={item}><Box size={16} /><span>{item}</span></div>)}
    </div>
  )
}

function formatNumber(value: number) {
  if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) {
    return value.toExponential(2)
  }

  return Number(value.toPrecision(4)).toString()
}

function formatParameterValue(value: number | string) {
  return typeof value === 'number' ? formatNumber(value) : value
}

function confidenceLabel(confidence: string | undefined) {
  if (confidence === 'known' || confidence === 'estimated') {
    return confidence
  }

  return 'missing'
}

function createOutputGateValues(carrierType: string, vth: number) {
  const threshold = Math.abs(vth)

  if (carrierType === 'p') {
    return [-(threshold + 0.5), -(threshold + 1), -(threshold + 1.5)]
  }

  if (carrierType === 'ambipolar') {
    return [-(threshold + 1), threshold + 1, threshold + 1.5]
  }

  return [threshold + 0.5, threshold + 1, threshold + 1.5]
}

function formatGateSeries(vg: number) {
  return `Vg ${vg.toFixed(1)}V`
}

function getMaterialParameter(material: Material, key: string): MaterialParameter | undefined {
  return getMaterialParameters(material).find(([parameterKey]) => parameterKey === key)?.[1]
}

function hasCandidateConflict(parameter: MaterialParameter) {
  const candidates = parameter.candidates ?? []
  if (candidates.length < 2) return false
  const values = candidates
    .map((candidate) => typeof candidate.value === 'number' ? candidate.value : candidate.range?.typical)
    .filter((value): value is number => value !== undefined && value > 0)
  if (values.length >= 2 && Math.max(...values) / Math.min(...values) > 2) return true
  return new Set(candidates.map((candidate) => candidate.confidence)).size > 1
}

function formatSourceSummary(sourceIds: string[], references: LiteratureSource[]) {
  return sourceIds
    .map((sourceId) => {
      const reference = references.find((entry) => entry.id === sourceId)
      return reference ? `${reference.title}${reference.doi ? ` · ${reference.doi}` : ''}` : sourceId
    })
    .join(', ')
}

function formatConditions(conditions: object) {
  const summary = Object.entries(conditions)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}: ${value}`)
    .join(' · ')
  return summary
}
