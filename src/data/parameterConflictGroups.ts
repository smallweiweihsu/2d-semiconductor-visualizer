import type { ParameterConflictGroup } from '../types/literature'

export const parameterConflictGroups: ParameterConflictGroup[] = [
  {
    id: 'conflict-in-sb2o3-interface-buffer',
    materialId: 'in',
    parameterKey: 'custom',
    evidenceIds: ['evidence-in-sb2o3-buffer'],
    summary_zh:
      'In 是否可降低金屬對 Sb₂O₃ 的界面衝擊目前僅作為研究假設，需要文獻與實驗條件比對。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['不得直接假設 In 一定改善所有金屬 / Sb₂O₃ 介面。'],
  },
  {
    id: 'conflict-sb2o3-dielectric-constant',
    materialId: 'sb2o3',
    parameterKey: 'dielectricConstant',
    evidenceIds: ['evidence-sb2o3-dielectric'],
    summary_zh:
      'Sb₂O₃ 介電常數文獻值可能受製程、頻率、薄膜密度、缺陷與漏電影響。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['未分類製程條件前，不應將單一數值作為全域預設。'],
  },
  {
    id: 'conflict-pd-wse2-ohmic',
    materialId: 'wse2',
    parameterKey: 'contactResistance_ohm',
    evidenceIds: ['evidence-pd-wse2-contact'],
    summary_zh:
      'Pd/WSe₂ 接觸是否近似 ohmic 取決於界面態、pinning、污染、退火與量測條件。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['不可僅用 work function 判定真實 2D 接觸行為。'],
  },
  {
    id: 'conflict-wse2-oxidation-raman-visible',
    materialId: 'wse2',
    parameterKey: 'ramanProbeDepth_nm',
    evidenceIds: ['evidence-raman-probe-depth', 'evidence-wse2-oxidation-rate'],
    summary_zh:
      'WSe₂ 氧化後 Raman 仍可見可能來自表面只氧化、氧化不均、下層殘留或 WOx 訊號較弱等多種原因。',
    recommendedStatus: 'no_recommendation',
    warnings_zh: ['Raman 仍可見不代表完全沒有氧化，Raman 消失也不代表完全氧化。'],
  },
]
