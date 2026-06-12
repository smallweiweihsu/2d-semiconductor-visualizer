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
import {
  calculateCox,
  calculateOutputCurve,
  calculateTransferCurve,
  extractDeviceParameters,
  scaleCurrent,
} from '../../simulation/mosfet'
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
  const { project, activeDevice, setActiveDeviceId } = useProjectStore()
  const [selectedId, setSelectedId] = useState(activeDevice.layers[2]?.id ?? activeDevice.layers[0]?.id ?? '')
  const [viewMode, setViewMode] = useState('3D')
  const selected = activeDevice.layers.find((layer) => layer.id === selectedId) ?? activeDevice.layers[2] ?? activeDevice.layers[0]
  const material = selected ? findMaterial(project.materials, selected.materialId) : undefined

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
        {activeDevice.layers.length ? activeDevice.layers.map((layer) => (
          <button className={selected && layer.id === selected.id ? 'layer-row active' : 'layer-row'} key={layer.id} onClick={() => setSelectedId(layer.id)}>
            <span style={{ backgroundColor: findMaterial(project.materials, layer.materialId).color }} />
            <div><strong>{layer.name}</strong><small>{layer.role} · {layer.geometry.thickness_nm} nm</small></div>
          </button>
        )) : <EmptyState text="尚無 layer，請匯入或新增 layer。" />}
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
            <div className="property-grid">
              <Meta label="Length" value={`${selected.geometry.length_um} µm`} />
              <Meta label="Width" value={`${selected.geometry.width_um} µm`} />
              <Meta label="Thickness" value={`${selected.geometry.thickness_nm} nm`} />
              <Meta label="X" value={`${selected.geometry.x_um} µm`} />
              <Meta label="Y" value={`${selected.geometry.y_um} µm`} />
              <Meta label="Voltage" value={selected.voltageLabel ?? '-'} />
            </div>
            <p className="soft-note">{selected.notes}</p>
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
  const mobilityOverride = mobilityOverrides[activeDevice.id] ?? extracted.mobility_cm2Vs ?? 80
  const modelInput = useMemo(() => ({
    mobility_cm2Vs: mobilityOverride,
    dielectricConstant: extracted.dielectricConstant ?? 3.9,
    tox_nm: extracted.tox_nm ?? 20,
    width_um: extracted.width_um ?? 1,
    length_um: extracted.length_um ?? 1,
    vd,
    vgMin,
    vgMax,
    vth,
    rc_ohm: rc,
    leakage_A: leakageFloor,
  }), [extracted.dielectricConstant, extracted.length_um, extracted.tox_nm, extracted.width_um, leakageFloor, mobilityOverride, rc, vd, vgMax, vgMin, vth])
  const transferData = useMemo(
    () => calculateTransferCurve(modelInput).map((point) => ({
      vg: point.vg,
      id: scaleCurrent(point.id_A, currentUnit),
      region: point.region,
    })),
    [currentUnit, modelInput],
  )
  const outputData = useMemo(
    () => calculateOutputCurve({
      ...modelInput,
      vdMax: Math.max(0.2, vd * 2),
      vgValues: [vth + 0.5, vth + 1, vth + 1.5],
    }).map((point) => ({
      ...point,
      'Vg+0.5': scaleCurrent(point[`Vg=${Number((vth + 0.5).toFixed(1))}V`] ?? 0, currentUnit),
      'Vg+1.0': scaleCurrent(point[`Vg=${Number((vth + 1).toFixed(1))}V`] ?? 0, currentUnit),
      'Vg+1.5': scaleCurrent(point[`Vg=${Number((vth + 1.5).toFixed(1))}V`] ?? 0, currentUnit),
    })),
    [currentUnit, modelInput, vd, vth],
  )
  const cox = calculateCox(modelInput.dielectricConstant, modelInput.tox_nm)

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
          </div>
        </Card>
        <Card title="Extracted parameters">
          <ParameterTable rows={[
            ['L', extracted.length_um, 'µm'],
            ['W', extracted.width_um, 'µm'],
            ['tox', extracted.tox_nm, 'nm'],
            ['k', extracted.dielectricConstant, ''],
            ['Cox', cox, 'F/m²'],
            ['mobility', extracted.mobility_cm2Vs, 'cm²/V·s'],
            ['Eg', extracted.bandGap_eV, 'eV'],
            ['χ', extracted.electronAffinity_eV, 'eV'],
            ['contact φ', extracted.contactWorkFunction_eV, 'eV'],
          ]} />
        </Card>
        <Card title="Missing parameter warnings">
          {extracted.missing.length ? (
            <div className="warning-list">
              {extracted.missing.map((item) => <div key={item}><AlertTriangle size={14} />{item}</div>)}
            </div>
          ) : <EmptyState text="Active device 已具備 MVP 模型需要的主要參數。" />}
        </Card>
        <Card title="Model controls">
          <RangeInput label="Vd" value={vd} min={0.05} max={5} step={0.05} unit="V" onChange={setVd} />
          <RangeInput label="Vg min" value={vgMin} min={-5} max={vgMax - 0.1} step={0.1} unit="V" onChange={setVgMin} />
          <RangeInput label="Vg max" value={vgMax} min={vgMin + 0.1} max={5} step={0.1} unit="V" onChange={setVgMax} />
          <RangeInput label="Vth override" value={vth} min={-3} max={3} step={0.05} unit="V" onChange={setVth} />
          <RangeInput
            label="Mobility override"
            value={mobilityOverride}
            min={1}
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
          <Chart data={transferData} xKey="vg" unit={currentUnit} lines={[{ key: 'id', color: 'oklch(0.78 0.15 195)' }]} />
        </Card>
        <Card title="Id-Vd Output Curve">
          <Chart
            data={outputData}
            xKey="vd"
            unit={currentUnit}
            lines={[
              { key: 'Vg+0.5', color: 'oklch(0.78 0.15 195)' },
              { key: 'Vg+1.0', color: 'oklch(0.7 0.15 160)' },
              { key: 'Vg+1.5', color: 'oklch(0.7 0.15 290)' },
            ]}
          />
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

function ParameterTable({ rows }: { rows: Array<[string, number | undefined, string]> }) {
  return (
    <div className="parameter-table">
      {rows.map(([label, value, unit]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value === undefined ? 'missing' : `${formatNumber(value)} ${unit}`}</strong>
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

function findMaterial(materials: Material[], id: string) {
  return materials.find((material) => material.id === id) ?? materials[0]
}

function formatNumber(value: number) {
  if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) {
    return value.toExponential(2)
  }

  return Number(value.toPrecision(4)).toString()
}
