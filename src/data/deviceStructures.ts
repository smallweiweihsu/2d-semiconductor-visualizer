import type { DeviceLayer, DeviceStructure, DeviceTemplate } from '../types/device'

const basic2dLayers: DeviceLayer[] = [
  {
    id: 'layer-substrate-si',
    name: 'Si 基板',
    materialId: 'si',
    role: 'substrate',
    geometry: {
      length_um: 10,
      width_um: 5,
      thickness_nm: 500000,
      x_um: 0,
      y_um: 0,
      z_nm: 0,
      rotation_deg: 0,
    },
    voltageMode: 'none',
    voltageValue_V: null,
    visible: true,
    opacity: 1,
    notes_zh: '基礎範例用的支撐基板；厚度在預覽中會被壓縮顯示。',
  },
  {
    id: 'layer-dielectric-sio2',
    name: 'SiO₂ 介電層',
    materialId: 'sio2',
    role: 'dielectric',
    geometry: {
      length_um: 10,
      width_um: 5,
      thickness_nm: 90,
      x_um: 0,
      y_um: 0,
      z_nm: 500000,
      rotation_deg: 0,
    },
    voltageMode: 'none',
    voltageValue_V: null,
    visible: true,
    opacity: 1,
    notes_zh: '基礎背閘介電層範例。',
  },
  {
    id: 'layer-channel-wse2',
    name: 'WSe₂ 通道',
    materialId: 'wse2',
    role: 'semiconductor',
    geometry: {
      length_um: 5,
      width_um: 2,
      thickness_nm: 1,
      x_um: 2.5,
      y_um: 1.5,
      z_nm: 500090,
      rotation_deg: 0,
    },
    voltageMode: 'none',
    voltageValue_V: null,
    visible: true,
    opacity: 1,
    notes_zh: '二維半導體通道範例；真實層數與厚度需由實驗確認。',
  },
  {
    id: 'layer-source-pd',
    name: 'Pd 源極',
    materialId: 'pd',
    role: 'source',
    geometry: {
      length_um: 1,
      width_um: 2,
      thickness_nm: 30,
      x_um: 2,
      y_um: 1.5,
      z_nm: 500091,
      rotation_deg: 0,
    },
    voltageMode: 'grounded',
    voltageLabel: 'Vs',
    voltageValue_V: 0,
    visible: true,
    opacity: 1,
    notes_zh: '範例源極接觸；接觸電阻與界面態尚未計算。',
  },
  {
    id: 'layer-drain-pd',
    name: 'Pd 汲極',
    materialId: 'pd',
    role: 'drain',
    geometry: {
      length_um: 1,
      width_um: 2,
      thickness_nm: 30,
      x_um: 7,
      y_um: 1.5,
      z_nm: 500091,
      rotation_deg: 0,
    },
    voltageMode: 'biased',
    voltageLabel: 'Vd',
    voltageValue_V: 1,
    visible: true,
    opacity: 1,
    notes_zh: '範例汲極接觸；目前不進行 I-V 計算。',
  },
]

const sbBulkWse2TopGateLayers: DeviceLayer[] = [
  {
    id: 'sb-bulk-source',
    name: 'Sb 塊材 / 底部源極',
    materialId: 'sb-bulk',
    role: 'source',
    geometry: {
      length_um: 10,
      width_um: 5,
      thickness_nm: 500000,
      x_um: 0,
      y_um: 0,
      z_nm: 0,
      rotation_deg: 0,
    },
    voltageMode: 'grounded',
    voltageLabel: 'Vs',
    voltageValue_V: 0,
    visible: true,
    opacity: 1,
    notes_zh: 'Sb 塊材作為底部平台與源極，表面可能形成 Sb₂O₃。',
  },
  {
    id: 'local-sb2o3',
    name: '局部 Sb₂O₃',
    materialId: 'sb2o3',
    role: 'oxide',
    geometry: {
      length_um: 3,
      width_um: 2.5,
      thickness_nm: 10,
      x_um: -2,
      y_um: 0,
      z_nm: 500000,
      rotation_deg: 0,
    },
    voltageMode: 'none',
    voltageValue_V: null,
    visible: true,
    opacity: 0.75,
    notes_zh:
      '局部氧化層或介電區域，實際厚度與均勻性需由 AFM、XPS 或製程條件確認。',
  },
  {
    id: 'wse2-channel',
    name: 'WSe₂ 通道',
    materialId: 'wse2',
    role: 'semiconductor',
    geometry: {
      length_um: 5,
      width_um: 2,
      thickness_nm: 1,
      x_um: 0,
      y_um: 0,
      z_nm: 500010,
      rotation_deg: 0,
    },
    voltageMode: 'none',
    voltageValue_V: null,
    visible: true,
    opacity: 0.9,
    notes_zh:
      'WSe₂ 作為二維半導體通道；層數、缺陷、接觸金屬與氧化程度會強烈影響導通。',
  },
  {
    id: 'pd-drain',
    name: 'Pd 汲極接觸',
    materialId: 'pd',
    role: 'drain',
    geometry: {
      length_um: 1.2,
      width_um: 2,
      thickness_nm: 30,
      x_um: -1.8,
      y_um: 0,
      z_nm: 500011,
      rotation_deg: 0,
    },
    voltageMode: 'biased',
    voltageLabel: 'Vd',
    voltageValue_V: 1,
    visible: true,
    opacity: 1,
    notes_zh:
      'Pd 作為汲極接觸金屬；實際接觸行為可能受 Fermi-level pinning、界面態、缺陷與退火影響。',
  },
  {
    id: 'top-sb2o3',
    name: '上方 Sb₂O₃ 介電層',
    materialId: 'sb2o3',
    role: 'dielectric',
    geometry: {
      length_um: 6,
      width_um: 2.5,
      thickness_nm: 20,
      x_um: 0,
      y_um: 0,
      z_nm: 500041,
      rotation_deg: 0,
    },
    voltageMode: 'none',
    voltageValue_V: null,
    visible: true,
    opacity: 0.65,
    notes_zh:
      '上方閘極介電層；介電常數、厚度、漏電與崩潰電場需後續文獻與實驗校準。',
  },
  {
    id: 'top-gate',
    name: '上閘極',
    materialId: 'au',
    role: 'gate',
    geometry: {
      length_um: 3,
      width_um: 2,
      thickness_nm: 30,
      x_um: 0.5,
      y_um: 0,
      z_nm: 500061,
      rotation_deg: 0,
    },
    voltageMode: 'biased',
    voltageLabel: 'Vg',
    voltageValue_V: 0,
    visible: true,
    opacity: 1,
    notes_zh: '上閘極金屬可依實驗設計改成 Pd、Au、Ti、In 或其他金屬。',
  },
]

export const deviceTemplates: DeviceTemplate[] = [
  {
    id: 'basic_2d_semiconductor_stack',
    name_zh: '基礎二維半導體堆疊',
    shortName_zh: '基礎堆疊',
    description_zh:
      '通用 Si / SiO₂ / WSe₂ / Pd 範例，用於熟悉材料層編輯器與 2D 側視預覽。',
    purpose_zh: '作為元件結構編輯器的入門範例。',
    layers: basic2dLayers,
    categories: ['generic', 'fet'],
    tags_zh: ['通用範例', '二維通道', 'Pd 接觸'],
    assumptions_zh: [
      '所有材料層以矩形近似。',
      'Si 基板厚度在 2D 預覽中經過壓縮顯示。',
      '尚未計算接觸電阻、能帶、電場或量測響應。',
    ],
    warnings_zh: [
      '此模板只是通用起始結構，不能代表特定樣品的真實製程。',
      'Pd/WSe₂ 接觸需要後續實驗與文獻資料校準。',
    ],
  },
  {
    id: 'sb_bulk_wse2_top_gate',
    name_zh: 'Sb 塊材底部源極 WSe₂ 上閘極元件',
    shortName_zh: 'Sb/WSe₂ 上閘極模板',
    description_zh:
      '依照 Sb 塊材 / 局部 Sb₂O₃ / WSe₂ / Pd 汲極 / 上方 Sb₂O₃ / 上閘極概念建立的可編輯幾何模板。',
    purpose_zh:
      '用於整理 Sb 塊材作為底部平台與源極、WSe₂ 作為二維通道、Pd 作為汲極接觸，以及 Sb₂O₃ 上閘極介電層的初始結構。',
    layers: sbBulkWse2TopGateLayers,
    categories: ['user_research', 'fet', 'top_gate', 'bottom_source'],
    tags_zh: ['使用者研究模板', 'Sb 底部源極', 'WSe₂ 通道', 'Pd 汲極', '上閘極'],
    assumptions_zh: [
      '目前以矩形區域近似所有材料層。',
      '局部 Sb₂O₃、Pd 接觸與上閘極位置僅為初始示意，可由使用者調整。',
      '厚度顯示在 2D 預覽中經過視覺縮放，不代表真實比例。',
      '尚未計算接觸電阻、能帶、電場、擴散或氧化。',
    ],
    warnings_zh: [
      'Sb₂O₃ 參數仍需文獻與實驗校準。',
      'Pd/WSe₂ 接觸不應視為理想 ohmic contact。',
      'Sb 表面氧化、金屬沉積損傷與退火後擴散需後續製程模組處理。',
      '若 top gate 與 WSe₂ 之間介電層過薄，後續需檢查漏電與崩潰風險。',
    ],
    recommendedUse_zh: [
      '先調整局部 Sb₂O₃、Pd 汲極與上閘極的位置，再進行後續模板或 3D 視覺化批次。',
      '若要比較不同金屬接觸，可將上閘極或汲極材料改成 Pd、Au、Ti、In 等候選材料。',
    ],
  },
]

export const initialDeviceTemplate =
  deviceTemplates.find((template) => template.id === 'sb_bulk_wse2_top_gate') ??
  deviceTemplates[0]

export const initialDeviceStructure = createDeviceStructureFromTemplate(
  initialDeviceTemplate,
)

export function createDeviceStructureFromTemplate(
  template: DeviceTemplate,
): DeviceStructure {
  return {
    id: `${template.id}-structure`,
    templateId: template.id,
    name: template.name_zh,
    description_zh: template.purpose_zh,
    layers: cloneLayers(template.layers),
  }
}

export function cloneLayers(layers: DeviceLayer[]) {
  return layers.map((layer) => ({
    ...layer,
    geometry: { ...layer.geometry },
    warnings_zh: layer.warnings_zh ? [...layer.warnings_zh] : undefined,
  }))
}
