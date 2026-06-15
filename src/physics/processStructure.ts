// 製程 → 結構演化（第一版，半定性）。
// 規則：沉積=新增層；蝕刻=削薄頂層；氧化=頂層部分轉成氧化物並新增氧化層。
// 注意：此為定性研究輔助，不是真實製程模擬；厚度與轉換比例需實驗校準。
import type { DeviceLayer, DeviceStructure, ElectricalRole, DeviceLayerRole, ProcessStep } from '../types/semiviz'

function parseThicknessNm(text?: string, fallback = 20): number {
  if (!text) return fallback
  const m = text.match(/([\d.]+)\s*nm/i)
  if (m) return parseFloat(m[1])
  const um = text.match(/([\d.]+)\s*(?:um|µm|μm)/i)
  if (um) return parseFloat(um[1]) * 1000
  const n = parseFloat(text)
  return Number.isFinite(n) ? n : fallback
}

const oxideOf: Record<string, string> = { wse2: 'wox', mos2: 'wox', 'sb-bulk': 'sb2o3', sb: 'sb2o3' }

let uid = 0
function makeLayer(opts: {
  name: string
  materialId: string
  role: DeviceLayerRole
  electricalRole: ElectricalRole
  thickness_nm: number
  stackOrder: number
}): DeviceLayer {
  uid += 1
  return {
    id: `proc-${Date.now()}-${uid}`,
    name: opts.name,
    materialId: opts.materialId,
    role: opts.role,
    electricalRole: opts.electricalRole,
    stackOrder: opts.stackOrder,
    geometry: { length_um: 5, width_um: 2, thickness_nm: opts.thickness_nm, x_um: 0, y_um: 0, z_nm: opts.stackOrder * 10 },
    voltageMode: 'none',
    visible: true,
    opacity: 0.85,
    notes: '製程模擬產生',
  }
}

function topLayer(layers: DeviceLayer[]): DeviceLayer | undefined {
  return layers.length ? layers[layers.length - 1] : undefined
}

export function applyProcessStep(layers: DeviceLayer[], step: ProcessStep): DeviceLayer[] {
  const next = layers.map((l) => ({ ...l, geometry: { ...l.geometry } }))
  const order = next.length
  switch (step.type) {
    case 'metal_deposition':
    case 'thermal_evaporation':
    case 'ebeam_evaporation':
      next.push(makeLayer({ name: `${step.materialId ?? 'Pd'} 金屬`, materialId: step.materialId ?? 'pd', role: 'contact', electricalRole: 'contact', thickness_nm: parseThicknessNm(step.thickness, 30), stackOrder: order }))
      return next
    case 'dielectric_deposition':
      next.push(makeLayer({ name: `${step.materialId ?? 'Sb₂O₃'} 介電層`, materialId: step.materialId ?? 'sb2o3', role: 'dielectric', electricalRole: 'gate_dielectric', thickness_nm: parseThicknessNm(step.thickness, 20), stackOrder: order }))
      return next
    case 'exfoliation':
    case 'dry_transfer': {
      // 若還沒有半導體通道，加入 WSe₂
      if (!next.some((l) => l.electricalRole === 'channel')) {
        next.push(makeLayer({ name: 'WSe₂ 通道', materialId: step.materialId ?? 'wse2', role: 'semiconductor', electricalRole: 'channel', thickness_nm: parseThicknessNm(step.thickness, 1), stackOrder: order }))
      }
      return next
    }
    case 'oxidation': {
      const top = topLayer(next)
      if (!top) return next
      const oxThk = parseThicknessNm(step.thickness, 5)
      // 削薄頂層
      top.geometry.thickness_nm = Math.max(0.5, top.geometry.thickness_nm - oxThk)
      const oxMat = oxideOf[top.materialId] ?? 'sb2o3'
      next.push(makeLayer({ name: `${oxMat === 'wox' ? 'WOx' : 'Sb₂O₃'}（氧化）`, materialId: oxMat, role: 'oxide', electricalRole: 'buffer', thickness_nm: oxThk, stackOrder: next.length }))
      return next
    }
    case 'rie': {
      const top = topLayer(next)
      if (top) top.geometry.thickness_nm = Math.max(0.5, top.geometry.thickness_nm - parseThicknessNm(step.thickness, 5))
      return next
    }
    default:
      // 量測、退火、微影、lift-off、擴散：結構不變（第一版）
      return next
  }
}

export interface ProcessStageResult {
  step: ProcessStep
  layers: DeviceLayer[]
}

/** 從 base 的基板層開始，逐步套用製程，回傳每一步後的結構。 */
export function simulateProcessFlow(base: DeviceStructure, steps: ProcessStep[]): ProcessStageResult[] {
  const ordered = [...steps].sort((a, b) => a.order - b.order)
  const substrate = base.layers.filter((l) => l.electricalRole === 'substrate' || l.role === 'substrate' || l.role === 'bulk')
  let current: DeviceLayer[] = (substrate.length ? substrate : base.layers.slice(0, 1)).map((l) => ({ ...l, geometry: { ...l.geometry } }))
  const results: ProcessStageResult[] = []
  for (const step of ordered) {
    current = applyProcessStep(current, step)
    results.push({ step, layers: current.map((l) => ({ ...l, geometry: { ...l.geometry } })) })
  }
  return results
}
