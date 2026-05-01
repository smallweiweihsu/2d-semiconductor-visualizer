import type { DiffusionScenario } from '../types/diffusion'

const baseSb2O3Scenario = {
  hostMaterialId: 'sb2o3',
  temperature_C: 150,
  time_s: 1800,
  D0_m2s: null,
  Ea_eV: null,
  dimensionality: 'one_d',
  interfaceBarrierFactor: 1,
  grainBoundaryMultiplier: 1,
  defectMultiplier: 1,
  initialMixingDepth_nm: 0,
  confidence: 'unknown',
} satisfies Omit<
  DiffusionScenario,
  'id' | 'name_zh' | 'diffusingSpecies' | 'notes_zh'
>

function metalIntoSb2O3(
  id: string,
  species: string,
  notes_zh: string,
): DiffusionScenario {
  return {
    ...baseSb2O3Scenario,
    id,
    name_zh: `${species} 進入 Sb₂O₃`,
    diffusingSpecies: species,
    notes_zh,
  }
}

export const diffusionPresets: DiffusionScenario[] = [
  metalIntoSb2O3(
    'pd_into_sb2o3',
    'Pd',
    'Pd 進入 Sb₂O₃ 的擴散參數需要文獻或實驗校準；目前不可直接定量。',
  ),
  metalIntoSb2O3(
    'in_into_sb2o3',
    'In',
    'In 可作為候選緩衝金屬；是否降低 Sb₂O₃ 介面衝擊需由文獻與實驗確認。',
  ),
  metalIntoSb2O3(
    'ti_into_sb2o3',
    'Ti',
    'Ti 與氧化層界面可能有反應性；D0/Ea 需要文獻或實驗校準。',
  ),
  metalIntoSb2O3(
    'au_into_sb2o3',
    'Au',
    'Au 進入 Sb₂O₃ 的擴散參數目前未填入；結果不可直接定量。',
  ),
  metalIntoSb2O3(
    'cr_into_sb2o3',
    'Cr',
    'Cr 進入 Sb₂O₃ 的擴散與界面反應需要文獻或實驗校準。',
  ),
  metalIntoSb2O3(
    'ni_into_sb2o3',
    'Ni',
    'Ni 進入 Sb₂O₃ 的擴散參數目前未知，僅作流程占位。',
  ),
  metalIntoSb2O3(
    'pt_into_sb2o3',
    'Pt',
    'Pt 進入 Sb₂O₃ 的擴散參數目前未知，需後續文獻驗證。',
  ),
  metalIntoSb2O3(
    'al_into_sb2o3',
    'Al',
    'Al 可能與氧化物界面發生反應；此情境需要額外文獻與實驗校準。',
  ),
  metalIntoSb2O3(
    'cu_into_sb2o3',
    'Cu',
    'Cu 在許多材料中可能有較高遷移性，但 Sb₂O₃ 相關參數不可猜測。',
  ),
  metalIntoSb2O3(
    'ag_into_sb2o3',
    'Ag',
    'Ag 進入 Sb₂O₃ 的擴散參數目前未知，僅作未來擴充占位。',
  ),
  {
    ...baseSb2O3Scenario,
    id: 'oxygen_in_wse2_placeholder',
    name_zh: 'O 於 WSe₂ 氧化占位',
    diffusingSpecies: 'O',
    hostMaterialId: 'wse2',
    notes_zh:
      '氧於 WSe₂ 的氧化/擴散涉及化學反應與缺陷，將在後續氧化模組獨立處理。',
  },
  {
    ...baseSb2O3Scenario,
    id: 'sb_surface_oxidation_placeholder',
    name_zh: 'Sb 表面氧化占位',
    diffusingSpecies: 'O',
    hostMaterialId: 'sb-bulk',
    notes_zh:
      'Sb 表面氧化成 Sb₂O₃ 涉及氧化反應與表面化學，目前僅作後續氧化模組占位。',
  },
]

export const defaultDiffusionScenario =
  diffusionPresets.find((preset) => preset.id === 'pd_into_sb2o3') ??
  diffusionPresets[0]
