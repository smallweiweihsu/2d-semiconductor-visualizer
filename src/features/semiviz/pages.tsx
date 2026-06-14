import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
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
import { BandDiagramPreview } from '../../components/semiviz/BandDiagramPreview'
import { formatEnergy } from '../../components/semiviz/bandDiagramFormatters'
import { DevicePreview } from '../../components/semiviz/DevicePreview'
import {
  ManusCallout,
  ManusAnalysisPanel,
  ManusChartCard,
  ManusChipSelector,
  ManusDetailHeader,
  ManusListRow,
  ManusMetadataGrid,
  ManusPreviewCard,
  ManusScoreDots,
  ManusSplitDetail,
  ManusStatusBadge,
  ManusSidePanel,
  ManusThreeColumnLayout,
} from '../../components/semiviz/ManusPrimitives'
import { LayerPropertyEditor } from './LayerPropertyEditor'
import { LayerStackPanel } from './LayerStackPanel'
import { findMaterial } from './materialUtils'
import { CollapsibleSection } from '../../components/common/CollapsibleSection'
import { SimulationConfigEditor } from './SimulationConfigEditor'
import {
  getGeometryWarning,
  normalizeDeviceZPositions,
  normalizeViewportLayers,
} from '../../visualization/viewportGeometry'
import {
  createElectricalMeasurement,
  inferColumnMappings,
  parseDelimitedText,
  type ColumnMappingState,
  type ParsedCsvTable,
} from '../../measurements/csvParser'
import {
  calculateElectricalMetrics,
  getMeasurementOverlayWarnings,
  toOverlaySeries,
} from '../../measurements/electricalMetrics'
import {
  calculateCox,
  calculateOutputCurve,
  calculateTransferCurve,
  extractDeviceParameters,
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
  ElectricalMeasurementColumnRole,
  ElectricalMeasurementPoint,
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
const measurementColumnRoles: ElectricalMeasurementColumnRole[] = ['ignore', 'Vg', 'Vd', 'Id', 'Ig', 'time', 'sweepDirection', 'temperature']
const voltageUnits = ['V', 'mV']
const currentUnits = ['A', 'mA', 'uA', 'nA', 'pA']
const ivDemoDefaults = {
  vd: 2,
  vgMin: -3,
  vgMax: 3,
  channelLength_um: 1,
  channelWidth_um: 2,
  mobility_cm2Vs: 50,
  vth: -1.5,
  rc_ohm: 1000,
}

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

function confidenceColor(c: string): string {
  if (c === 'known') return '#34d399'
  if (c === 'estimated') return '#fbbf24'
  return '#6b7280'
}
function confidenceZh(c: string): string {
  if (c === 'known') return '已知'
  if (c === 'estimated') return '估計'
  return '未知'
}
function layerParamCards(material: Material): { label: string; value: string; confidence: string }[] {
  const fmt = (param: MaterialParameter) => {
    const n = resolveParameterNumber(param)
    if (n === undefined) return '未知'
    return `${formatParameterValue(n)}${param.unit ? ' ' + param.unit : ''}`
  }
  return [
    { label: 'Band Gap', value: fmt(material.bandGap_eV), confidence: material.bandGap_eV.confidence },
    { label: 'Work Function', value: fmt(material.workFunction_eV), confidence: material.workFunction_eV.confidence },
    { label: 'Electron Affinity', value: fmt(material.electronAffinity_eV), confidence: material.electronAffinity_eV.confidence },
    { label: 'Dielectric Const.', value: fmt(material.dielectricConstant), confidence: material.dielectricConstant.confidence },
    { label: 'Mobility', value: fmt(material.mobility_cm2Vs), confidence: material.mobility_cm2Vs.confidence },
  ]
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
            <div className="layer-param-grid">
              {layerParamCards(material).map((card) => (
                <div className="layer-param-card" key={card.label}>
                  <span className="lp-label">{card.label}</span>
                  <strong className="lp-value">{card.value}</strong>
                  <span className="lp-conf"><i style={{ backgroundColor: confidenceColor(card.confidence) }} />{confidenceZh(card.confidence)}</span>
                </div>
              ))}
            </div>
            <div className="layer-geo">
              <div><span>厚度</span><strong>{selected.geometry.thickness_nm} nm</strong></div>
              <div><span>長度</span><strong>{selected.geometry.length_um} µm</strong></div>
              <div><span>寬度</span><strong>{selected.geometry.width_um} µm</strong></div>
            </div>
            {material.notes && material.notes.length ? (
              <ManusCallout tone="neutral">
                <strong>注意事項</strong>
                <ul className="layer-notes">{material.notes.map((note: string) => <li key={note}>{note}</li>)}</ul>
              </ManusCallout>
            ) : null}
            <CollapsibleSection title="編輯 layer 參數">
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
            </CollapsibleSection>
          </>
        ) : <EmptyState text="選取 active device 後，這裡會顯示 layer 參數。" />}
      </Card>
    </div>
  )
}

function processCategory(type: ProcessType): string {
  switch (type) {
    case 'exfoliation':
    case 'dry_transfer':
      return 'transfer'
    case 'metal_deposition':
    case 'thermal_evaporation':
    case 'ebeam_evaporation':
    case 'dielectric_deposition':
      return 'deposition'
    case 'rie':
      return 'etch'
    case 'oxidation':
      return 'oxidation'
    case 'annealing':
    case 'metal_diffusion':
      return 'thermal'
    case 'lithography':
      return 'litho'
    case 'liftoff':
      return 'liftoff'
    default:
      return 'measure'
  }
}

function ProcessStageVisual({ step }: { step: { type: ProcessType; order: number } }) {
  const category = processCategory(step.type)
  const layers = Math.min(Math.max(step.order, 1), 5)
  const layerColors = ['#22d3ee', '#a78bfa', '#38bdf8', '#f0abfc', '#34d399']
  const emitter: ReactNode = (() => {
    switch (category) {
      case 'deposition':
        return (
          <g>
            <rect x={186} y={28} width={28} height={14} rx={3} fill="#1f2937" stroke="#334155" />
            {[0, 1, 2, 3].map((i) => (
              <circle key={i} className="stage-particle" style={{ animationDelay: `${i * 0.4}s` }} cx={200 + (i - 1.5) * 10} cy={60} r={3} fill="#22d3ee" />
            ))}
          </g>
        )
      case 'etch':
        return (
          <g className="stage-pulse">
            {[0, 1, 2].map((i) => (
              <g key={i} stroke="#f472b6" strokeWidth={2}>
                <line x1={170 + i * 30} y1={50} x2={170 + i * 30} y2={120} />
                <path d={`M${165 + i * 30} 112 L${170 + i * 30} 122 L${175 + i * 30} 112`} fill="#f472b6" />
              </g>
            ))}
          </g>
        )
      case 'oxidation':
        return (
          <g>
            <ellipse cx={200} cy={196} rx={120} ry={16} fill="#fb923c" opacity={0.18} className="stage-pulse" />
            {[0, 1, 2, 3, 4].map((i) => (
              <circle key={i} className="stage-particle" style={{ animationDelay: `${i * 0.3}s` }} cx={150 + i * 25} cy={70} r={3} fill="#fb923c" />
            ))}
          </g>
        )
      case 'transfer':
        return (
          <g>
            <polygon points="150,90 250,78 256,96 156,108" fill="#a78bfa" opacity={0.85} />
            <path d="M200 112 L200 150" stroke="#a78bfa" strokeWidth={2} />
            <path d="M194 142 L200 154 L206 142" fill="#a78bfa" />
          </g>
        )
      case 'thermal':
        return (
          <g className="stage-pulse" stroke="#fb923c" strokeWidth={2} fill="none">
            <path d="M160 120 q10 -16 20 0 q10 16 20 0" />
            <path d="M210 120 q10 -16 20 0 q10 16 20 0" />
          </g>
        )
      case 'litho':
        return (
          <g>
            <polygon points="160,40 240,40 280,150 120,150" fill="#22d3ee" opacity={0.12} className="stage-pulse" />
            <rect x={150} y={150} width={100} height={10} fill="#334155" />
            <rect x={150} y={150} width={20} height={10} fill="#0a0f17" />
            <rect x={230} y={150} width={20} height={10} fill="#0a0f17" />
          </g>
        )
      case 'liftoff':
        return (
          <g>
            <polygon points="120,180 210,150 216,166 126,196" fill="#a78bfa" opacity={0.7} />
            <path d="M210 150 L226 130" stroke="#a78bfa" strokeWidth={2} />
            <path d="M222 142 L228 128 L214 132" fill="#a78bfa" />
          </g>
        )
      default:
        return (
          <g>
            <line className="stage-pulse" x1={200} y1={40} x2={200} y2={150} stroke="#22d3ee" strokeWidth={2} />
            <path d="M120 250 q30 -40 50 0 t50 -10 t50 12" fill="none" stroke="#22d3ee" strokeWidth={2} opacity={0.8} />
          </g>
        )
    }
  })()

  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="製程階段示意">
      <rect x={70} y={210} width={260} height={44} rx={6} fill="#202938" stroke="#334155" />
      <text x={200} y={278} textAnchor="middle" fill="#5b6677" fontSize={11}>substrate</text>
      {Array.from({ length: layers }).map((_, i) => (
        <rect
          key={i}
          x={84}
          y={206 - (i + 1) * 13}
          width={232}
          height={11}
          rx={2}
          fill={layerColors[i % layerColors.length]}
          opacity={0.55}
        />
      ))}
      {emitter}
    </svg>
  )
}

export function ProcessFlowPage() {
  const { project } = useProjectStore()
  const [selectedOrder, setSelectedOrder] = useState(8)
  const flow = project.processes[0]
  const selected = flow.steps.find((step) => step.order === selectedOrder) ?? flow.steps[0]

  return (
    <WorkspacePage title="製程流程" icon={<GitBranch size={18} />}>
      <div className="process-grid process-workspace">
        <Card title="製程步驟" className="process-timeline">
          {flow.steps.map((step) => (
            <ManusListRow
              active={step.order === selected.order}
              color={step.order === selected.order ? 'oklch(0.78 0.15 195)' : 'oklch(0.58 0.04 250)'}
              key={step.id}
              title={`${step.order}. ${processLabels[step.type]}`}
              subtitle={step.notes}
              meta={[step.tool, step.temperature, step.time].filter(Boolean).join(' · ')}
              badge={step.risk ? <ManusStatusBadge tone="warning">風險</ManusStatusBadge> : null}
              onClick={() => setSelectedOrder(step.order)}
            />
          ))}
        </Card>
        <section className="manus-card process-stage">
          <div className="manus-card-body">
            <div className="stage-canvas">
              <ProcessStageVisual step={selected} />
            </div>
            <p className="stage-caption">製程動畫預覽 — 選取步驟以查看對應的結構變化</p>
            <div className="stage-steps">
              {flow.steps.map((step) => (
                <button className={step.order === selected.order ? 'active' : ''} key={step.id} onClick={() => setSelectedOrder(step.order)}>{step.order}</button>
              ))}
            </div>
          </div>
        </section>
        <Card title="步驟參數" className="process-detail">
          <ManusDetailHeader
            title={processLabels[selected.type]}
            subtitle={selected.notes}
            badge={<ManusStatusBadge tone={selected.risk ? 'warning' : 'primary'}>{selected.risk ? '檢查風險' : '已規劃'}</ManusStatusBadge>}
          />
          <ManusMetadataGrid items={[
            { label: '機台', value: selected.tool ?? 'not specified' },
            { label: '時間', value: selected.time ?? 'not specified' },
            { label: '溫度', value: selected.temperature ?? 'room temp' },
            { label: '材料', value: selected.materialId ?? 'process dependent' },
          ]} />
          <ManusCallout tone="primary">
            <strong>預期結果</strong>
            <p>{selected.expectedResult ?? selected.notes ?? flow.description}</p>
          </ManusCallout>
          {selected.risk ? (
            <ManusCallout tone="warning">
              <strong>風險</strong>
              <p>{selected.risk}</p>
            </ManusCallout>
          ) : null}
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
  const [vd, setVd] = useState(ivDemoDefaults.vd)
  const [vgMin, setVgMin] = useState(ivDemoDefaults.vgMin)
  const [vgMax, setVgMax] = useState(ivDemoDefaults.vgMax)
  const [channelLength, setChannelLength] = useState(ivDemoDefaults.channelLength_um)
  const [channelWidth, setChannelWidth] = useState(ivDemoDefaults.channelWidth_um)
  const [vth, setVth] = useState(ivDemoDefaults.vth)
  const [mobilityOverrides, setMobilityOverrides] = useState<Record<string, number>>({})
  const [rc, setRc] = useState(ivDemoDefaults.rc_ohm)
  const [leakageFloor, setLeakageFloor] = useState(1e-12)
  const [currentUnit, setCurrentUnit] = useState<'A' | 'uA' | 'nA'>('uA')
  const [useFallbackValues, setUseFallbackValues] = useState(false)
  const electricalMeasurements = project.measurements.filter((measurement) => measurement.electrical)
  const [overlayMeasurementId, setOverlayMeasurementId] = useState('')
  const overlayMeasurement = electricalMeasurements.find((measurement) => measurement.id === overlayMeasurementId)
  const mobilityOverride = mobilityOverrides[activeDevice.id] ?? ivDemoDefaults.mobility_cm2Vs
  const extractedForModel = useMemo(
    () => ({
      ...extracted,
      length_um: channelLength,
      width_um: channelWidth,
      mobility_cm2Vs: mobilityOverride,
    }),
    [channelLength, channelWidth, extracted, mobilityOverride],
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
  const overlayData = toOverlaySeries(overlayMeasurement, currentUnit)
  const transferWithOverlay = mergeTransferOverlay(transferData, overlayData)
  const overlayWarnings = getMeasurementOverlayWarnings(overlayMeasurement, activeDevice.id, vd)
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
  const transferAbsCurrents = transferData.map((point) => Math.abs(point.id)).filter((value) => value > 0)
  const onOffRatio = transferAbsCurrents.length
    ? Math.max(...transferAbsCurrents) / Math.max(Math.min(...transferAbsCurrents), Number.EPSILON)
    : undefined
  function resetSimulationDemoValues() {
    setVd(ivDemoDefaults.vd)
    setVgMin(ivDemoDefaults.vgMin)
    setVgMax(ivDemoDefaults.vgMax)
    setChannelLength(ivDemoDefaults.channelLength_um)
    setChannelWidth(ivDemoDefaults.channelWidth_um)
    setVth(ivDemoDefaults.vth)
    setRc(ivDemoDefaults.rc_ohm)
    setMobilityOverrides((current) => ({ ...current, [activeDevice.id]: ivDemoDefaults.mobility_cm2Vs }))
  }

  useEffect(() => {
    function handleResetSimulationDemoValues() {
      setVd(ivDemoDefaults.vd)
      setVgMin(ivDemoDefaults.vgMin)
      setVgMax(ivDemoDefaults.vgMax)
      setChannelLength(ivDemoDefaults.channelLength_um)
      setChannelWidth(ivDemoDefaults.channelWidth_um)
      setVth(ivDemoDefaults.vth)
      setRc(ivDemoDefaults.rc_ohm)
      setMobilityOverrides((current) => ({ ...current, [activeDevice.id]: ivDemoDefaults.mobility_cm2Vs }))
    }

    window.addEventListener('semiviz:reset-simulation-demo-values', handleResetSimulationDemoValues)
    return () => window.removeEventListener('semiviz:reset-simulation-demo-values', handleResetSimulationDemoValues)
  }, [activeDevice.id])

  return (
    <WorkspacePage title="I–V Simulator" icon={<Activity size={18} />}>
      <ManusThreeColumnLayout
        className="iv-simulator-workspace"
        left={(
          <ManusSidePanel title="模擬參數" subtext={<ManusStatusBadge tone="primary">Simplified MOSFET Model</ManusStatusBadge>}>
            <div className="compact-control-stack" data-testid="iv-simulation-controls">
              <RangeInput label="Vd max" value={vd} min={0.05} max={5} step={0.05} unit="V" onChange={setVd} />
              <RangeInput label="Vg min" value={vgMin} min={-5} max={vgMax - 0.1} step={0.1} unit="V" onChange={setVgMin} />
              <RangeInput label="Vg max" value={vgMax} min={vgMin + 0.1} max={5} step={0.1} unit="V" onChange={setVgMax} />
              <RangeInput label="Channel L" value={channelLength} min={0.1} max={10} step={0.1} unit="µm" onChange={setChannelLength} />
              <RangeInput label="Channel W" value={channelWidth} min={0.1} max={20} step={0.1} unit="µm" onChange={setChannelWidth} />
              <RangeInput
                label="Mobility"
                value={mobilityOverride}
                min={0}
                max={300}
                step={1}
                unit="cm²/V·s"
                onChange={(value) => setMobilityOverrides((current) => ({ ...current, [activeDevice.id]: value }))}
              />
              <RangeInput label="Vth" value={vth} min={-3} max={3} step={0.05} unit="V" onChange={setVth} />
              <RangeInput label="Rc" value={rc} min={0} max={100000} step={100} unit="Ω" onChange={setRc} />
              <button className="manus-button ghost simulation-reset-button" type="button" onClick={resetSimulationDemoValues}>Reset simulation demo values</button>
              <details className="secondary-editor">
                <summary>Advanced model controls</summary>
                <label className="toggle-field compact">
                  <input type="checkbox" checked={useFallbackValues} onChange={(event) => setUseFallbackValues(event.target.checked)} />
                  Use fallback values for prototype preview
                </label>
                <RangeInput label="Leakage floor" value={leakageFloor} min={1e-13} max={1e-8} step={1e-13} unit="A" onChange={setLeakageFloor} />
                <label className="device-select-field">
                  Current unit
                  <select value={currentUnit} onChange={(event) => setCurrentUnit(event.target.value as 'A' | 'uA' | 'nA')}>
                    <option value="A">A</option>
                    <option value="uA">µA</option>
                    <option value="nA">nA</option>
                  </select>
                </label>
                <label className="device-select-field">
                  Measurement overlay
                  <select value={overlayMeasurementId} onChange={(event) => setOverlayMeasurementId(event.target.value)}>
                    <option value="">none</option>
                    {electricalMeasurements.map((measurement) => <option value={measurement.id} key={measurement.id}>{measurement.sampleName}</option>)}
                  </select>
                </label>
              </details>
            </div>
          </ManusSidePanel>
        )}
        center={(
          <div className="iv-chart-stack" data-testid="iv-chart-stack">
            <ManusChartCard title={<>I<sub>d</sub> – V<sub>g</sub> Transfer Curve</>} badge={<ManusStatusBadge tone="primary">simulated</ManusStatusBadge>}>
              {chartDisabled ? <DisabledChart missing={simulation.missing} /> : (
                <>
                  {simulation.status === 'fallback_preview' ? <div className="prototype-warning"><AlertTriangle size={14} />Prototype preview using fallback values, not calibrated.</div> : null}
                  <Chart
                    data={transferWithOverlay}
                    xKey="vg"
                    unit={currentUnit}
                    lines={[
                      { key: 'id', color: 'oklch(0.78 0.15 195)' },
                      ...(overlayMeasurement ? [{ key: 'measuredId', color: 'oklch(0.74 0.18 55)' }] : []),
                    ]}
                  />
                </>
              )}
            </ManusChartCard>
            <ManusChartCard title={<>I<sub>d</sub> – V<sub>d</sub> Output Curves</>} badge={<ManusStatusBadge tone="primary">simulated</ManusStatusBadge>}>
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
            </ManusChartCard>
            <details className="secondary-editor iv-secondary-info">
              <summary>Active device and extracted parameters</summary>
              <div className="summary-stack">
                <h2>{activeDevice.name}</h2>
                <p>{activeDevice.description}</p>
                <Meta label="Channel" value={extracted.channelMaterial?.displayName ?? 'missing'} />
                <Meta label="Gate dielectric" value={extracted.dielectricMaterial?.displayName ?? 'missing'} />
                <Meta label="Contacts" value={extracted.contactMaterials.map((material) => material.displayName).join(', ') || 'missing'} />
                <Meta label="Carrier type" value={extracted.carrierType} />
              </div>
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
            </details>
          </div>
        )}
        right={(
          <ManusAnalysisPanel title="分析結果">
            <div data-testid="iv-analysis-panel">
              <ParameterTable rows={[
                { label: 'Threshold Voltage', value: vth, unit: 'V', source: 'estimated' },
                { label: 'Mobility', value: mobilityOverride, unit: 'cm²/V·s', source: 'estimated' },
                { label: 'Contact Resistance', value: rc, unit: 'Ω', source: 'estimated' },
                { label: 'Channel Length', value: channelLength, unit: 'µm', source: 'estimated' },
                { label: 'On/Off Ratio', value: onOffRatio ? onOffRatio.toExponential(2) : undefined, unit: '', source: onOffRatio ? 'derived' : 'missing' },
                { label: 'SS', value: 'prototype', unit: '', source: 'estimated' },
              ]} references={project.references} />
              <div className={`status-pill status-${simulation.status}`}>{simulationStatusLabels[simulation.status]}</div>
              {simulation.status === 'fallback_preview' ? (
                <div className="simulation-status-note warning">Using fallback values because project parameters are missing. Go to Materials to review parameters or reset local project.</div>
              ) : null}
              {simulation.status === 'ready_with_estimates' ? (
                <div className="simulation-status-note estimate">Simulation uses estimated seed parameters. Replace with reviewed literature before quantitative use.</div>
              ) : null}
              {overlayWarnings.length ? <div className="warning-list">{overlayWarnings.map((warning) => <div key={warning}><AlertTriangle size={14} />{warning}</div>)}</div> : null}
              {extracted.missing.length || simulation.missing.length || simulation.warnings.length ? (
                <div className="warning-list">
                  {[...new Set([...simulation.warnings, ...extracted.missing, ...simulation.missing])].map((item) => <div key={item}><AlertTriangle size={14} />{item}</div>)}
                </div>
              ) : <ManusCallout tone="primary"><strong>Ready</strong><p>Active device 已具備 MVP 模型需要的主要參數。</p></ManusCallout>}
              <ManusCallout tone="neutral">
                <strong>Model assumptions</strong>
                <p>Long-channel MOSFET prototype model with Cox = ε0k/tox and simplified Rc current limiting.</p>
              </ManusCallout>
            </div>
          </ManusAnalysisPanel>
        )}
      />
    </WorkspacePage>
  )
}

export function BandDiagramPage() {
  const { project } = useProjectStore()
  const metals = ['pd', 'ti', 'in'].map((id) => findMaterial(project.materials, id))
  const semiconductors = ['wse2', 'mos2'].map((id) => findMaterial(project.materials, id))
  const [metalId, setMetalId] = useState('pd')
  const [semiconductorId, setSemiconductorId] = useState('wse2')
  const [mode, setMode] = useState<'after' | 'before'>('after')
  const metal = findMaterial(project.materials, metalId)
  const semiconductor = findMaterial(project.materials, semiconductorId)
  const metalPhi = resolveParameterNumber(metal.workFunction_eV)
  const affinity = resolveParameterNumber(semiconductor.electronAffinity_eV)
  const bandGap = resolveParameterNumber(semiconductor.bandGap_eV)
  const nBarrier = metalPhi !== undefined && affinity !== undefined ? Math.max(0, metalPhi - affinity) : undefined
  const pBarrier = bandGap !== undefined && nBarrier !== undefined ? Math.max(0, bandGap - nBarrier) : undefined

  return (
    <WorkspacePage title="Band Diagram" icon={<BarChart3 size={18} />}>
      <ManusThreeColumnLayout
        className="band-diagram-workspace"
        left={(
          <ManusSidePanel title="材料選擇">
            <section>
              <h3>接觸金屬</h3>
              {metals.map((entry) => (
                <ManusListRow
                  active={entry.id === metalId}
                  color={entry.color}
                  key={entry.id}
                  title={entry.displayName}
                  meta={`φ=${formatParameterValue(resolveParameterNumber(entry.workFunction_eV) ?? 'unknown')} eV`}
                  onClick={() => setMetalId(entry.id)}
                />
              ))}
            </section>
            <section>
              <h3>半導體</h3>
              {semiconductors.map((entry) => (
                <ManusListRow
                  active={entry.id === semiconductorId}
                  color={entry.color}
                  key={entry.id}
                  title={entry.displayName}
                  subtitle={`χ=${formatParameterValue(resolveParameterNumber(entry.electronAffinity_eV) ?? 'unknown')} eV`}
                  meta={`Eg=${formatParameterValue(resolveParameterNumber(entry.bandGap_eV) ?? 'unknown')} eV`}
                  onClick={() => setSemiconductorId(entry.id)}
                />
              ))}
            </section>
            <section>
              <h3>顯示模式</h3>
              <div className="segmented-vertical">
                <button className={mode === 'after' ? 'active' : ''} type="button" onClick={() => setMode('after')}>After Contact (Band Bending)</button>
                <button className={mode === 'before' ? 'active' : ''} type="button" onClick={() => setMode('before')}>Before Contact (Flat Band)</button>
              </div>
            </section>
          </ManusSidePanel>
        )}
        center={(
          <ManusChartCard title={`Energy Band Diagram: ${metal.displayName} / ${semiconductor.displayName}`} badge={<ManusStatusBadge tone="primary">{mode === 'after' ? 'after contact' : 'before contact'}</ManusStatusBadge>}>
            <BandDiagramPreview mode={mode} />
          </ManusChartCard>
        )}
        right={(
          <ManusAnalysisPanel title="能帶參數">
            <div className="band-analysis-cards" data-testid="band-energy-panel">
              <section>
                <h3>Schottky Barrier</h3>
                <Meta label="φ_Bn (n-type)" value={`${formatBandValue(nBarrier)} eV`} />
                <Meta label="φ_Bp (p-type)" value={`${formatBandValue(pBarrier)} eV`} />
              </section>
              <section>
                <h3>Metal: {metal.displayName}</h3>
                <Meta label="Work Function" value={`${formatBandValue(metalPhi)} eV`} />
              </section>
              <section>
                <h3>Semiconductor: {semiconductor.displayName}</h3>
                <Meta label="Electron Affinity" value={`${formatBandValue(affinity)} eV`} />
                <Meta label="Band Gap" value={`${formatBandValue(bandGap)} eV`} />
              </section>
              <ManusCallout tone="warning">
                <strong>注意</strong>
                <p>此為簡化能帶圖，未考慮 Fermi-level pinning、MIGS 效應與介面態密度。</p>
              </ManusCallout>
            </div>
          </ManusAnalysisPanel>
        )}
      />
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
      <ManusSplitDetail
        className="materials-workspace"
        list={(
          <>
            <div className="split-panel-heading">
              <h2>材料資料庫</h2>
            </div>
          <input className="manus-field" placeholder="搜尋材料" value={query} onChange={(event) => setQuery(event.target.value)} />
          {filtered.map((material) => (
              <ManusListRow
                active={material.id === selected?.id}
                color={material.color}
                key={material.id}
                title={material.displayName}
                subtitle={material.description}
                badge={<ManusStatusBadge>{materialCategoryLabel(material.category)}</ManusStatusBadge>}
                onClick={() => setSelectedId(material.id)}
              />
          ))}
          </>
        )}
        detail={selected ? (
            <div className="material-detail-panel">
              <ManusDetailHeader
                title={selected.displayName}
                subtitle={selected.description}
                badge={<ManusStatusBadge tone="primary">{materialCategoryLabel(selected.category)}</ManusStatusBadge>}
                icon={<span className="material-monogram" style={{ backgroundColor: selected.color }}>{selected.displayName.slice(0, 2)}</span>}
              />
              <section>
                <h3>材料參數</h3>
                <div className="material-parameter-grid">
                  {getMaterialParameters(selected).slice(0, 7).map(([key, parameter]) => (
                    <button className={selectedParameterKey === key ? 'material-parameter-card active' : 'material-parameter-card'} type="button" key={key} onClick={() => setSelectedParameterKey(key)}>
                      <span>{parameter.label}</span>
                      <strong>{formatMaterialParameter(parameter)}</strong>
                      <ConfidenceBadge confidence={parameter.confidence} conflict={Boolean(parameter.candidates?.length && hasCandidateConflict(parameter))} />
                    </button>
                  ))}
                </div>
              </section>
              <section className="raman-notes">
                <h3>Raman Peaks</h3>
                <code>{selected.id === 'wse2' ? '250 cm⁻¹ (E2g), 260 cm⁻¹ (A1g)' : selected.notes[0] ?? '待補材料光譜資料'}</code>
              </section>
              <section className="note-list">
                <h3>注意事項</h3>
                {(selected.notes.length ? selected.notes : ['層數、缺陷、接觸金屬與製程會影響電性。']).map((note) => <p key={note}>• {note}</p>)}
              </section>
              <details className="secondary-editor" open>
                <summary>Edit material parameters</summary>
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
              </details>
            </div>
          ) : <EmptyState text="選擇 material 後可編輯參數。" />}
      />
    </WorkspacePage>
  )
}

export function ReferencesPage() {
  const { project, addReference, updateReference } = useProjectStore()
  const [selectedId, setSelectedId] = useState(project.references[0]?.id ?? '')
  const selected = project.references.find((reference) => reference.id === selectedId) ?? project.references[0]

  return (
    <WorkspacePage title="References" icon={<BookOpen size={18} />}>
      <ManusSplitDetail
        className="references-workspace"
        list={(
          <>
            <div className="split-panel-heading">
              <div>
                <h2>文獻來源</h2>
                <p>{project.references.length} papers</p>
              </div>
              <button className="panel-icon-button" type="button" onClick={() => setSelectedId(addReference().id)} aria-label="新增 reference"><Plus size={16} /></button>
            </div>
            {project.references.map((reference) => (
              <ManusListRow
                active={reference.id === selected?.id}
                icon={<BookOpen size={16} />}
                key={reference.id}
                title={reference.title}
                subtitle={`${reference.authors} (${reference.year})`}
                meta={<>Score: {reference.reliabilityScore}/10</>}
                badge={<ManusStatusBadge tone={reference.status === 'accepted' ? 'success' : 'primary'}>{reference.status}</ManusStatusBadge>}
                onClick={() => setSelectedId(reference.id)}
              />
            ))}
          </>
        )}
        detail={selected ? (
          <div className="reference-detail-panel">
            <ManusDetailHeader
              title={selected.title}
              subtitle={`${selected.authors} · ${selected.year}${selected.journal ? ` · ${selected.journal}` : ''}`}
              badge={<ManusStatusBadge tone={selected.status === 'accepted' ? 'success' : 'primary'}>{selected.status}</ManusStatusBadge>}
              icon={<BookOpen size={22} />}
            />
            <ManusMetadataGrid items={[
              { label: 'DOI', value: selected.doi ? <a href={`https://doi.org/${selected.doi}`} target="_blank" rel="noreferrer">{selected.doi}</a> : 'not provided' },
              { label: 'URL', value: selected.url ? <a href={selected.url} target="_blank" rel="noreferrer">open source</a> : 'not provided' },
              { label: '相關材料', value: selected.material ?? 'multiple / TBD' },
              { label: '提取參數', value: selected.parameterExtracted ?? 'review required' },
            ]} />
            <section className="reference-score-panel">
              <span>Reliability score</span>
              <ManusScoreDots score={selected.reliabilityScore} />
              <strong>{selected.reliabilityScore}/10</strong>
            </section>
            <ManusCallout tone="neutral">
              <strong>Review notes</strong>
              <p>{selected.notes ?? 'No review notes yet.'}</p>
            </ManusCallout>
            <div className="linked-source-list">
              <strong>Used by</strong>
              {getReferenceUsage(project, selected.id).length ? getReferenceUsage(project, selected.id).map((usage) => <span key={`${usage.materialId}-${usage.parameterKey}`}>{usage.materialName} · {usage.parameterLabel}</span>) : <span>No material parameters linked yet</span>}
            </div>
            <details className="secondary-editor">
              <summary>Edit reference</summary>
              <ReferenceEditor
                reference={selected}
                usages={getReferenceUsage(project, selected.id)}
                onChange={(reference) => updateReference(selected.id, () => reference)}
              />
            </details>
          </div>
        ) : <EmptyState text="新增或選擇 reference。" />}
      />
    </WorkspacePage>
  )
}

export function MeasurementsPage() {
  const { project, activeDevice, addMeasurement } = useProjectStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [table, setTable] = useState<ParsedCsvTable>()
  const [sourceName, setSourceName] = useState('')
  const [mappings, setMappings] = useState<ColumnMappingState>({})
  const [selectedMeasurementId, setSelectedMeasurementId] = useState(project.measurements.find((measurement) => measurement.electrical)?.id ?? project.measurements[0]?.id ?? '')
  const selected = project.measurements.find((measurement) => measurement.id === selectedMeasurementId) ?? project.measurements.find((measurement) => measurement.electrical) ?? project.measurements[0]
  const metrics = calculateElectricalMetrics(selected)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return
    const parsed = parseDelimitedText(await file.text())
    setSourceName(file.name)
    setTable(parsed)
    setMappings(inferColumnMappings(parsed.headers))
    event.currentTarget.value = ''
  }

  function saveImport() {
    if (!table) return
    const measurement = createElectricalMeasurement({
      table,
      mappings,
      activeDeviceId: activeDevice.id,
      activeDeviceName: activeDevice.name,
      sourceName,
    })
    addMeasurement(measurement)
    setSelectedMeasurementId(measurement.id)
    setTable(undefined)
  }

  return (
    <WorkspacePage title="Measurements" icon={<FlaskConical size={18} />}>
      <input ref={inputRef} className="sr-only" type="file" accept=".csv,.txt,text/csv,text/plain" onChange={(event) => { void handleFile(event) }} />
      <ManusSplitDetail
        className="measurements-workspace"
        list={(
          <>
            <div className="split-panel-heading">
              <div>
                <h2>量測資料</h2>
                <p>{project.measurements.length} datasets</p>
              </div>
            </div>
            {project.measurements.map((measurement) => (
              <ManusListRow
                active={measurement.id === selected?.id}
                color={measurement.electrical ? 'oklch(0.78 0.15 195)' : 'oklch(0.72 0.16 290)'}
                key={measurement.id}
                title={measurement.sampleName}
                subtitle={measurement.notes ?? measurement.deviceName}
                meta={measurement.date}
                badge={<ManusStatusBadge>{measurement.electrical?.measurementKind ?? measurement.type}</ManusStatusBadge>}
                onClick={() => setSelectedMeasurementId(measurement.id)}
              />
            ))}
          </>
        )}
        detail={(
          <div className="measurement-detail-panel">
            {selected ? (
              <>
                <ManusDetailHeader
                  title={`${selected.sampleName} — ${selected.type.toUpperCase()}`}
                  subtitle={selected.deviceName}
                  badge={<ManusStatusBadge tone={selected.electrical ? 'primary' : 'neutral'}>{selected.electrical?.measurementKind ?? selected.type}</ManusStatusBadge>}
                  icon={<FlaskConical size={22} />}
                />
                <ManusMetadataGrid items={[
                  { label: '日期', value: selected.date },
                  { label: '操作者', value: selected.operator ?? 'not specified' },
                  { label: '儀器', value: selected.tool ?? 'not specified' },
                  { label: 'Device', value: selected.deviceName },
                ]} />
                <section>
                  <h3>備註</h3>
                  <p>{selected.notes ?? 'No notes yet.'}</p>
                </section>
                <ManusPreviewCard>
                  {selected.electrical ? (
                    <Chart
                      data={selected.electrical.points.filter((point) => point.Vg !== undefined && point.Id !== undefined).map((point) => ({ vg: point.Vg!, id: (point.Id ?? 0) * 1e6 }))}
                      xKey="vg"
                      unit="uA"
                      lines={[{ key: 'id', color: 'oklch(0.78 0.15 195)' }]}
                    />
                  ) : <div className="measurement-visual-placeholder">量測數據視覺化區域 — 可匯入 CSV/Excel 資料</div>}
                </ManusPreviewCard>
                <div className="metrics-grid">
                  <Meta label="points" value={`${metrics.pointCount}`} />
                  <Meta label="max |Id|" value={formatScientific(metrics.maxAbsId_A, 'A')} />
                  <Meta label="on/off" value={metrics.onOffRatio ? metrics.onOffRatio.toExponential(2) : 'n/a'} />
                  <Meta label="Vg range" value={metrics.vgRange ? `${metrics.vgRange[0]} to ${metrics.vgRange[1]} V` : 'n/a'} />
                </div>
                {selected.electrical ? <RawMeasurementTable rows={selected.electrical.points.slice(0, 12)} /> : null}
              </>
            ) : <EmptyState text="尚未建立 measurement dataset。" />}
            <details className="secondary-editor" open>
              <summary>CSV / TXT import</summary>
              <button className="manus-button primary" type="button" onClick={() => inputRef.current?.click()}>Import electrical CSV</button>
              {table ? (
                <div className="import-preview">
                  <strong>{sourceName}</strong>
                  <div className="mapping-grid">
                    {table.headers.map((header) => (
                      <div className="mapping-row" key={header}>
                        <span>{header}</span>
                        <select value={mappings[header]?.role ?? 'ignore'} onChange={(event) => setMappings((current) => ({ ...current, [header]: { ...current[header], role: event.target.value as ElectricalMeasurementColumnRole } }))}>
                          {measurementColumnRoles.map((role) => <option value={role} key={role}>{role}</option>)}
                        </select>
                        <select value={mappings[header]?.unit ?? ''} onChange={(event) => setMappings((current) => ({ ...current, [header]: { ...current[header], unit: event.target.value } }))}>
                          <option value="">unit</option>
                          {[...voltageUnits, ...currentUnits].map((unit) => <option value={unit} key={unit}>{unit}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <button className="manus-button primary" type="button" onClick={saveImport}>Save measurement</button>
                </div>
              ) : <EmptyState text="匯入 Id-Vg / Id-Vd CSV 或 TXT 後可設定欄位對應與單位。" />}
            </details>
          </div>
        )}
      />
    </WorkspacePage>
  )
}

export function ComparisonLabPage() {
  const { project } = useProjectStore()
  const [selectedIds, setSelectedIds] = useState<string[]>(['wse2', 'mos2', 'pd', 'ti'])
  const compared = selectedIds.map((id) => findMaterial(project.materials, id))
  const comparisonRows = [
    ['Band Gap', 'bandGap_eV'],
    ['Work Function', 'workFunction_eV'],
    ['Electron Affinity', 'electronAffinity_eV'],
    ['Dielectric Constant', 'dielectricConstant'],
    ['Mobility', 'mobility_cm2Vs'],
    ['Lattice Constant', 'latticeConstant_A'],
    ['Default Thickness', 'defaultThickness_nm'],
  ] as const

  return (
    <WorkspacePage title="Comparison Lab" icon={<GitCompare size={18} />}>
      <div className="comparison-workspace">
        <Card title="選擇比較材料">
          <ManusChipSelector
            items={project.materials.map((material) => ({ id: material.id, label: material.displayName, color: material.color, meta: materialCategoryLabel(material.category) }))}
            selected={selectedIds}
            onToggle={(id) => setSelectedIds((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id].slice(-5))}
          />
        </Card>
        <Card title="參數比較表">
          <div className="comparison-table" data-testid="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Parameter</th>
                  {compared.map((material) => <th key={material.id}><span style={{ backgroundColor: material.color }} />{material.displayName}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([label, key]) => (
                  <tr key={key}>
                    <td>{label}</td>
                    {compared.map((material) => {
                      const parameter = material[key]
                      return (
                        <td key={`${material.id}-${key}`}>
                          <strong>{formatMaterialParameter(parameter)}</strong>
                          <ConfidenceBadge confidence={parameter.confidence} />
                        </td>
                      )
                    })}
                  </tr>
                ))}
                <tr>
                  <td>Category</td>
                  {compared.map((material) => <td key={`${material.id}-category`}><ManusStatusBadge>{materialCategoryLabel(material.category)}</ManusStatusBadge></td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <div className="confidence-legend">
            <span><i className="known" />Known</span>
            <span><i className="estimated" />Estimated</span>
            <span><i className="unknown" />Unknown</span>
          </div>
        </Card>
      </div>
    </WorkspacePage>
  )
}

export function ResearchNotesPage() {
  const { project } = useProjectStore()
  const [selectedId, setSelectedId] = useState(project.hypotheses[0].id)
  const selected = project.hypotheses.find((hypothesis) => hypothesis.id === selectedId) ?? project.hypotheses[0]

  return (
    <div className="manus-page research-notes-page">
      <ManusSplitDetail
        className="research-workspace"
        list={(
          <>
            <div className="split-panel-heading">
              <div><h2>研究假說</h2><p>{project.hypotheses.length} hypotheses</p></div>
              <button className="panel-icon-button" aria-label="新增研究假說"><Plus size={18} /></button>
            </div>
            {project.hypotheses.map((hypothesis) => (
              <ManusListRow
                active={hypothesis.id === selected.id}
                icon={<Lightbulb size={16} />}
                key={hypothesis.id}
                title={hypothesis.title}
                subtitle={<ManusStatusBadge tone={hypothesis.status === 'confirmed' ? 'success' : hypothesis.status === 'rejected' ? 'danger' : 'primary'}>{statusLabels[hypothesis.status]}</ManusStatusBadge>}
                meta={hypothesis.createdAt}
                onClick={() => setSelectedId(hypothesis.id)}
              />
            ))}
          </>
        )}
        detail={(
          <section className="hypothesis-detail">
            <ManusDetailHeader
              icon={<Lightbulb size={24} />}
              title={selected.title}
              subtitle={selected.createdAt}
              badge={<ManusStatusBadge tone={selected.status === 'confirmed' ? 'success' : selected.status === 'rejected' ? 'danger' : 'primary'}>{statusLabels[selected.status]}</ManusStatusBadge>}
            />
            <div className="detail-section">
              <small>描述</small>
              <p>{selected.description}</p>
            </div>
            <div className="linked-panels">
              <div><span>相關元件</span><strong>0 linked</strong></div>
              <div><span>相關文獻</span><strong>0 linked</strong></div>
            </div>
            <div className="research-empty-note">
              <p>把材料參數、製程 step、量測 dataset 與文獻來源連結到此假說後，可作為下一步 review queue。</p>
            </div>
            <div className="scroll-spacer" aria-hidden="true" />
          </section>
        )}
      />
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
        <CartesianGrid stroke="oklch(0.34 0.07 245 / 0.34)" />
        <XAxis dataKey={xKey} stroke="oklch(0.65 0.02 250)" tickFormatter={formatTickValue} />
        <YAxis stroke="oklch(0.65 0.02 250)" tickFormatter={formatTickValue} />
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

function formatTickValue(value: number | string) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return String(value)
  if (Math.abs(numeric) >= 1000 || (Math.abs(numeric) > 0 && Math.abs(numeric) < 0.001)) {
    return numeric.toExponential(1)
  }
  return Number(numeric.toFixed(2)).toString()
}

function mergeTransferOverlay(
  simulated: Array<{ vg: number; id: number; region: string }>,
  measured: Array<{ vg: number; measuredId: number }>,
) {
  const rows = new Map<number, Record<string, number | string>>()
  simulated.forEach((point) => rows.set(point.vg, { ...rows.get(point.vg), ...point }))
  measured.forEach((point) => rows.set(point.vg, { ...rows.get(point.vg), ...point }))
  return [...rows.values()].sort((a, b) => Number(a.vg) - Number(b.vg))
}

function RawMeasurementTable({ rows }: { rows: ElectricalMeasurementPoint[] }) {
  return (
    <div className="raw-table">
      <table>
        <thead><tr><th>Vg</th><th>Vd</th><th>Id</th><th>Ig</th><th>direction</th></tr></thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.Vg}-${row.Vd}-${index}`}>
              <td>{formatMaybe(row.Vg)}</td>
              <td>{formatMaybe(row.Vd)}</td>
              <td>{formatScientific(row.Id, 'A')}</td>
              <td>{formatScientific(row.Ig, 'A')}</td>
              <td>{row.sweepDirection ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function resolveParameterNumber(parameter: MaterialParameter) {
  if (parameter.confidence === 'unknown') return undefined
  if (typeof parameter.selectedValue === 'number') return parameter.selectedValue
  if (typeof parameter.value === 'number') return parameter.value
  if (parameter.range?.typical !== undefined) return parameter.range.typical
  if (parameter.range?.min !== undefined && parameter.range?.max !== undefined) {
    return (parameter.range.min + parameter.range.max) / 2
  }
  return undefined
}

function formatBandValue(value: number | undefined) {
  return value === undefined ? 'missing' : formatEnergy(value)
}

function formatMaterialParameter(parameter: MaterialParameter) {
  if (parameter.valueType === 'unknown' || parameter.confidence === 'unknown') {
    return '未知'
  }
  if (parameter.valueType === 'range' && parameter.range?.min !== undefined && parameter.range?.max !== undefined) {
    return `${formatParameterValue(parameter.range.min)}–${formatParameterValue(parameter.range.max)} ${parameter.unit ?? ''}`.trim()
  }
  const value = parameter.selectedValue ?? parameter.value ?? parameter.range?.typical
  return value === undefined || value === null ? 'missing' : `${formatParameterValue(value)} ${parameter.unit ?? ''}`.trim()
}

function materialCategoryLabel(category: MaterialCategory) {
  return category.replaceAll('_', ' ')
}

function formatMaybe(value?: number) {
  return value === undefined ? '' : Number(value.toPrecision(4)).toString()
}

function formatScientific(value: number | undefined, unit: string) {
  return value === undefined ? 'n/a' : `${value.toExponential(2)} ${unit}`
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
