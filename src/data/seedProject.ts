import type {
  DeviceLayer,
  DeviceLayerRole,
  DeviceStructure,
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
  material('wse2', 'WSe2', 'WSe₂', 'two_d_semiconductor', '二維過渡金屬硫族化物，常用於場效電晶體', materialColors.wse2, range('1.2-1.7', 'eV'), range('3.7-4.0', 'eV'), unknown('eV'), unknown(), range('1-250', 'cm²/V·s'), estimated(3.28, 'Å'), estimated(0.7, 'nm'), ['層數、缺陷、接觸金屬與製程會強烈影響電性']),
  material('mos2', 'MoS2', 'MoS₂', 'two_d_semiconductor', '常見二維 TMD 半導體', materialColors.mos2, range('1.2-1.9', 'eV'), range('4.0-4.3', 'eV'), unknown('eV'), unknown(), range('1-200', 'cm²/V·s'), estimated(3.16, 'Å'), estimated(0.65, 'nm'), ['二維 TMD 代表材料']),
  material('hbn', 'hBN', 'hBN', 'dielectric', '二維絕緣層，原子級平坦封裝層', materialColors.hbn, range('5.5-6.0', 'eV'), unknown('eV'), unknown('eV'), range('3-4'), unknown('cm²/V·s'), estimated(2.5, 'Å'), estimated(0.33, 'nm'), ['可作為介電/絕緣二維層']),
  material('sb-bulk', 'Sb', 'Sb', 'bulk_conductor', '銻塊材，可作為底部平台與源極', materialColors.sb, known(0, 'eV'), unknown('eV'), range('4.5-4.7', 'eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), known(500000, 'nm'), ['表面可能形成 Sb₂O₃']),
  material('sb2o3', 'Sb2O3', 'Sb₂O₃', 'oxide', '銻氧化物，局部氧化層或閘極介電層候選', materialColors.sb2o3, unknown('eV'), unknown('eV'), unknown('eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), estimated(10, 'nm'), ['許多參數需標為未知']),
  material('wox', 'WOx', 'WOx', 'oxide', '鎢氧化物，WSe₂ 氧化產物', materialColors.wox, unknown('eV'), unknown('eV'), unknown('eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), unknown('nm'), ['化學計量可能變動']),
  material('pd', 'Pd', 'Pd', 'metal', '鈀接觸金屬，高功函數', materialColors.pd, known(0, 'eV'), unknown('eV'), range('5.1-5.6', 'eV'), unknown(), unknown('cm²/V·s'), known(3.89, 'Å'), estimated(30, 'nm'), ['高功函數金屬，常用於 p-type 接觸']),
  material('ti', 'Ti', 'Ti', 'metal', '鈦接觸金屬，低功函數', materialColors.ti, known(0, 'eV'), unknown('eV'), range('4.3-4.4', 'eV'), unknown(), unknown('cm²/V·s'), known(2.95, 'Å'), estimated(5, 'nm'), ['常用於 n-type 接觸或黏附層']),
  material('in', 'In', 'In', 'metal', '銦接觸金屬，軟金屬', materialColors.in, known(0, 'eV'), unknown('eV'), range('4.1-4.2', 'eV'), unknown(), unknown('cm²/V·s'), unknown('Å'), estimated(20, 'nm'), ['軟金屬，可能減少對 Sb₂O₃ 的衝擊']),
  material('hfo2', 'HfO2', 'HfO₂', 'dielectric', '高介電常數材料，閘極介電層', materialColors.hfo2, range('5.5-6.0', 'eV'), unknown('eV'), unknown('eV'), range('20-25'), unknown('cm²/V·s'), unknown('Å'), estimated(10, 'nm'), ['高 k 介電層常用材料']),
]

export const sbBulkWse2Layers: DeviceLayer[] = [
  layer('sb-bulk-source', 'Sb 塊材 / 底部源極', 'sb-bulk', 'source', { length_um: 10, width_um: 5, thickness_nm: 500000, x_um: 0, y_um: 0, z_nm: 0 }, 'grounded', 'Vs', 0, 1, 'Sb 塊材作為底部平台與源極'),
  layer('local-sb2o3', '局部 Sb₂O₃', 'sb2o3', 'oxide', { length_um: 3, width_um: 2.5, thickness_nm: 10, x_um: -2, y_um: 0, z_nm: 500000 }, 'none', undefined, null, 0.75, '局部氧化層'),
  layer('wse2-channel', 'WSe₂ 通道', 'wse2', 'semiconductor', { length_um: 5, width_um: 2, thickness_nm: 1, x_um: 0, y_um: 0, z_nm: 500010 }, 'none', undefined, null, 0.9, 'WSe₂ 作為二維半導體通道'),
  layer('pd-drain', 'Pd 汲極接觸', 'pd', 'drain', { length_um: 1.2, width_um: 2, thickness_nm: 30, x_um: -1.8, y_um: 0, z_nm: 500011 }, 'biased', 'Vd', 1, 1, 'Pd 作為汲極接觸金屬'),
  layer('top-sb2o3', '上方 Sb₂O₃ 介電層', 'sb2o3', 'dielectric', { length_um: 6, width_um: 2.5, thickness_nm: 20, x_um: 0, y_um: 0, z_nm: 500041 }, 'none', undefined, null, 0.65, '上方閘極介電層'),
  layer('top-gate', '上閘極', 'pd', 'gate', { length_um: 3, width_um: 2, thickness_nm: 30, x_um: 0.5, y_um: 0, z_nm: 500061 }, 'biased', 'Vg', 0, 1, '上閘極金屬'),
]

export const initialDeviceStructure: DeviceStructure = {
  id: 'sb-wse2-topgate-001',
  templateId: 'sb_bulk_wse2_top_gate',
  name: 'Sb/WSe₂ 上閘極元件 v1',
  description: 'Sb 塊材底部源極 + WSe₂ 通道 + Pd 汲極 + Sb₂O₃ 介電 + 上閘極',
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
  ],
  hypotheses: [
    { id: 'hyp-001', title: 'In 可以減少金屬對 Sb₂O₃ 的衝擊', description: '使用 In 作為緩衝層可能降低後續金屬沉積對 Sb₂O₃ 介電層的損傷', status: 'testing', createdAt: '2024-12-01' },
    { id: 'hyp-002', title: 'Pd/WSe₂ 接觸傾向 p-type', description: '高功函數 Pd 對 WSe₂ 的接觸特性可能受 Fermi-level pinning 影響', status: 'confirmed', createdAt: '2024-11-15' },
    { id: 'hyp-003', title: 'Sb₂O₃ 可作為保護層', description: 'Sb 表面自然氧化形成的 Sb₂O₃ 可能同時作為保護層與介電層', status: 'open', createdAt: '2024-12-05' },
    { id: 'hyp-004', title: 'RIE O₂ 可穩定產生 WOx', description: '低功率短時間 RIE O₂ 處理可以在 WSe₂ 表面形成均勻 WOx', status: 'testing', createdAt: '2024-12-08' },
  ],
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
): Material {
  return { id, name, displayName, category, description, color, bandGap_eV, electronAffinity_eV, workFunction_eV, dielectricConstant, mobility_cm2Vs, latticeConstant_A, defaultThickness_nm, notes }
}

function layer(
  id: string,
  name: string,
  materialId: string,
  role: DeviceLayerRole,
  geometry: DeviceLayer['geometry'],
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
