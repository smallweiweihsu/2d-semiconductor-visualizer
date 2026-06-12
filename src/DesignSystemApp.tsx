import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Edges, Text } from '@react-three/drei'
import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  FlaskConical,
  GitBranch,
  GitCompare,
  Layers,
  LayoutDashboard,
  Lightbulb,
  Plus,
  Search,
  Upload,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Link, Route, Switch, useLocation } from 'wouter'

type DeviceLayerRole =
  | 'source'
  | 'drain'
  | 'gate'
  | 'semiconductor'
  | 'dielectric'
  | 'oxide'
  | 'substrate'
  | 'bulk'
  | 'passivation'
  | 'contact'
  | 'custom'

type VoltageMode = 'grounded' | 'biased' | 'floating' | 'none'
type MaterialCategory =
  | 'metal'
  | 'two_d_semiconductor'
  | 'dielectric'
  | 'oxide'
  | 'bulk_conductor'
  | 'substrate'
  | 'custom'
type ParameterConfidence = 'known' | 'estimated' | 'unknown'
type ProcessType =
  | 'exfoliation'
  | 'dry_transfer'
  | 'metal_deposition'
  | 'thermal_evaporation'
  | 'ebeam_evaporation'
  | 'rie'
  | 'oxidation'
  | 'annealing'
  | 'metal_diffusion'
  | 'dielectric_deposition'
  | 'lithography'
  | 'liftoff'
  | 'raman_check'
  | 'pl_check'
  | 'afm_check'
  | 'xps_check'
  | 'electrical_measurement'
type MeasurementType = 'electrical' | 'raman' | 'pl' | 'xps' | 'afm' | 'sem' | 'tem'
type LiteratureStatus = 'candidate' | 'reviewed' | 'accepted' | 'rejected'
type HypothesisStatus = 'open' | 'testing' | 'confirmed' | 'rejected'

interface LayerGeometry {
  length_um: number
  width_um: number
  thickness_nm: number
  x_um: number
  y_um: number
  z_nm?: number
}

interface DeviceLayer {
  id: string
  name: string
  materialId: string
  role: DeviceLayerRole
  geometry: LayerGeometry
  voltageMode: VoltageMode
  voltageLabel?: string
  voltageValue_V?: number | null
  visible: boolean
  opacity: number
  notes?: string
}

interface DeviceStructure {
  id: string
  templateId?: string
  name: string
  description: string
  layers: DeviceLayer[]
  createdAt?: string
  updatedAt?: string
}

interface DeviceTemplate {
  id: string
  name: string
  shortName: string
  description: string
  layers: DeviceLayer[]
  tags: string[]
}

interface MaterialParameter {
  value: number | string | null
  unit?: string
  confidence: ParameterConfidence
  note?: string
}

interface Material {
  id: string
  name: string
  displayName: string
  category: MaterialCategory
  description: string
  color: string
  bandGap_eV: MaterialParameter
  electronAffinity_eV: MaterialParameter
  workFunction_eV: MaterialParameter
  dielectricConstant: MaterialParameter
  mobility_cm2Vs: MaterialParameter
  latticeConstant_A: MaterialParameter
  defaultThickness_nm: MaterialParameter
  ramanPeaks?: string
  plPeak?: string
  notes: string[]
}

interface ProcessStep {
  id: string
  order: number
  type: ProcessType
  materialId?: string
  time?: string
  temperature?: string
  pressure?: string
  gas?: string
  power?: string
  thickness?: string
  tool?: string
  notes?: string
  expectedResult?: string
  risk?: string
}

interface ProcessFlow {
  id: string
  name: string
  description: string
  steps: ProcessStep[]
  deviceId?: string
  createdAt?: string
}

interface MeasurementData {
  id: string
  sampleName: string
  deviceName: string
  date: string
  type: MeasurementType
  tool?: string
  operator?: string
  notes?: string
}

interface LiteratureSource {
  id: string
  title: string
  authors: string
  year: number
  doi?: string
  material?: string
  parameterExtracted?: string
  deviceType?: string
  reliabilityScore: number
  status: LiteratureStatus
  notes?: string
}

interface ResearchHypothesis {
  id: string
  title: string
  description: string
  status: HypothesisStatus
  createdAt: string
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'device-builder', label: 'Device Builder', icon: Layers, path: '/device-builder' },
  { id: 'process-flow', label: 'Process Flow', icon: GitBranch, path: '/process-flow' },
  { id: 'iv-simulator', label: 'I-V Simulator', icon: Activity, path: '/iv-simulator' },
  { id: 'band-diagram', label: 'Band Diagram', icon: BarChart3, path: '/band-diagram' },
  { id: 'materials', label: 'Materials', icon: Database, path: '/materials' },
  { id: 'references', label: 'References', icon: BookOpen, path: '/references' },
  { id: 'measurements', label: 'Measurements', icon: FlaskConical, path: '/measurements' },
  { id: 'comparison-lab', label: 'Comparison Lab', icon: GitCompare, path: '/comparison-lab' },
  { id: 'research-notes', label: 'Research Notes', icon: Lightbulb, path: '/research-notes' },
]

const materials: Material[] = [
  material('wse2', 'WSe2', 'WSe₂', 'two_d_semiconductor', '二維過渡金屬硫族化物，常用於場效電晶體', '#a78bfa', range('1.2-1.7', 'eV'), range('3.7-4.0', 'eV'), unknown('eV'), unknown(), range('1-250', 'cm²/V·s'), estimated(3.28, 'Å'), estimated(0.7, 'nm'), ['層數、缺陷、接觸金屬與製程會強烈影響電性', '接觸特性可能受到 Fermi-level pinning 影響'], '250 cm⁻¹ (E₂g), 260 cm⁻¹ (A₁g)'),
  material('mos2', 'MoS2', 'MoS₂', 'two_d_semiconductor', '常見二維 TMD 半導體', '#3b82f6', range('1.2-1.9', 'eV'), range('4.0-4.3', 'eV'), unknown('eV'), unknown(), range('1-200', 'cm²/V·s'), estimated(3.16, 'Å'), estimated(0.65, 'nm'), ['二維 TMD 代表材料']),
  material('hbn', 'hBN', 'hBN', 'dielectric', '二維絕緣層，原子級平坦封裝層', '#67e8f9', range('5.5-6.0', 'eV'), unknown('eV'), unknown('eV'), range('3-4'), unknown('cm²/V·s'), estimated(2.5, 'Å'), estimated(0.33, 'nm'), ['可作為介電/絕緣二維層', '常作為原子級平坦封裝層']),
  material('sb-bulk', 'Sb', 'Sb', 'bulk_conductor', '銻塊材，可作為底部平台與源極', '#94a3b8', known(0, 'eV', '半金屬'), unknown('eV'), range('4.5-4.7', 'eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), known(500000, 'nm'), ['表面可能形成 Sb₂O₃', '晶向 0001 vs 01-12 會影響表面特性']),
  material('sb2o3', 'Sb2O3', 'Sb₂O₃', 'oxide', '銻氧化物，局部氧化層或閘極介電層候選', '#7dd3fc', unknown('eV'), unknown('eV'), unknown('eV'), unknown(undefined, '可作為閘極介電層候選'), unknown('cm²/V·s'), unknown('Å'), estimated(10, 'nm'), ['對 Sb/Sb₂O₃/WSe₂ 結構非常重要', '許多參數需標為未知']),
  material('wox', 'WOx', 'WOx', 'oxide', '鎢氧化物，WSe₂ 氧化產物', '#fb923c', unknown('eV'), unknown('eV'), unknown('eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), unknown('nm'), ['化學計量可能變動', '不是單一固定材料']),
  material('pd', 'Pd', 'Pd', 'metal', '鈀接觸金屬，高功函數', '#cbd5e1', known(0, 'eV'), unknown('eV'), range('5.1-5.6', 'eV', '高功函數金屬'), unknown(), unknown('cm²/V·s'), known(3.89, 'Å'), estimated(30, 'nm'), ['高功函數金屬，常用於 p-type 接觸', '對 WSe₂ 可能形成 p-type 接觸']),
  material('ti', 'Ti', 'Ti', 'metal', '鈦接觸金屬，低功函數', '#475569', known(0, 'eV'), unknown('eV'), range('4.3-4.4', 'eV'), unknown(), unknown('cm²/V·s'), known(2.95, 'Å'), estimated(5, 'nm'), ['低功函數金屬', '常用於 n-type 接觸或黏附層']),
  material('in', 'In', 'In', 'metal', '銦接觸金屬，軟金屬', '#93c5fd', known(0, 'eV'), unknown('eV'), range('4.1-4.2', 'eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), estimated(20, 'nm'), ['軟金屬，可能減少對 Sb₂O₃ 的衝擊', '低功函數']),
  material('hfo2', 'HfO2', 'HfO₂', 'dielectric', '高介電常數材料，閘極介電層', '#e2e8f0', range('5.5-6.0', 'eV'), unknown('eV'), unknown('eV'), range('20-25'), unknown('cm²/V·s'), unknown('Å'), estimated(10, 'nm'), ['高 k 介電層常用材料']),
]

const sbBulkWse2Layers: DeviceLayer[] = [
  layer('sb-bulk-source', 'Sb 塊材 / 底部源極', 'sb-bulk', 'source', { length_um: 10, width_um: 5, thickness_nm: 500000, x_um: 0, y_um: 0, z_nm: 0 }, 'grounded', 'Vs', 0, 1, 'Sb 塊材作為底部平台與源極'),
  layer('local-sb2o3', '局部 Sb₂O₃', 'sb2o3', 'oxide', { length_um: 3, width_um: 2.5, thickness_nm: 10, x_um: -2, y_um: 0, z_nm: 500000 }, 'none', undefined, null, 0.75, '局部氧化層'),
  layer('wse2-channel', 'WSe₂ 通道', 'wse2', 'semiconductor', { length_um: 5, width_um: 2, thickness_nm: 1, x_um: 0, y_um: 0, z_nm: 500010 }, 'none', undefined, null, 0.9, 'WSe₂ 作為二維半導體通道'),
  layer('pd-drain', 'Pd 汲極接觸', 'pd', 'drain', { length_um: 1.2, width_um: 2, thickness_nm: 30, x_um: -1.8, y_um: 0, z_nm: 500011 }, 'biased', 'Vd', 1, 1, 'Pd 作為汲極接觸金屬'),
  layer('top-sb2o3', '上方 Sb₂O₃ 介電層', 'sb2o3', 'dielectric', { length_um: 6, width_um: 2.5, thickness_nm: 20, x_um: 0, y_um: 0, z_nm: 500041 }, 'none', undefined, null, 0.65, '上方閘極介電層'),
  layer('top-gate', '上閘極', 'pd', 'gate', { length_um: 3, width_um: 2, thickness_nm: 30, x_um: 0.5, y_um: 0, z_nm: 500061 }, 'biased', 'Vg', 0, 1, '上閘極金屬'),
]

const initialDeviceStructure: DeviceStructure = {
  id: 'sb-wse2-topgate-001',
  templateId: 'sb_bulk_wse2_top_gate',
  name: 'Sb/WSe₂ 上閘極元件 v1',
  description: 'Sb 塊材底部源極 + WSe₂ 通道 + Pd 汲極 + Sb₂O₃ 介電 + 上閘極',
  layers: sbBulkWse2Layers,
  createdAt: '2024-12-01',
  updatedAt: '2024-12-15',
}

const deviceTemplates: DeviceTemplate[] = [
  {
    id: 'sb_bulk_wse2_top_gate',
    name: 'Sb/WSe₂ 上閘極元件',
    shortName: 'Sb/WSe₂ TG',
    description: initialDeviceStructure.description,
    layers: sbBulkWse2Layers,
    tags: ['Sb', 'WSe₂', 'top gate', 'Sb₂O₃'],
  },
]

const defaultProcessSteps: ProcessStep[] = [
  step('ps-1', 1, 'exfoliation', '機械剝離 WSe₂ 薄片', '單層或少層 WSe₂'),
  step('ps-2', 2, 'afm_check', 'AFM 確認厚度', '厚度 < 2 nm'),
  step('ps-3', 3, 'dry_transfer', '乾式轉移 WSe₂ 至 Sb 基板', '平整轉移'),
  step('ps-4', 4, 'raman_check', 'Raman 確認 WSe₂ 品質', '清晰 E₂g/A₁g 峰'),
  { id: 'ps-5', order: 5, type: 'lithography', notes: '定義汲極接觸區域', tool: 'e-beam lithography' },
  { id: 'ps-6', order: 6, type: 'metal_deposition', materialId: 'pd', thickness: '30 nm', notes: 'Pd 汲極沉積', tool: 'e-beam evaporator' },
  { id: 'ps-7', order: 7, type: 'liftoff', notes: 'Lift-off 移除多餘金屬' },
  { id: 'ps-8', order: 8, type: 'rie', power: '10W', time: '5s', gas: 'O₂', notes: 'RIE O₂ 處理 WSe₂ 表面', risk: '過度氧化風險' },
  { id: 'ps-9', order: 9, type: 'oxidation', temperature: '200°C', time: '30 min', notes: '形成 WOx', expectedResult: 'WSe₂ 表面氧化為 WOx' },
  { id: 'ps-10', order: 10, type: 'dielectric_deposition', materialId: 'sb2o3', thickness: '20 nm', notes: '沉積 Sb₂O₃ 介電層' },
  { id: 'ps-11', order: 11, type: 'metal_deposition', materialId: 'pd', thickness: '30 nm', notes: '上閘極金屬沉積' },
  { id: 'ps-12', order: 12, type: 'electrical_measurement', notes: 'Id-Vg / Id-Vd 量測' },
]

const defaultProcessFlow: ProcessFlow = {
  id: 'flow-001',
  name: 'Sb/WSe₂ Top-Gate Process',
  description: '12 步 WSe₂ on Sb 製程流程',
  steps: defaultProcessSteps,
  deviceId: initialDeviceStructure.id,
  createdAt: '2024-12-01',
}

const measurements: MeasurementData[] = [
  { id: 'meas-001', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-10', type: 'electrical', tool: 'Keithley 4200', operator: 'Wei', notes: 'Id-Vg sweep, Vd=1V' },
  { id: 'meas-002', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-08', type: 'raman', tool: 'Horiba LabRAM', operator: 'Wei', notes: '532nm laser, before oxidation' },
  { id: 'meas-003', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-09', type: 'raman', tool: 'Horiba LabRAM', operator: 'Wei', notes: '532nm laser, after RIE O₂' },
  { id: 'meas-004', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-07', type: 'afm', tool: 'Bruker Dimension', operator: 'Wei', notes: 'WSe₂ thickness measurement' },
  { id: 'meas-005', sampleName: 'WSe2-Sb-02', deviceName: 'Device B', date: '2024-12-12', type: 'xps', tool: 'PHI VersaProbe', operator: 'Wei', notes: 'Sb 3d / W 4f core level' },
]

const literature: LiteratureSource[] = [
  { id: 'lit-001', title: 'High-performance WSe₂ FET with Sb₂O₃ gate dielectric', authors: 'Zhang et al.', year: 2023, doi: '10.1038/xxx', material: 'WSe2, Sb2O3', parameterExtracted: 'mobility, SS', reliabilityScore: 8, status: 'accepted' },
  { id: 'lit-002', title: 'Metal contact engineering for 2D semiconductors', authors: 'Liu et al.', year: 2022, doi: '10.1021/xxx', material: 'WSe2, Pd, Ti', parameterExtracted: 'contact resistance, work function', reliabilityScore: 9, status: 'accepted' },
  { id: 'lit-003', title: 'Oxidation behavior of WSe₂ under O₂ plasma', authors: 'Chen et al.', year: 2024, material: 'WSe2, WOx', parameterExtracted: 'oxidation rate, Raman shift', reliabilityScore: 7, status: 'reviewed' },
  { id: 'lit-004', title: 'In as a low-damage contact for 2D materials', authors: 'Wang et al.', year: 2023, material: 'In, WSe2', parameterExtracted: 'contact resistance', reliabilityScore: 6, status: 'candidate' },
  { id: 'lit-005', title: 'Sb₂O₃ as native oxide dielectric', authors: 'Park et al.', year: 2024, material: 'Sb2O3, Sb', parameterExtracted: 'dielectric constant, bandgap', reliabilityScore: 7, status: 'candidate' },
]

const hypotheses: ResearchHypothesis[] = [
  { id: 'hyp-001', title: 'In 可以減少金屬對 Sb₂O₃ 的衝擊', description: '使用 In 作為緩衝層可能降低後續金屬沉積對 Sb₂O₃ 介電層的損傷', status: 'testing', createdAt: '2024-12-01' },
  { id: 'hyp-002', title: 'Pd 對 WSe₂ 形成 p-type 接觸', description: '高功函數 Pd 對 WSe₂ 的接觸特性可能受 Fermi-level pinning 影響', status: 'confirmed', createdAt: '2024-12-03' },
  { id: 'hyp-003', title: 'Sb₂O₃ 可作為保護層', description: 'Sb 表面自然氧化形成的 Sb₂O₃ 可能同時作為保護層與介電層', status: 'open', createdAt: '2024-12-05' },
  { id: 'hyp-004', title: 'RIE O₂ 可穩定產生 WOx', description: '低功率短時間 RIE O₂ 處理可以在 WSe₂ 表面形成均勻 WOx', status: 'testing', createdAt: '2024-12-08' },
]

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

const categoryLabels: Record<MaterialCategory, string> = {
  metal: '金屬',
  two_d_semiconductor: '二維半導體',
  dielectric: '介電材料',
  oxide: '氧化物',
  bulk_conductor: '塊材導體',
  substrate: '基板',
  custom: '自定義',
}

const statusLabels: Record<LiteratureStatus, string> = {
  accepted: '已採用',
  reviewed: '已審閱',
  candidate: '候選',
  rejected: '已排除',
}

const hypothesisStatusLabels: Record<HypothesisStatus, string> = {
  open: '開放',
  testing: '測試中',
  confirmed: '已確認',
  rejected: '已否定',
}

export function DesignSystemApp() {
  return (
    <div className="lithograph-app">
      <Sidebar />
      <div className="app-workspace">
        <TopBar />
        <main className="page-host">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/device-builder" component={DeviceBuilder} />
            <Route path="/process-flow" component={ProcessFlowPage} />
            <Route path="/iv-simulator" component={IVSimulator} />
            <Route path="/band-diagram" component={BandDiagram} />
            <Route path="/materials" component={MaterialsPage} />
            <Route path="/references" component={ReferencesPage} />
            <Route path="/measurements" component={MeasurementsPage} />
            <Route path="/comparison-lab" component={ComparisonLab} />
            <Route path="/research-notes" component={ResearchNotes} />
          </Switch>
        </main>
      </div>
    </div>
  )
}

function Sidebar() {
  const [location] = useLocation()

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <div className="brand-mark">2D</div>
        <div>
          <strong>Semiviz</strong>
          <span>Device Visualizer</span>
        </div>
      </div>
      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = item.path === '/' ? location === '/' : location.startsWith(item.path)
          return (
            <Link key={item.id} href={item.path} className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

function TopBar() {
  return (
    <header className="topbar">
      <label className="search-box">
        <Search size={16} />
        <input placeholder="Search devices, materials, measurements..." />
      </label>
      <div className="topbar-actions">
        <button className="secondary-action"><Upload size={15} />匯入資料</button>
        <button className="primary-action"><Plus size={15} />新增元件</button>
      </div>
    </header>
  )
}

function Dashboard() {
  const missing = materials.filter(
    (entry) =>
      entry.workFunction_eV.confidence === 'unknown' ||
      entry.bandGap_eV.confidence === 'unknown',
  )

  return (
    <div className="page stack">
      <section className="hero-panel panel-glow">
        <div>
          <h1>2D Semiconductor Device Visualizer</h1>
          <p>二維半導體元件視覺化與模擬平台，支援結構設計、製程規劃、電性模擬與量測資料管理。</p>
          <div className="hero-actions">
            <Link href="/device-builder" className="primary-action">建立元件結構</Link>
            <Link href="/process-flow" className="secondary-action">規劃製程流程</Link>
          </div>
        </div>
        <div className="hero-wafer" aria-hidden="true">
          {initialDeviceStructure.layers.map((deviceLayer, index) => (
            <span
              key={deviceLayer.id}
              style={{
                '--layer-color': getMaterial(deviceLayer.materialId).color,
                '--layer-index': index,
              } as React.CSSProperties}
            />
          ))}
        </div>
      </section>

      <section className="stats-grid">
        <StatCard label="元件結構" value="1" detail="Sb/WSe₂ 上閘極元件" />
        <StatCard label="材料資料" value={String(materials.length)} detail="10 種材料參數" />
        <StatCard label="量測資料" value={String(measurements.length)} detail="Electrical / Raman / AFM / XPS" />
        <StatCard label="文獻來源" value={String(literature.length)} detail="候選與已採用文獻" />
      </section>

      <section className="dashboard-main">
        <Panel title="活躍元件" className="span-2">
          <div className="device-summary">
            <LayerStackMini layers={initialDeviceStructure.layers} />
            <div>
              <h2>{initialDeviceStructure.name}</h2>
              <p>{initialDeviceStructure.description}</p>
              <div className="meta-grid">
                <Meta label="Template" value={initialDeviceStructure.templateId ?? '-'} />
                <Meta label="Created" value={initialDeviceStructure.createdAt ?? '-'} />
                <Meta label="Updated" value={initialDeviceStructure.updatedAt ?? '-'} />
                <Meta label="Layers" value={`${initialDeviceStructure.layers.length}`} />
              </div>
            </div>
          </div>
        </Panel>
        <Panel title="缺少參數警告">
          <div className="warning-list">
            {missing.slice(0, 5).map((entry) => (
              <div className="warning-row material-bar" style={{ '--bar-color': entry.color } as React.CSSProperties} key={entry.id}>
                <strong>{entry.displayName}</strong>
                <span>{entry.workFunction_eV.confidence === 'unknown' ? 'Work Function' : 'Band Gap'} 需要文獻參數</span>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="bottom-grid">
        <Panel title="最近量測">
          {measurements.slice(0, 3).map((entry) => <CompactRow key={entry.id} title={entry.deviceName} meta={`${entry.type} · ${entry.date}`} />)}
        </Panel>
        <Panel title="製程進度">
          <div className="progress-label"><span>8 / 12 steps</span><span>67%</span></div>
          <div className="progress-track"><span style={{ width: '67%' }} /></div>
          <CompactRow title="Next step" meta="氧化 · 200°C · 30 min" />
        </Panel>
        <Panel title="待審文獻">
          {literature.filter((entry) => entry.status === 'candidate').map((entry) => <CompactRow key={entry.id} title={entry.title} meta={entry.authors} />)}
        </Panel>
      </section>
    </div>
  )
}

function DeviceBuilder() {
  const [selectedId, setSelectedId] = useState('wse2-channel')
  const [viewMode, setViewMode] = useState<'3D' | 'TOP' | 'SIDE' | 'EXPLODED'>('3D')
  const selectedLayer = initialDeviceStructure.layers.find((item) => item.id === selectedId) ?? initialDeviceStructure.layers[0]
  const selectedMaterial = getMaterial(selectedLayer.materialId)

  return (
    <ThreeColumnPage leftTitle="Layer Stack" rightTitle="Properties">
      {{
        left: (
          <>
            <div className="template-card">
              <span>{deviceTemplates[0].shortName}</span>
              <strong>{deviceTemplates[0].name}</strong>
              <p>{deviceTemplates[0].tags.join(' / ')}</p>
            </div>
            {initialDeviceStructure.layers.map((deviceLayer) => (
              <button
                className={`layer-list-row ${selectedId === deviceLayer.id ? 'active' : ''}`}
                key={deviceLayer.id}
                onClick={() => setSelectedId(deviceLayer.id)}
              >
                <span style={{ backgroundColor: getMaterial(deviceLayer.materialId).color }} />
                <div>
                  <strong>{deviceLayer.name}</strong>
                  <small>{deviceLayer.role} · {deviceLayer.geometry.thickness_nm} nm</small>
                </div>
              </button>
            ))}
          </>
        ),
        center: (
          <Panel title="3D Viewport" className="viewport-panel">
            <SegmentedControl
              value={viewMode}
              options={['3D', 'TOP', 'SIDE', 'EXPLODED']}
              onChange={(next) => setViewMode(next as '3D' | 'TOP' | 'SIDE' | 'EXPLODED')}
            />
            <div className="viewer-canvas">
              <Canvas camera={{ position: viewMode === 'TOP' ? [0, 12, 0.1] : viewMode === 'SIDE' ? [10, 2, 0] : [7, 6, 8], fov: 46 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[5, 8, 5]} intensity={1.6} />
                <group rotation={[-0.25, 0.15, 0]}>
                  {initialDeviceStructure.layers.map((deviceLayer, index) => (
                    <DeviceLayerMesh
                      key={deviceLayer.id}
                      deviceLayer={deviceLayer}
                      index={index}
                      exploded={viewMode === 'EXPLODED'}
                      selected={selectedId === deviceLayer.id}
                      onSelect={() => setSelectedId(deviceLayer.id)}
                    />
                  ))}
                </group>
                <OrbitControls enablePan enableZoom />
              </Canvas>
              <DeviceIsoStack layers={initialDeviceStructure.layers} selectedId={selectedId} exploded={viewMode === 'EXPLODED'} onSelect={setSelectedId} />
              <div className="legend-strip">
                {initialDeviceStructure.layers.map((deviceLayer) => (
                  <span key={deviceLayer.id}><i style={{ backgroundColor: getMaterial(deviceLayer.materialId).color }} />{deviceLayer.name}</span>
                ))}
              </div>
            </div>
          </Panel>
        ),
        right: (
          <>
            <div className="material-heading">
              <span style={{ backgroundColor: selectedMaterial.color }} />
              <div>
                <strong>{selectedLayer.name}</strong>
                <small>{selectedMaterial.displayName} · {selectedLayer.role}</small>
              </div>
            </div>
            <div className="property-grid">
              <Meta label="Length" value={`${selectedLayer.geometry.length_um} µm`} />
              <Meta label="Width" value={`${selectedLayer.geometry.width_um} µm`} />
              <Meta label="Thickness" value={`${selectedLayer.geometry.thickness_nm} nm`} />
              <Meta label="X" value={`${selectedLayer.geometry.x_um} µm`} />
              <Meta label="Y" value={`${selectedLayer.geometry.y_um} µm`} />
              <Meta label="Voltage" value={`${selectedLayer.voltageLabel ?? '-'} ${selectedLayer.voltageValue_V ?? ''}`} />
            </div>
            <ParameterList material={selectedMaterial} />
            <p className="note-box">{selectedLayer.notes}</p>
          </>
        ),
      }}
    </ThreeColumnPage>
  )
}

function ProcessFlowPage() {
  const [selectedOrder, setSelectedOrder] = useState(8)
  const selectedStep = defaultProcessFlow.steps.find((item) => item.order === selectedOrder) ?? defaultProcessFlow.steps[0]

  return (
    <ThreeColumnPage leftTitle="Steps" rightTitle="Step Parameters">
      {{
        left: defaultProcessFlow.steps.map((entry) => (
          <button className={`process-step-row ${entry.order === selectedOrder ? 'active' : ''}`} key={entry.id} onClick={() => setSelectedOrder(entry.order)}>
            <span>{entry.order}</span>
            <div><strong>{processLabels[entry.type]}</strong><small>{entry.notes}</small></div>
          </button>
        )),
        center: (
          <Panel title={defaultProcessFlow.name} className="process-preview">
            <LayerStackMini layers={initialDeviceStructure.layers} />
            <div className="timeline">
              {defaultProcessFlow.steps.map((entry) => (
                <button className={entry.order === selectedOrder ? 'active' : ''} key={entry.id} onClick={() => setSelectedOrder(entry.order)}>{entry.order}</button>
              ))}
            </div>
            <div className="process-callout">
              <strong>{processLabels[selectedStep.type]}</strong>
              <p>{selectedStep.expectedResult ?? selectedStep.notes}</p>
            </div>
          </Panel>
        ),
        right: (
          <>
            <Meta label="Type" value={processLabels[selectedStep.type]} />
            <Meta label="Tool" value={selectedStep.tool ?? '-'} />
            <Meta label="Time" value={selectedStep.time ?? '-'} />
            <Meta label="Temperature" value={selectedStep.temperature ?? '-'} />
            <Meta label="Power" value={selectedStep.power ?? '-'} />
            <Meta label="Gas" value={selectedStep.gas ?? '-'} />
            <Meta label="Thickness" value={selectedStep.thickness ?? '-'} />
            {selectedStep.risk ? <p className="risk-box">{selectedStep.risk}</p> : null}
            <p className="note-box">{selectedStep.notes}</p>
          </>
        ),
      }}
    </ThreeColumnPage>
  )
}

function IVSimulator() {
  const [mobility, setMobility] = useState(80)
  const [vth, setVth] = useState(0.6)
  const transferData = useMemo(() => createTransferData(mobility, vth), [mobility, vth])
  const outputData = useMemo(() => createOutputData(mobility, vth), [mobility, vth])

  return (
    <ThreeColumnPage leftTitle="Model Parameters" rightTitle="Results">
      {{
        left: (
          <>
            <RangeInput label="Mobility" value={mobility} min={1} max={250} unit="cm²/V·s" onChange={setMobility} />
            <RangeInput label="Vth" value={vth} min={-2} max={2} step={0.1} unit="V" onChange={setVth} />
            <Meta label="Vd max" value="3 V" />
            <Meta label="Vg min / max" value="-2 V / 3 V" />
            <Meta label="Channel L / W" value="5 µm / 2 µm" />
            <Meta label="Contact Resistance" value="10 kΩ·µm" />
          </>
        ),
        center: (
          <div className="chart-stack">
            <ChartPanel title="Id-Vg Transfer Curve">
              <LineChart data={transferData}>
                <CartesianGrid stroke="rgba(148,163,184,.15)" />
                <XAxis dataKey="vg" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="id" stroke="#22d3ee" dot={false} strokeWidth={2} />
              </LineChart>
            </ChartPanel>
            <ChartPanel title="Id-Vd Output Curves">
              <LineChart data={outputData}>
                <CartesianGrid stroke="rgba(148,163,184,.15)" />
                <XAxis dataKey="vd" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                {[-1, 0, 1, 2, 3].map((vg, index) => (
                  <Line key={vg} type="monotone" dataKey={`vg${vg}`} stroke={['#7dd3fc', '#a78bfa', '#fbbf24', '#34d399', '#f472b6'][index]} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ChartPanel>
          </div>
        ),
        right: (
          <>
            <Meta label="Peak Id" value={`${transferData.at(-1)?.id.toFixed(3)} µA`} />
            <Meta label="Onset" value={`${vth.toFixed(1)} V`} />
            <Meta label="Model" value="Simplified MOSFET" />
            <p className="note-box">此為簡化 MOSFET 模型，不包含短通道效應、DIBL、界面態、量子限制等。</p>
          </>
        ),
      }}
    </ThreeColumnPage>
  )
}

function BandDiagram() {
  const [metalId, setMetalId] = useState('pd')
  const [mode, setMode] = useState<'After Contact' | 'Before Contact'>('After Contact')
  const metalPhi = metalId === 'pd' ? 5.3 : metalId === 'ti' ? 4.33 : 4.12
  const chi = 3.9
  const eg = 1.4
  const phiBn = metalPhi - chi
  const phiBp = eg - phiBn
  const bandData = Array.from({ length: 80 }, (_, index) => {
    const x = index / 8
    const bending = mode === 'After Contact' ? (metalPhi - (chi + eg / 2)) * Math.exp(-x / 2) : 0
    return { x: x.toFixed(1), ec: +(chi + bending).toFixed(2), ev: +(chi + eg + bending).toFixed(2), ef: metalPhi }
  })

  return (
    <ThreeColumnPage leftTitle="Material Select" rightTitle="Parameters">
      {{
        left: (
          <>
            {['pd', 'ti', 'in'].map((id) => (
              <button className={`layer-list-row ${metalId === id ? 'active' : ''}`} key={id} onClick={() => setMetalId(id)}>
                <span style={{ backgroundColor: getMaterial(id).color }} />
                <div><strong>{getMaterial(id).displayName}</strong><small>φ = {id === 'pd' ? '5.3' : id === 'ti' ? '4.33' : '4.12'} eV</small></div>
              </button>
            ))}
            <button className="layer-list-row active"><span style={{ backgroundColor: getMaterial('wse2').color }} /><div><strong>WSe₂</strong><small>χ=3.9 · Eg=1.4</small></div></button>
          </>
        ),
        center: (
          <Panel title="Energy Band Diagram" className="chart-panel-large">
            <SegmentedControl value={mode} options={['After Contact', 'Before Contact']} onChange={(next) => setMode(next as 'After Contact' | 'Before Contact')} />
            <ResponsiveContainer height={420}>
              <AreaChart data={bandData}>
                <CartesianGrid stroke="rgba(148,163,184,.15)" />
                <XAxis dataKey="x" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" reversed />
                <Tooltip contentStyle={tooltipStyle} />
                <Area dataKey="ev" stroke="#a78bfa" fill="#a78bfa22" />
                <Area dataKey="ec" stroke="#22d3ee" fill="#22d3ee22" />
                <Line dataKey="ef" stroke="#fbbf24" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>
        ),
        right: (
          <>
            <Meta label="φ_Bn" value={`${phiBn.toFixed(2)} eV`} />
            <Meta label="φ_Bp" value={`${phiBp.toFixed(2)} eV`} />
            <Meta label="Band bending" value="exp(-dist/2)" />
            <p className="note-box">此為簡化能帶圖，未考慮 Fermi-level pinning、MIGS 效應、界面態密度等。</p>
          </>
        ),
      }}
    </ThreeColumnPage>
  )
}

function MaterialsPage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('wse2')
  const filtered = materials.filter((entry) => `${entry.name} ${entry.displayName} ${entry.description}`.toLowerCase().includes(query.toLowerCase()))
  const selected = materials.find((entry) => entry.id === selectedId) ?? materials[0]

  return (
    <TwoColumnPage leftTitle="Materials" rightTitle={selected.displayName}>
      {{
        left: (
          <>
            <input className="field" placeholder="搜尋材料" value={query} onChange={(event) => setQuery(event.target.value)} />
            {filtered.map((entry) => (
              <button className={`layer-list-row ${selectedId === entry.id ? 'active' : ''}`} key={entry.id} onClick={() => setSelectedId(entry.id)}>
                <span style={{ backgroundColor: entry.color }} />
                <div><strong>{entry.displayName}</strong><small>{categoryLabels[entry.category]}</small></div>
              </button>
            ))}
          </>
        ),
        right: <MaterialDetail material={selected} />,
      }}
    </TwoColumnPage>
  )
}

function ReferencesPage() {
  const [selectedId, setSelectedId] = useState('lit-001')
  const selected = literature.find((entry) => entry.id === selectedId) ?? literature[0]
  return (
    <TwoColumnPage leftTitle="Literature" rightTitle={selected.title}>
      {{
        left: literature.map((entry) => (
          <button className={`reference-row ${selected.id === entry.id ? 'active' : ''}`} key={entry.id} onClick={() => setSelectedId(entry.id)}>
            <strong>{entry.title}</strong>
            <span>{entry.authors} · {entry.year} · {statusLabels[entry.status]}</span>
          </button>
        )),
        right: (
          <>
            <Meta label="Authors" value={selected.authors} />
            <Meta label="Year" value={`${selected.year}`} />
            <Meta label="DOI" value={selected.doi ?? '-'} />
            <Meta label="Material" value={selected.material ?? '-'} />
            <Meta label="Parameter" value={selected.parameterExtracted ?? '-'} />
            <Reliability score={selected.reliabilityScore} />
          </>
        ),
      }}
    </TwoColumnPage>
  )
}

function MeasurementsPage() {
  const [selectedId, setSelectedId] = useState('meas-001')
  const selected = measurements.find((entry) => entry.id === selectedId) ?? measurements[0]
  return (
    <TwoColumnPage leftTitle="Measurements" rightTitle={selected.sampleName}>
      {{
        left: measurements.map((entry) => (
          <button className={`measurement-row ${selected.id === entry.id ? 'active' : ''}`} key={entry.id} onClick={() => setSelectedId(entry.id)}>
            <span className={`type-dot ${entry.type}`} />
            <div><strong>{entry.deviceName}</strong><small>{entry.type} · {entry.date}</small></div>
          </button>
        )),
        right: (
          <>
            <Meta label="Device" value={selected.deviceName} />
            <Meta label="Date" value={selected.date} />
            <Meta label="Type" value={selected.type} />
            <Meta label="Tool" value={selected.tool ?? '-'} />
            <Meta label="Operator" value={selected.operator ?? '-'} />
            <ChartPanel title="視覺化佔位">
              <LineChart data={createMeasurementPreview(selected.type)}>
                <CartesianGrid stroke="rgba(148,163,184,.15)" />
                <XAxis dataKey="x" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line dataKey="signal" stroke={measurementColor(selected.type)} dot={false} strokeWidth={2} />
              </LineChart>
            </ChartPanel>
            <p className="note-box">{selected.notes}</p>
          </>
        ),
      }}
    </TwoColumnPage>
  )
}

function ComparisonLab() {
  const compared = ['wse2', 'mos2', 'pd', 'ti'].map(getMaterial)
  const rows: Array<[string, keyof Material]> = [
    ['Band Gap', 'bandGap_eV'],
    ['Work Function', 'workFunction_eV'],
    ['Electron Affinity', 'electronAffinity_eV'],
    ['Dielectric Constant', 'dielectricConstant'],
    ['Mobility', 'mobility_cm2Vs'],
    ['Lattice Constant', 'latticeConstant_A'],
    ['Default Thickness', 'defaultThickness_nm'],
  ]

  return (
    <div className="page stack">
      <PageHeader title="Comparison Lab" description="預設比較 WSe₂, MoS₂, Pd, Ti 的材料參數與信心等級。" />
      <div className="pill-row">{compared.map((entry) => <span key={entry.id} style={{ '--pill-color': entry.color } as React.CSSProperties}>{entry.displayName}</span>)}</div>
      <div className="comparison-table-wrap panel">
        <table className="comparison-table">
          <thead>
            <tr><th>Field</th>{compared.map((entry) => <th key={entry.id}>{entry.displayName}<small>{categoryLabels[entry.category]}</small></th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([label, key]) => (
              <tr key={label}>
                <td>{label}</td>
                {compared.map((entry) => <td key={entry.id}>{formatParam(entry[key] as MaterialParameter)}</td>)}
              </tr>
            ))}
            <tr><td>Category</td>{compared.map((entry) => <td key={entry.id}>{categoryLabels[entry.category]}</td>)}</tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ResearchNotes() {
  const [selectedId, setSelectedId] = useState('hyp-001')
  const selected = hypotheses.find((entry) => entry.id === selectedId) ?? hypotheses[0]
  return (
    <TwoColumnPage leftTitle="Hypotheses" rightTitle={selected.title}>
      {{
        left: hypotheses.map((entry) => (
          <button className={`reference-row ${selected.id === entry.id ? 'active' : ''}`} key={entry.id} onClick={() => setSelectedId(entry.id)}>
            <strong>{entry.title}</strong>
            <span>{hypothesisStatusLabels[entry.status]} · {entry.createdAt}</span>
          </button>
        )),
        right: (
          <>
            <Meta label="Status" value={hypothesisStatusLabels[selected.status]} />
            <Meta label="Created" value={selected.createdAt} />
            <p className="note-box large">{selected.description}</p>
            <div className="linked-grid">
              <CompactRow title="Linked device" meta={initialDeviceStructure.name} />
              <CompactRow title="Linked process" meta={defaultProcessFlow.name} />
              <CompactRow title="Linked measurements" meta={`${measurements.length} records`} />
              <CompactRow title="Linked literature" meta={`${literature.length} sources`} />
            </div>
          </>
        ),
      }}
    </TwoColumnPage>
  )
}

function DeviceLayerMesh({ deviceLayer, index, exploded, selected, onSelect }: { deviceLayer: DeviceLayer; index: number; exploded: boolean; selected: boolean; onSelect: () => void }) {
  const material = getMaterial(deviceLayer.materialId)
  const height = Math.min(1.2, Math.max(0.05, Math.log10(deviceLayer.geometry.thickness_nm + 1) * 0.12))
  const y = index * 0.18 + (exploded ? index * 0.6 : 0)
  const metalness = material.category === 'metal' || material.category === 'bulk_conductor' ? 0.45 : 0.1

  return (
    <mesh position={[deviceLayer.geometry.x_um / 2, y, deviceLayer.geometry.y_um / 2]} onClick={onSelect}>
      <boxGeometry args={[deviceLayer.geometry.length_um, height, deviceLayer.geometry.width_um]} />
      <meshStandardMaterial color={material.color} transparent opacity={deviceLayer.opacity} metalness={metalness} roughness={0.38} />
      {selected ? <Edges color="#22d3ee" scale={1.02} /> : null}
      {selected ? <Text position={[0, height + 0.18, 0]} fontSize={0.22} color="#e0faff">{deviceLayer.name}</Text> : null}
    </mesh>
  )
}

function DeviceIsoStack({ layers, selectedId, exploded, onSelect }: { layers: DeviceLayer[]; selectedId: string; exploded: boolean; onSelect: (id: string) => void }) {
  return (
    <div className={`device-iso-stack ${exploded ? 'exploded' : ''}`} aria-label="Device layer visualizer">
      {layers.map((deviceLayer, index) => (
        <button
          aria-label={deviceLayer.name}
          className={selectedId === deviceLayer.id ? 'selected' : ''}
          key={deviceLayer.id}
          onClick={() => onSelect(deviceLayer.id)}
          style={{
            '--layer-color': getMaterial(deviceLayer.materialId).color,
            '--layer-index': index,
            '--layer-width': `${Math.max(34, deviceLayer.geometry.length_um * 7)}%`,
          } as React.CSSProperties}
        >
          <span>{deviceLayer.name}</span>
        </button>
      ))}
    </div>
  )
}

function ThreeColumnPage({ children, leftTitle, rightTitle }: { children: { left: React.ReactNode; center: React.ReactNode; right: React.ReactNode }; leftTitle: string; rightTitle: string }) {
  return (
    <div className="three-column-page">
      <Panel title={leftTitle} className="side-panel">{children.left}</Panel>
      <div className="center-panel">{children.center}</div>
      <Panel title={rightTitle} className="side-panel">{children.right}</Panel>
    </div>
  )
}

function TwoColumnPage({ children, leftTitle, rightTitle }: { children: { left: React.ReactNode; right: React.ReactNode }; leftTitle: string; rightTitle: string }) {
  return (
    <div className="two-column-page">
      <Panel title={leftTitle} className="list-panel">{children.left}</Panel>
      <Panel title={rightTitle} className="detail-panel">{children.right}</Panel>
    </div>
  )
}

function Panel({ title, className = '', children }: { title: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-title">{title}</div>
      {children}
    </section>
  )
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

function ChartPanel({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Panel title={title} className="chart-panel">
      <ResponsiveContainer height={260}>{children}</ResponsiveContainer>
    </Panel>
  )
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="stat-card panel">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

function CompactRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="compact-row">
      <strong>{title}</strong>
      <span>{meta}</span>
    </div>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="meta-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function MaterialDetail({ material: entry }: { material: Material }) {
  return (
    <div className="material-detail">
      <div className="material-heading">
        <span style={{ backgroundColor: entry.color }} />
        <div><strong>{entry.displayName}</strong><small>{categoryLabels[entry.category]}</small></div>
      </div>
      <p>{entry.description}</p>
      <ParameterList material={entry} />
      <div className="note-list">{entry.notes.map((note) => <span key={note}>{note}</span>)}</div>
    </div>
  )
}

function ParameterList({ material: entry }: { material: Material }) {
  const params: Array<[string, MaterialParameter]> = [
    ['Band Gap', entry.bandGap_eV],
    ['Electron Affinity', entry.electronAffinity_eV],
    ['Work Function', entry.workFunction_eV],
    ['Dielectric Constant', entry.dielectricConstant],
    ['Mobility', entry.mobility_cm2Vs],
    ['Lattice Constant', entry.latticeConstant_A],
    ['Default Thickness', entry.defaultThickness_nm],
  ]

  return (
    <div className="parameter-list">
      {params.map(([label, param]) => (
        <div key={label} className="parameter-row">
          <span><i className={`confidence ${param.confidence}`} />{label}</span>
          <strong>{formatParam(param)}</strong>
        </div>
      ))}
    </div>
  )
}

function Reliability({ score }: { score: number }) {
  return (
    <div className="reliability">
      <span>可靠性評分</span>
      <div>{Array.from({ length: 10 }, (_, index) => <i className={index < score ? 'on' : ''} key={index} />)}</div>
      <strong>{score}/10</strong>
    </div>
  )
}

function LayerStackMini({ layers }: { layers: DeviceLayer[] }) {
  return (
    <div className="stack-mini">
      {layers.map((deviceLayer) => (
        <span key={deviceLayer.id} style={{ backgroundColor: getMaterial(deviceLayer.materialId).color, opacity: deviceLayer.opacity }}>
          {deviceLayer.name}
        </span>
      ))}
    </div>
  )
}

function SegmentedControl({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="segmented-control">
      {options.map((option) => <button className={value === option ? 'active' : ''} key={option} onClick={() => onChange(option)}>{option}</button>)}
    </div>
  )
}

function RangeInput({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="range-input">
      <span>{label}<strong>{value} {unit}</strong></span>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function createTransferData(mobility: number, vth: number) {
  return Array.from({ length: 61 }, (_, index) => {
    const vg = -2 + index * 0.083
    const vov = vg - vth
    let id = 0
    if (vov > 0) {
      id = mobility * 1e-4 * (2 / 5) * vov ** 2 * 0.5
      id = id / (1 + 10 * id * 1e-6)
    }
    return { vg: +vg.toFixed(2), id: +(id * 1000).toFixed(4) }
  })
}

function createOutputData(mobility: number, vth: number) {
  return Array.from({ length: 40 }, (_, index) => {
    const vd = +(index * 0.075).toFixed(2)
    const row: Record<string, number> = { vd }
    for (const vg of [-1, 0, 1, 2, 3]) {
      const vov = vg - vth
      const id = vov > 0 ? mobility * 1e-4 * (2 / 5) * Math.min(vd * vov, vov ** 2 * 0.5) : 0
      row[`vg${vg}`] = +(id * 1000).toFixed(4)
    }
    return row
  })
}

function createMeasurementPreview(type: MeasurementType) {
  return Array.from({ length: 80 }, (_, index) => ({
    x: index,
    signal: +(Math.sin(index / 7) * (type === 'raman' ? 1.4 : 0.8) + Math.cos(index / 13) + 2).toFixed(3),
  }))
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

function material(
  id: string,
  name: string,
  displayName: string,
  category: MaterialCategory,
  description: string,
  color: string,
  bandGap_eV: MaterialParameter,
  electronAffinity_eV: MaterialParameter,
  workFunction_eV: MaterialParameter,
  dielectricConstant: MaterialParameter,
  mobility_cm2Vs: MaterialParameter,
  latticeConstant_A: MaterialParameter,
  defaultThickness_nm: MaterialParameter,
  notes: string[],
  ramanPeaks?: string,
): Material {
  return { id, name, displayName, category, description, color, bandGap_eV, electronAffinity_eV, workFunction_eV, dielectricConstant, mobility_cm2Vs, latticeConstant_A, defaultThickness_nm, ramanPeaks, notes }
}

function layer(
  id: string,
  name: string,
  materialId: string,
  role: DeviceLayerRole,
  geometry: LayerGeometry,
  voltageMode: VoltageMode,
  voltageLabel: string | undefined,
  voltageValue_V: number | null,
  opacity: number,
  notes: string,
): DeviceLayer {
  return { id, name, materialId, role, geometry, voltageMode, voltageLabel, voltageValue_V, visible: true, opacity, notes }
}

function step(id: string, order: number, type: ProcessType, notes: string, expectedResult: string): ProcessStep {
  return { id, order, type, notes, expectedResult }
}

function known(value: number | string, unit?: string, note?: string): MaterialParameter {
  return { value, unit, confidence: 'known', note }
}

function estimated(value: number | string, unit?: string, note?: string): MaterialParameter {
  return { value, unit, confidence: 'estimated', note }
}

function range(value: string, unit?: string, note?: string): MaterialParameter {
  return estimated(value, unit, note)
}

function unknown(unit?: string, note = '需要文獻參數'): MaterialParameter {
  return { value: null, unit, confidence: 'unknown', note }
}

function formatParam(param: MaterialParameter) {
  return param.value === null ? `Unknown${param.unit ? ` ${param.unit}` : ''}` : `${param.value}${param.unit ? ` ${param.unit}` : ''}`
}

function getMaterial(id: string) {
  return materials.find((entry) => entry.id === id) ?? materials[0]
}

const tooltipStyle = {
  background: 'oklch(0.17 0.02 250)',
  border: '1px solid oklch(0.25 0.02 250)',
  color: 'oklch(0.93 0.01 250)',
}
