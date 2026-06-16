import type {
  DeviceLayer,
  DeviceLayerRole,
  DeviceStructure,
  ElectricalRole,
  Material,
  MaterialCategory,
  MaterialParameter,
  ProcessStep,
  ProcessType,
  SemivizProject,
  VoltageMode,
} from '../types/semiviz'

export const materialColors = {
  wse2: '#a78bfa',
  mos2: '#3b82f6',
  hbn: '#67e8f9',
  sb: '#94a3b8',
  sb2o3: '#7dd3fc',
  wox: '#fb923c',
  pd: '#cbd5e1',
  ti: '#475569',
  in: '#93c5fd',
  hfo2: '#e2e8f0',
}

export const materials: Material[] = [
  material('wse2', 'WSe2', 'WSe₂', 'two_d_semiconductor', 'p', '二維過渡金屬硫族化物，常用於場效電晶體', materialColors.wse2, estimated('1.2-1.65', 'eV', '塊材間接 ~1.2、單層直接 ~1.65 eV'), estimated(3.9, 'eV', '常見 ~3.9–4.0 eV'), unknown('eV'), estimated(7.5, '', '面外介電常數約 7–8 (Laturia 2018)'), estimated(80, 'cm²/V·s', '隨製程/接觸變動大'), unknown('Ω·m'), estimated(3.28, 'Å'), estimated(0.7, 'nm'), ['層數、缺陷、接觸金屬與製程會強烈影響電性']),
  material('mos2', 'MoS2', 'MoS₂', 'two_d_semiconductor', 'n', '常見二維 TMD 半導體', materialColors.mos2, range('1.2-1.9', 'eV', '塊材間接 ~1.2、單層直接 ~1.8 eV'), range('4.0-4.3', 'eV'), unknown('eV'), estimated(7, '', '面外 ~6.9–7.6 (Laturia 2018)'), range('1-200', 'cm²/V·s'), unknown('Ω·m'), estimated(3.16, 'Å'), estimated(0.65, 'nm'), ['二維 TMD 代表材料']),
  material('hbn', 'hBN', 'hBN', 'dielectric', 'unknown', '二維絕緣層，原子級平坦封裝層', materialColors.hbn, range('5.9-6.1', 'eV', '~6 eV'), estimated(2.0, 'eV', '電子親和力約 2 eV'), unknown('eV'), range('3-4', '', '面外 ~3–4'), unknown('cm²/V·s'), unknown('Ω·m'), estimated(2.5, 'Å'), estimated(0.33, 'nm'), ['可作為介電/絕緣二維層']),
  material('sb-bulk', 'Sb', 'Sb', 'bulk_conductor', 'unknown', '銻塊材，可作為底部平台與源極', materialColors.sb, known(0, 'eV', '半金屬'), known('—', 'eV', '半金屬不適用'), estimated(4.6, 'eV', '~4.55–4.7'), known('—', '', '不適用'), known('—', 'cm²/V·s', '不適用'), estimated(4e-7, 'Ω·m', '半金屬電阻率'), known('—', 'Å', '—'), known(500000, 'nm'), ['表面可能形成 Sb₂O₃']),
  material('sb2o3', 'Sb2O3', 'Sb₂O₃', 'oxide', 'unknown', '銻氧化物，局部氧化層或閘極介電層候選', materialColors.sb2o3, range('3.0-3.3', 'eV', '文獻分散，約 3.0–3.3 eV，需校準'), estimated(3.3, 'eV', '估計，需實驗校準'), unknown('eV'), range('4-12', '', '文獻分散，需校準'), unknown('cm²/V·s'), unknown('Ω·m'), unknown('Å'), estimated(10, 'nm'), ['能隙/介電/親和力文獻分散，皆為估計需校準']),
  material('wox', 'WOx', 'WOx', 'oxide', 'unknown', '鎢氧化物，WSe₂ 氧化產物', materialColors.wox, range('2.6-3.2', 'eV', '依化學計量 x 變動'), unknown('eV'), estimated(5.7, 'eV', '高功函數 ~5–6.7，依 x'), unknown(), unknown('cm²/V·s'), unknown('Ω·m'), unknown('Å'), unknown('nm'), ['化學計量 x 影響能隙與功函數']),
  material('pd', 'Pd', 'Pd', 'metal', 'unknown', '鈀接觸金屬，高功函數（面向依賴）', materialColors.pd, known(0, 'eV', '金屬'), known('—', 'eV', '金屬不適用'), range('5.1-5.6', 'eV', 'Michaelson 1977，面向依賴'), known('—', '', '金屬不適用'), known('—', 'cm²/V·s', '金屬不適用'), estimated(1.05e-7, 'Ω·m', '~1.05×10⁻⁷'), known(3.89, 'Å'), estimated(30, 'nm'), ['高功函數金屬，常用於 p-type 接觸']),
  material('ti', 'Ti', 'Ti', 'metal', 'unknown', '鈦接觸金屬，低功函數', materialColors.ti, known(0, 'eV', '金屬'), known('—', 'eV', '金屬不適用'), range('4.3-4.4', 'eV', 'Michaelson 1977'), known('—', '', '金屬不適用'), known('—', 'cm²/V·s', '金屬不適用'), estimated(4.2e-7, 'Ω·m', '~4.2×10⁻⁷'), known(2.95, 'Å'), estimated(5, 'nm'), ['常用於 n-type 接觸或黏附層']),
  material('in', 'In', 'In', 'metal', 'unknown', '銦接觸金屬，軟金屬', materialColors.in, known(0, 'eV', '金屬'), known('—', 'eV', '金屬不適用'), range('4.1-4.2', 'eV', 'Michaelson 1977'), known('—', '', '金屬不適用'), known('—', 'cm²/V·s', '金屬不適用'), estimated(8.4e-8, 'Ω·m', '~8.4×10⁻⁸'), known(3.25, 'Å', '四方'), estimated(20, 'nm'), ['軟金屬，可能減少對 Sb₂O₃ 的衝擊']),
  material('hfo2', 'HfO2', 'HfO₂', 'dielectric', 'unknown', '高介電常數材料，閘極介電層', materialColors.hfo2, range('5.5-5.8', 'eV', '~5.7 eV'), estimated(2.5, 'eV', '電子親和力 ~2.4–2.5 eV'), unknown('eV'), range('20-25', '', '依沉積製程'), unknown('cm²/V·s'), unknown('Ω·m'), unknown('Å'), estimated(10, 'nm'), ['高 k 介電層常用材料']),
  material('pt', 'Pt', 'Pt', 'metal', 'unknown', '鉑接觸金屬，高功函數', '#e5e7eb', known(0, 'eV', '金屬'), known('—', 'eV', '金屬不適用'), estimated(5.65, 'eV', 'Michaelson 1977'), known('—', '', '金屬不適用'), known('—', 'cm²/V·s', '金屬不適用'), estimated(1.06e-7, 'Ω·m', '~1.06×10⁻⁷'), known(3.92, 'Å'), estimated(20, 'nm'), ['高功函數金屬，p-type 接觸候選']),
  material('au', 'Au', 'Au', 'metal', 'unknown', '金接觸金屬', '#fcd34d', known(0, 'eV', '金屬'), known('—', 'eV', '金屬不適用'), estimated(5.1, 'eV', 'Michaelson 1977'), known('—', '', '金屬不適用'), known('—', 'cm²/V·s', '金屬不適用'), estimated(2.2e-8, 'Ω·m', '~2.2×10⁻⁸'), known(4.08, 'Å'), estimated(30, 'nm'), ['常用接觸金屬']),
  material('inse', 'InSe', 'InSe', 'two_d_semiconductor', 'n', '二維 III–VI 半導體，能隙隨層數變化', '#34d399', range('1.2-2.6', 'eV', '塊材 ~1.2、單層 ~2.6 eV'), estimated(4.6, 'eV', '約 4.5–4.6 eV'), unknown('eV'), estimated(7.6, '', '~7–10'), range('10-1000', 'cm²/V·s'), unknown('Ω·m'), estimated(4.0, 'Å'), estimated(0.8, 'nm'), ['層數強烈影響能隙與電子親和力（需文獻校準）']),
]

export const sbBulkWse2Layers: DeviceLayer[] = [
  layer('sb-bulk-source', 'Sb 塊材 / 底部源極', 'sb-bulk', 'source', 'substrate', { length_um: 10, width_um: 5, thickness_nm: 500000, x_um: 0, y_um: 0, z_nm: 0 }, 'grounded', 'Vs', 0, 1, 'Sb 塊材作為底部平台與源極'),
  layer('local-sb2o3', '局部 Sb₂O₃', 'sb2o3', 'oxide', 'buffer', { length_um: 3, width_um: 2.5, thickness_nm: 10, x_um: -2, y_um: 0, z_nm: 10 }, 'none', undefined, null, 0.75, '局部氧化層'),
  layer('wse2-channel', 'WSe₂ 通道', 'wse2', 'semiconductor', 'channel', { length_um: 5, width_um: 2, thickness_nm: 1, x_um: 0, y_um: 0, z_nm: 20 }, 'none', undefined, null, 0.9, 'WSe₂ 作為二維半導體通道'),
  layer('pd-drain', 'Pd 汲極接觸', 'pd', 'drain', 'drain', { length_um: 1.2, width_um: 2, thickness_nm: 30, x_um: -1.8, y_um: 0, z_nm: 30 }, 'biased', 'Vd', 1, 1, 'Pd 作為汲極接觸金屬'),
  layer('top-sb2o3', '上方 Sb₂O₃ 介電層', 'sb2o3', 'dielectric', 'gate_dielectric', { length_um: 6, width_um: 2.5, thickness_nm: 20, x_um: 0, y_um: 0, z_nm: 40 }, 'none', undefined, null, 0.65, '上方閘極介電層'),
  layer('top-gate', '上閘極', 'pd', 'gate', 'gate', { length_um: 3, width_um: 2, thickness_nm: 30, x_um: 0.5, y_um: 0, z_nm: 50 }, 'biased', 'Vg', 0, 1, '上閘極金屬'),
]

export const initialDeviceStructure: DeviceStructure = {
  id: 'sb-wse2-topgate-001',
  templateId: 'sb_bulk_wse2_top_gate',
  name: 'Sb/WSe₂ 上閘極元件 v1',
  description: 'Sb 塊材底部源極 + WSe₂ 通道 + Pd 汲極 + Sb₂O₃ 介電 + 上閘極',
  carrierType: 'p',
  simulationConfig: {
    channelLayerId: 'wse2-channel',
    gateDielectricLayerId: 'top-sb2o3',
    sourceLayerId: 'sb-bulk-source',
    drainLayerId: 'pd-drain',
    gateLayerId: 'top-gate',
  },
  layers: sbBulkWse2Layers,
  tags: ['Sb 塊材 / 底部源極', '局部 Sb₂O₃', 'WSe₂ 通道', 'Pd 汲極接觸', '上方 Sb₂O₃ 介電層', '上閘極'],
  createdAt: '2024-12-01',
  updatedAt: '2024-12-15',
}

export const defaultProcessSteps: ProcessStep[] = [
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

export const seedProject: SemivizProject = {
  schemaVersion: 'semiviz-project-v2',
  activeDeviceId: initialDeviceStructure.id,
  devices: [initialDeviceStructure],
  materials,
  processes: [
    {
      id: 'flow-001',
      name: 'Sb/WSe₂ 上閘極製程',
      description: '12 步 WSe₂ on Sb 製程流程',
      steps: defaultProcessSteps,
      deviceId: initialDeviceStructure.id,
      createdAt: '2024-12-01',
    },
  ],
  measurements: [
    { id: 'meas-001', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-10', type: 'electrical', tool: 'Keithley 4200', operator: 'Wei', notes: 'Id-Vg sweep, Vd=1V' },
    { id: 'meas-002', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-08', type: 'raman', tool: 'Horiba LabRAM', operator: 'Wei', notes: '532nm laser, before oxidation' },
    { id: 'meas-003', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-09', type: 'raman', tool: 'Horiba LabRAM', operator: 'Wei', notes: '532nm laser, after RIE O₂' },
    { id: 'meas-004', sampleName: 'WSe2-Sb-01', deviceName: 'Device A', date: '2024-12-07', type: 'afm', tool: 'Bruker Dimension', operator: 'Wei', notes: 'WSe₂ thickness measurement' },
    { id: 'meas-005', sampleName: 'WSe2-Sb-02', deviceName: 'Device B', date: '2024-12-12', type: 'xps', tool: 'PHI VersaProbe', operator: 'Wei', notes: 'Sb 3d / W 4f core level' },
  ],
  references: [
    { id: 'lit-001', title: 'High-performance WSe₂ FET with Sb₂O₃ gate dielectric', authors: 'Zhang et al.', year: 2023, doi: '10.1038/xxx', material: 'WSe2, Sb2O3', parameterExtracted: 'mobility, SS', reliabilityScore: 8, status: 'accepted' },
    { id: 'lit-002', title: 'Metal contact engineering for 2D semiconductors', authors: 'Liu et al.', year: 2022, doi: '10.1021/xxx', material: 'WSe2, Pd, Ti', parameterExtracted: 'contact resistance, work function', reliabilityScore: 9, status: 'accepted' },
    { id: 'lit-003', title: 'Oxidation behavior of WSe₂ under O₂ plasma', authors: 'Chen et al.', year: 2024, material: 'WSe2, WOx', parameterExtracted: 'oxidation rate, Raman shift', reliabilityScore: 7, status: 'reviewed' },
    { id: 'lit-004', title: 'In as a low-damage contact for 2D materials', authors: 'Wang et al.', year: 2023, material: 'In, WSe2', parameterExtracted: 'contact resistance', reliabilityScore: 6, status: 'candidate' },
    { id: 'lit-005', title: 'Sb₂O₃ as native oxide dielectric', authors: 'Park et al.', year: 2024, material: 'Sb2O3, Sb', parameterExtracted: 'dielectric constant, bandgap', reliabilityScore: 7, status: 'candidate' },
    { id: 'lit-paper-001', title: 'Performance Step-up in PMOS with Monolayer WSe₂ Channel', authors: 'A.-S. Chou, Y.-T. Lin, M.-Y. Li et al. (TSMC / NTU / NYCU)', year: 2024, journal: 'TSMC (IEDM 級)', material: 'WSe2', parameterExtracted: 'ON-current, EOT, SS, Rc', reliabilityScore: 9, status: 'accepted', notes: '單層 WSe₂ p-FET：EOT 1.2 nm，Vds=-1V 下 ON-current 約 400 µA/µm，並降低元件間變異。大綱：① 通道（1L-WSe₂）工程 ② 介電 EOT 微縮 ③ 接觸電阻改善 ④ 變異控制。與你題目（WSe₂ p-FET）高度相關。' },
    { id: 'lit-paper-002', title: 'Single-layer MoS₂ transistors', authors: 'B. Radisavljevic, A. Kis et al.', year: 2011, journal: 'Nature Nanotechnology', material: 'MoS2', parameterExtracted: 'mobility, on/off, bandgap', reliabilityScore: 10, status: 'accepted', notes: '經典：以 HfO₂ 高-k 閘極實現單層 MoS₂ 室溫遷移率 ≥200 cm²/Vs、on/off ≈ 1×10⁸；單層 MoS₂ 能隙約 1.8 eV。2D FET 領域奠基論文。' },
    { id: 'lit-paper-003', title: 'Ultralow contact resistance between semimetal and monolayer semiconductors', authors: 'P.-C. Shen, C. Su, Y. Lin et al.', year: 2021, journal: 'Nature', material: 'MoS2, Bi', parameterExtracted: 'contact resistance, MIGS', reliabilityScore: 10, status: 'accepted', notes: '半金屬 Bi 與單層 TMD 形成歐姆接觸、抑制金屬誘發能隙態（MIGS），達超低接觸電阻。與你能帶圖的 MIGS/接觸主題直接相關。' },
    { id: 'lit-paper-004', title: 'Apparent Colors of 2D Materials', authors: 'S. Puebla, A. Castellanos-Gomez et al.', year: 2022, journal: '綜述 (Review)', material: '2D 通用', parameterExtracted: 'optical contrast, layer ID', reliabilityScore: 7, status: 'reviewed', notes: '綜述：用光學顯微鏡顏色/對比度快速辨識二維材料層數，含基板與波長關係。對 WSe₂/Sb₂O₃ 厚度判讀有參考價值。' },
  ],
  hypotheses: [
    { id: 'hyp-001', title: 'In 可以減少金屬對 Sb₂O₃ 的衝擊', description: '使用 In 作為緩衝層可能降低後續金屬沉積對 Sb₂O₃ 介電層的損傷', status: 'testing', createdAt: '2024-12-01' },
    { id: 'hyp-002', title: 'Pd/WSe₂ 接觸傾向 p-type', description: '高功函數 Pd 對 WSe₂ 的接觸特性可能受 Fermi-level pinning 影響', status: 'confirmed', createdAt: '2024-11-15' },
    { id: 'hyp-003', title: 'Sb₂O₃ 可作為保護層', description: 'Sb 表面自然氧化形成的 Sb₂O₃ 可能同時作為保護層與介電層', status: 'open', createdAt: '2024-12-05' },
    { id: 'hyp-004', title: 'RIE O₂ 可穩定產生 WOx', description: '低功率短時間 RIE O₂ 處理可以在 WSe₂ 表面形成均勻 WOx', status: 'testing', createdAt: '2024-12-08' },
  ],
}

export function material(
  id: string,
  name: string,
  displayName: string,
  category: MaterialCategory,
  carrierType: Material['carrierType'],
  description: string,
  color: string,
  bandGap_eV: MaterialParameter,
  electronAffinity_eV: MaterialParameter,
  workFunction_eV: MaterialParameter,
  dielectricConstant: MaterialParameter,
  mobility_cm2Vs: MaterialParameter,
  resistivity_ohm_m: MaterialParameter,
  latticeConstant_A: MaterialParameter,
  defaultThickness_nm: MaterialParameter,
  notes: string[],
): Material {
  return {
    id,
    name,
    displayName,
    category,
    carrierType,
    description,
    color,
    bandGap_eV: parameter('bandGap_eV', 'band gap', bandGap_eV),
    electronAffinity_eV: parameter('electronAffinity_eV', 'electron affinity', electronAffinity_eV),
    workFunction_eV: parameter('workFunction_eV', 'work function', workFunction_eV),
    dielectricConstant: parameter('dielectricConstant', 'dielectric constant', dielectricConstant),
    mobility_cm2Vs: parameter('mobility_cm2Vs', 'mobility', mobility_cm2Vs),
    resistivity_ohm_m: parameter('resistivity_ohm_m', 'resistivity', resistivity_ohm_m),
    latticeConstant_A: parameter('latticeConstant_A', 'lattice constant', latticeConstant_A),
    defaultThickness_nm: parameter('defaultThickness_nm', 'default thickness', defaultThickness_nm),
    notes,
  }
}

function layer(
  id: string,
  name: string,
  materialId: string,
  role: DeviceLayerRole,
  electricalRole: ElectricalRole,
  geometry: DeviceLayer['geometry'],
  voltageMode: VoltageMode,
  voltageLabel: string | undefined,
  voltageValue_V: number | null,
  opacity: number,
  notes: string,
): DeviceLayer {
  const stackOrder: Record<ElectricalRole, number> = {
    substrate: 0,
    buffer: 10,
    channel: 20,
    source: 30,
    drain: 30,
    contact: 30,
    gate_dielectric: 40,
    gate: 50,
    passivation: 60,
    unknown: 25,
  }
  return { id, name, materialId, role, electricalRole, stackOrder: stackOrder[electricalRole], geometry, voltageMode, voltageLabel, voltageValue_V, visible: true, opacity, notes }
}

function step(id: string, order: number, type: ProcessType, notes: string, expectedResult: string): ProcessStep {
  return { id, order, type, notes, expectedResult }
}

function known(value: number | string, unit?: string, note?: string): MaterialParameter {
  return baseParameter(value, unit, 'known', note)
}

function estimated(value: number | string, unit?: string, note?: string): MaterialParameter {
  return baseParameter(value, unit, 'estimated', note)
}

function range(value: string, unit?: string, note?: string): MaterialParameter {
  return estimated(value, unit, note)
}

export function unknown(unit?: string, note = '需要文獻參數'): MaterialParameter {
  return baseParameter(null, unit, 'unknown', note)
}

function parameter(key: string, label: string, materialParameter: MaterialParameter): MaterialParameter {
  const rangeMatch = typeof materialParameter.value === 'string'
    ? materialParameter.value.match(/\d*\.?\d+/g)?.map(Number)
    : undefined
  const parsedRange = rangeMatch && rangeMatch.length >= 2
    ? { min: rangeMatch[0], max: rangeMatch[1] }
    : undefined

  return {
    ...materialParameter,
    key,
    label,
    sourceIds: materialParameter.sourceIds ?? [],
    notes: materialParameter.notes ?? materialParameter.note ?? '',
    conditions: materialParameter.conditions ?? {},
    valueType: materialParameter.value === null
      ? 'unknown'
      : parsedRange
        ? 'range'
        : typeof materialParameter.value === 'number'
          ? 'scalar'
          : 'text',
    range: parsedRange,
    selectedValue: materialParameter.selectedValue ?? null,
    candidates: materialParameter.candidates ?? [],
  }
}

function baseParameter(
  value: number | string | null,
  unit: string | undefined,
  confidence: MaterialParameter['confidence'],
  note?: string,
): MaterialParameter {
  return {
    key: '',
    label: '',
    value,
    unit,
    confidence,
    sourceIds: [],
    notes: note ?? '',
    note,
    conditions: {},
    valueType: value === null ? 'unknown' : typeof value === 'number' ? 'scalar' : 'text',
    selectedValue: null,
    candidates: [],
  }
}
