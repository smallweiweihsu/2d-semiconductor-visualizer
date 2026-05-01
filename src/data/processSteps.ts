import type {
  ProcessParameter,
  ProcessParameterType,
  ProcessParameterValue,
  ProcessStep,
  ProcessStepType,
} from '../types/process'

const sharedAssumptions = [
  '目前只記錄流程條件與研究假設，不會自動轉換為元件幾何或物理結果。',
  '未來批次可將此資料連接到擴散、氧化、量測對照與製程風險模型。',
]

const sharedWarnings = [
  '此步驟目前不是製程模擬結果。',
  '真實解讀需要實驗條件、儀器設定、材料批次與文獻校準。',
]

function parameter(
  id: string,
  label_zh: string,
  type: ProcessParameterType,
  value: ProcessParameterValue = null,
  options: string[] = [],
  unit?: string,
  required = false,
  note_zh = '需要使用者依實驗條件填寫；目前僅作為製程流程資料欄位。',
): ProcessParameter {
  return {
    id,
    label_zh,
    type,
    value,
    unit,
    options,
    confidence: value === null || value === '' ? 'unknown' : 'estimated',
    note_zh,
    required,
  }
}

function text(id: string, label_zh: string, required = false, value = '') {
  return parameter(id, label_zh, 'text', value, [], undefined, required)
}

function textarea(id: string, label_zh: string, value = '') {
  return parameter(id, label_zh, 'textarea', value)
}

function number(
  id: string,
  label_zh: string,
  unit?: string,
  required = false,
  value: number | null = null,
) {
  return parameter(id, label_zh, 'number', value, [], unit, required)
}

function select(
  id: string,
  label_zh: string,
  options: string[],
  required = false,
  value = '',
) {
  return parameter(id, label_zh, 'select', value, options, undefined, required)
}

function booleanParam(id: string, label_zh: string, value = false) {
  return parameter(id, label_zh, 'boolean', value)
}

function createStep(
  id: string,
  type: ProcessStepType,
  name_zh: string,
  description_zh: string,
  parameters: ProcessParameter[],
  warnings_zh: string[] = [],
): ProcessStep {
  return {
    id,
    type,
    name_zh,
    description_zh,
    parameters,
    linkedLayerIds: [],
    assumptions_zh: sharedAssumptions,
    warnings_zh: [...warnings_zh, ...sharedWarnings],
    notes_zh: '',
    enabled: true,
  }
}

export const processStepTemplates: ProcessStep[] = [
  createStep(
    'template-metal-deposition',
    'metal_deposition',
    '金屬沉積',
    '記錄金屬接觸、緩衝層或閘極金屬的沉積條件。',
    [
      select(
        'metal_material',
        '金屬材料',
        ['Pd', 'Ti', 'Au', 'Cr', 'Ni', 'Pt', 'Al', 'Ag', 'Cu', 'Sc', 'In', '自訂'],
        true,
        'Pd',
      ),
      number('target_thickness_nm', '目標厚度', 'nm', true),
      number('deposition_rate_A_s', '沉積速率', 'Å/s'),
      select('deposition_method', '沉積方法', ['thermal evaporation', 'e-beam evaporation', 'sputtering', 'ALD', 'custom']),
      number('chamber_pressure_Torr', '腔體壓力', 'Torr'),
      number('substrate_temperature_C', '基板溫度', '°C'),
      booleanParam('interface_damage_risk', '是否可能造成界面損傷'),
      textarea('notes', '備註'),
    ],
    [
      '金屬沉積可能造成界面混合、缺陷或局部損傷。',
      'In 可能作為緩衝層候選，但實際效果仍需文獻與實驗驗證。',
    ],
  ),
  createStep(
    'template-sb2o3-deposition',
    'dielectric_deposition',
    'Sb₂O₃ 沉積',
    '記錄 Sb₂O₃、HfO₂、Al₂O₃ 或其他介電層沉積條件。',
    [
      number('target_thickness_nm', '目標厚度', 'nm', true),
      select('deposition_method', '沉積方法', ['thermal oxidation', 'evaporation', 'ALD', 'sputtering', 'custom']),
      number('deposition_rate_A_s', '沉積速率', 'Å/s'),
      number('substrate_temperature_C', '基板溫度', '°C'),
      text('oxygen_content', '氧含量或氧分壓'),
      textarea('uniformity_notes', '均勻性備註'),
    ],
    ['Sb₂O₃ 介電常數、缺陷與漏電特性需後續校準。'],
  ),
  createStep(
    'template-oxidation',
    'oxidation',
    '氧化處理',
    '記錄 WSe₂ 氧化、Sb 表面氧化或其他氧化處理條件。',
    [
      text('initial_material', '初始材料', true),
      text('target_oxide', '目標氧化物'),
      select('oxidation_method', '氧化方法', ['O₂ RIE', 'UV ozone', 'thermal oxidation', 'ambient exposure', 'custom'], true),
      number('time_min', '時間', 'min', true),
      number('temperature_C', '溫度', '°C'),
      text('oxygen_concentration', '氧氣濃度'),
      text('humidity', '濕度'),
      number('power_W', '功率', 'W'),
      number('expected_oxidation_depth_nm', '預期氧化深度', 'nm'),
      textarea('notes', '備註'),
    ],
    ['氧化反應與厚度高度依賴表面狀態、缺陷與環境。'],
  ),
  createStep(
    'template-diffusion-annealing',
    'diffusion_annealing',
    '擴散退火',
    '記錄退火溫度、時間、氣氛與可能的金屬/氧/缺陷擴散。',
    [
      number('temperature_C', '退火溫度', '°C', true),
      number('time_min', '退火時間', 'min', true),
      select('atmosphere', '氣氛', ['vacuum', 'Ar', 'N₂', 'forming gas', 'O₂', 'air', 'custom']),
      text('diffusing_species', '擴散物種'),
      text('host_material', 'host material'),
      number('D0_m2s', 'D0', 'm²/s'),
      number('Ea_eV', 'Ea', 'eV'),
      booleanParam('defect_multiplier_enabled', '是否啟用晶界/缺陷倍率'),
      textarea('notes', '備註'),
    ],
    ['D0 與 Ea 若缺少文獻參數，不可直接定量解釋擴散長度。'],
  ),
  createStep(
    'template-o2-rie',
    'rie',
    'O₂ RIE',
    '記錄氧氣反應式離子蝕刻或氧化條件。',
    [
      select('gas', '氣體', ['O₂', 'Ar/O₂', 'CF₄/O₂', 'custom'], true, 'O₂'),
      number('power_W', '功率', 'W', true),
      number('time_s', '時間', 's', true),
      number('pressure_mTorr', '壓力', 'mTorr'),
      number('flow_sccm', '流量', 'sccm'),
      number('sample_temperature_C', '樣品溫度', '°C'),
      text('target_material', '目標材料', true),
      textarea('expected_effect', '預期蝕刻/氧化效果'),
      textarea('notes', '備註'),
    ],
    ['RIE 可能造成表面缺陷、過蝕刻或 Raman 訊號變化。'],
  ),
  createStep(
    'template-sem',
    'sem',
    'SEM 觀察',
    '記錄 SEM 影像條件與觀察重點。',
    [
      number('accelerating_voltage_kV', '加速電壓', 'kV'),
      text('magnification', '放大倍率'),
      number('working_distance_mm', '工作距離', 'mm'),
      text('detector', '偵測器'),
      textarea('observation_target', '觀察目標'),
      booleanParam('beam_damage_possible', '是否可能造成 beam damage'),
      textarea('notes', '備註'),
    ],
  ),
  createStep(
    'template-ebeam-lithography',
    'ebeam_lithography',
    'E-beam lithography',
    '記錄電子束微影條件，例如劑量、顯影、圖案與對位。',
    [
      text('resist', 'resist', true),
      number('dose_uC_cm2', '劑量', 'µC/cm²', true),
      number('acceleration_voltage_keV', '加速電壓', 'keV'),
      text('pattern_name', '圖案名稱'),
      textarea('development_condition', '顯影條件'),
      text('alignment_mark', '對位標記'),
      textarea('notes', '備註'),
    ],
    ['E-beam 製程可能帶入殘膠、污染或接觸界面問題。'],
  ),
  createStep(
    'template-electrical-measurement',
    'electrical_measurement',
    '電性量測',
    '記錄 I-V、Id-Vg、接觸電阻與常溫電性量測條件。',
    [
      select('measurement_mode', '量測模式', ['I-V', 'Id-Vg', 'transfer curve', 'output curve', 'contact resistance', 'custom'], true),
      text('vd_sweep_range', 'Vd 掃描範圍'),
      text('vg_sweep_range', 'Vg 掃描範圍'),
      number('compliance_current_A', 'compliance current', 'A'),
      number('sweep_rate_V_s', '掃描速率', 'V/s'),
      booleanParam('vacuum_enabled', '是否真空'),
      booleanParam('dark_measurement', '是否避光'),
      textarea('notes', '備註'),
    ],
  ),
  createStep(
    'template-low-temperature-electrical',
    'low_temperature_electrical_measurement',
    '低溫電性量測',
    '記錄降溫電性量測條件，例如溫度範圍、掃描參數與偏壓。',
    [
      text('temperature_range_K', '溫度範圍', true),
      number('cooling_rate_K_min', '降溫速率', 'K/min'),
      text('vd_sweep_range', 'Vd 掃描範圍'),
      text('vg_sweep_range', 'Vg 掃描範圍'),
      text('measurement_atmosphere', '量測氣氛'),
      textarea('notes', '備註'),
    ],
  ),
  createStep(
    'template-raman',
    'raman',
    'Raman',
    '記錄 Raman 量測條件，例如雷射波長、功率、積分時間與量測區域。',
    [
      number('laser_wavelength_nm', '雷射波長', 'nm'),
      number('laser_power_mW', '雷射功率', 'mW', true),
      number('integration_time_s', '積分時間', 's'),
      text('grating', '光柵'),
      text('measurement_range', '量測範圍'),
      number('spot_size_um', 'spot size', 'µm'),
      booleanParam('mapping_enabled', '是否 mapping'),
      textarea('notes', '備註'),
    ],
    ['高功率 Raman 可能造成 2D 材料局部加熱或損傷。'],
  ),
  createStep(
    'template-low-power-raman',
    'low_power_raman',
    '低功率 Raman',
    '記錄低功率 Raman 條件，用於降低雷射造成材料損傷的風險。',
    [
      number('laser_wavelength_nm', '雷射波長', 'nm'),
      number('laser_power_uW', '雷射功率', 'µW'),
      number('integration_time_s', '積分時間', 's'),
      text('measurement_range', '量測範圍'),
      text('target_peak', '目標 peak'),
      textarea('notes', '備註'),
    ],
  ),
  createStep(
    'template-pl',
    'pl',
    'PL',
    '記錄光致發光量測條件與材料發光響應。',
    [
      number('excitation_wavelength_nm', '激發波長', 'nm'),
      number('power_uW', '功率', 'µW'),
      number('integration_time_s', '積分時間', 's'),
      number('temperature_K', '溫度', 'K'),
      text('measurement_range', '量測範圍'),
      textarea('notes', '備註'),
    ],
  ),
  createStep(
    'template-afm',
    'afm',
    'AFM',
    '記錄 AFM 厚度、粗糙度與形貌量測條件。',
    [
      select('mode', '模式', ['tapping', 'contact', 'non-contact', 'custom']),
      text('scan_area', '掃描面積'),
      number('scan_rate_Hz', '掃描速率', 'Hz'),
      textarea('measurement_target', '量測目標'),
      textarea('thickness_roughness_notes', '厚度 / roughness notes'),
      textarea('notes', '備註'),
    ],
  ),
  createStep(
    'template-xps',
    'xps',
    'XPS',
    '記錄元素組成、氧化態、深度分析與表面化學量測條件。',
    [
      text('target_elements', '目標元素', true),
      select('scan_mode', '掃描模式', ['survey', 'high resolution', 'depth profile', 'custom']),
      booleanParam('depth_profiling_enabled', '是否深度分析'),
      textarea('sputter_condition', 'sputter 條件'),
      textarea('oxidation_state_analysis', '氧化態分析'),
      textarea('notes', '備註'),
    ],
    ['XPS 深度分析可能改變表面化學狀態，需謹慎解讀。'],
  ),
  createStep(
    'template-custom',
    'custom',
    '自訂步驟',
    '使用者自訂製程或量測步驟。',
    [
      text('step_name', '步驟名稱', true),
      textarea('purpose', '目的'),
      textarea('main_parameters', '主要參數'),
      textarea('notes', '備註'),
    ],
  ),
]

export function cloneProcessStep(
  template: ProcessStep,
  idSuffix: string | number = Date.now(),
) {
  return {
    ...template,
    id: `${template.type}-${idSuffix}-${Math.round(Math.random() * 10000)}`,
    parameters: template.parameters.map((parameterItem) => ({
      ...parameterItem,
      options: parameterItem.options ? [...parameterItem.options] : undefined,
    })),
    linkedLayerIds: template.linkedLayerIds ? [...template.linkedLayerIds] : [],
    assumptions_zh: [...template.assumptions_zh],
    warnings_zh: [...template.warnings_zh],
  }
}

export function getProcessStepTemplate(type: ProcessStepType) {
  return processStepTemplates.find((template) => template.type === type)
}
