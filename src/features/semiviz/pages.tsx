import { useMemo, useState } from 'react'
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
  DeviceLayer,
  HypothesisStatus,
  Material,
  ProcessType,
} from '../../types/semiviz'

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
  const [viewMode, setViewMode] = useState('3D')
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
          {['3D', 'TOP', 'SIDE', 'EXPLODED'].map((mode) => (
            <button className={viewMode === mode ? 'active' : ''} key={mode} onClick={() => setViewMode(mode)}>
              {mode}
            </button>
          ))}
        </div>
        <div className={`large-device-stage ${viewMode.toLowerCase()}`}>
          {activeDevice.layers.length
            ? <LayerStackGraphic layers={activeDevice.layers} selectedId={selected?.id ?? ''} />
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
              onChange={(patch) => updateActiveDevice((device) => updateLayer(device, selected.id, patch))}
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
          </div>
        </Card>
        <Card title="Extracted parameters">
          <ParameterTable rows={[
            ...simulation.parameters.map((parameter) => ({
              label: parameter.label,
              value: parameter.value,
              unit: parameter.unit,
              source: parameter.source,
            })),
            { label: 'Cox', value: cox, unit: 'F/m²', source: cox === undefined ? 'missing' : 'derived' },
            { label: 'Eg', value: extracted.bandGap_eV, unit: 'eV', source: confidenceLabel(extracted.bandGapMeta?.confidence) },
            { label: 'χ', value: extracted.electronAffinity_eV, unit: 'eV', source: confidenceLabel(extracted.electronAffinityMeta?.confidence) },
            { label: 'contact φ', value: extracted.contactWorkFunction_eV, unit: 'eV', source: confidenceLabel(extracted.contactWorkFunctionMeta?.confidence) },
          ]} />
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
  const { project } = useProjectStore()
  const [query, setQuery] = useState('')
  const filtered = project.materials.filter((material) => material.displayName.toLowerCase().includes(query.toLowerCase()) || material.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <WorkspacePage title="Materials" icon={<Database size={18} />}>
      <div className="library-grid">
        <Card title="材料資料庫">
          <input className="manus-field" placeholder="搜尋材料" value={query} onChange={(event) => setQuery(event.target.value)} />
          {filtered.map((material) => <MaterialRow key={material.id} material={material} />)}
        </Card>
        <Card title="參數信心">
          <PlaceholderGrid items={filtered.slice(0, 6).map((material) => `${material.displayName} · ${material.workFunction_eV.confidence}`)} />
        </Card>
      </div>
    </WorkspacePage>
  )
}

export function ReferencesPage() {
  const { project } = useProjectStore()

  return (
    <WorkspacePage title="References" icon={<BookOpen size={18} />}>
      <Card title="文獻來源">
        {project.references.map((reference) => (
          <div className="paper-row" key={reference.id}>
            <strong>{reference.title}</strong>
            <span>{reference.authors} ({reference.year}) · score {reference.reliabilityScore}/10</span>
          </div>
        ))}
      </Card>
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

function WorkspacePage({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="manus-page workspace-page">
      <header className="workspace-heading">{icon}<h1>{title}</h1></header>
      {children}
      <div className="scroll-spacer" aria-hidden="true" />
    </div>
  )
}

function Card({ title, icon, className = '', children }: { title: string; icon?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={`manus-card ${className}`}>
      <header>{icon}{title}</header>
      <div className="manus-card-body">{children}</div>
    </section>
  )
}

function StatCard({ icon, label, value, suffix, tone }: { icon: React.ReactNode; label: string; value: string; suffix: string; tone: string }) {
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

function LayerStackGraphic({ layers, selectedId }: { layers: DeviceLayer[]; selectedId: string }) {
  const { project } = useProjectStore()

  return (
    <div className="layer-stack-graphic">
      {layers.map((layer, index) => (
        <span
          className={layer.id === selectedId ? 'selected' : ''}
          key={layer.id}
          style={{
            '--layer-color': findMaterial(project.materials, layer.materialId).color,
            '--layer-index': index,
          } as React.CSSProperties}
        >
          {layer.name}
        </span>
      ))}
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
}: {
  rows: Array<{
    label: string
    value: number | string | undefined
    unit: string
    source: string
  }>
}) {
  return (
    <div className="parameter-table">
      {rows.map(({ label, value, unit, source }) => (
        <div key={label}>
          <span>{label}</span>
          <strong>
            {value === undefined ? 'missing' : `${formatParameterValue(value)} ${unit}`}
            <em className={`source-${source}`}>{source}</em>
          </strong>
        </div>
      ))}
    </div>
  )
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
