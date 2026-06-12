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
import { useProjectStore } from '../../store/projectStore'
import type {
  DeviceLayer,
  HypothesisStatus,
  Material,
  MeasurementType,
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
  const { project } = useProjectStore()
  const activeDevice = project.devices[0]
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
  const { project } = useProjectStore()
  const [selectedId, setSelectedId] = useState(project.devices[0].layers[2]?.id)
  const [viewMode, setViewMode] = useState('3D')
  const device = project.devices[0]
  const selected = device.layers.find((layer) => layer.id === selectedId) ?? device.layers[0]
  const material = findMaterial(project.materials, selected.materialId)

  return (
    <div className="manus-page three-pane-page">
      <Card className="pane-list" title="Layer Stack">
        <div className="template-panel">
          <small>Sb/WSe₂ TG</small>
          <strong>{device.name}</strong>
          <span>Sb / WSe₂ / top gate / Sb₂O₃</span>
        </div>
        {device.layers.map((layer) => (
          <button className={layer.id === selected.id ? 'layer-row active' : 'layer-row'} key={layer.id} onClick={() => setSelectedId(layer.id)}>
            <span style={{ backgroundColor: findMaterial(project.materials, layer.materialId).color }} />
            <div><strong>{layer.name}</strong><small>{layer.role} · {layer.geometry.thickness_nm} nm</small></div>
          </button>
        ))}
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
          <LayerStackGraphic layers={device.layers} selectedId={selected.id} />
        </div>
      </Card>

      <Card className="inspector-card" title="Properties">
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
  const [mobility, setMobility] = useState(80)
  const [vth, setVth] = useState(0.6)
  const data = useMemo(() => createTransferData(mobility, vth), [mobility, vth])

  return (
    <WorkspacePage title="I–V Simulator" icon={<Activity size={18} />}>
      <div className="analysis-grid">
        <Card title="模型參數">
          <RangeInput label="Mobility" value={mobility} min={1} max={250} unit="cm²/V·s" onChange={setMobility} />
          <RangeInput label="Vth" value={vth} min={-2} max={2} step={0.1} unit="V" onChange={setVth} />
        </Card>
        <Card title="Id-Vg Transfer Curve">
          <Chart data={data} />
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

function Chart({ data }: { data: Array<{ vg: number; id: number }> }) {
  return (
    <ResponsiveContainer height={320}>
      <LineChart data={data}>
        <CartesianGrid stroke="oklch(0.25 0.02 250)" />
        <XAxis dataKey="vg" stroke="oklch(0.65 0.02 250)" />
        <YAxis stroke="oklch(0.65 0.02 250)" />
        <Tooltip contentStyle={{ background: 'oklch(0.17 0.02 250)', border: '1px solid oklch(0.25 0.02 250)' }} />
        <Line dataKey="id" stroke="oklch(0.78 0.15 195)" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function PlaceholderGrid({ items }: { items: string[] }) {
  return (
    <div className="placeholder-grid">
      {items.map((item) => <div key={item}><Box size={16} /><span>{item}</span></div>)}
    </div>
  )
}

function createTransferData(mobility: number, vth: number) {
  return Array.from({ length: 61 }, (_, index) => {
    const vg = -2 + index * 0.083
    const vov = vg - vth
    const id = vov > 0 ? mobility * 1e-4 * (2 / 5) * vov ** 2 * 0.5 : 0
    return { vg: +vg.toFixed(2), id: +(id * 1000).toFixed(4) }
  })
}

function findMaterial(materials: Material[], id: string) {
  return materials.find((material) => material.id === id) ?? materials[0]
}

function measurementColor(type: MeasurementType) {
  const colors: Record<MeasurementType, string> = {
    electrical: '#22d3ee',
    raman: '#a78bfa',
    pl: '#34d399',
    xps: '#fbbf24',
    afm: '#60a5fa',
    sem: '#f472b6',
    tem: '#f87171',
  }
  return colors[type]
}

void measurementColor
