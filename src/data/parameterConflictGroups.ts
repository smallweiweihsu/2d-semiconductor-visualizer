import type { ParameterConflictGroup } from '../types/literature'

export const parameterConflictGroups: ParameterConflictGroup[] = [
  {
    id: 'conflict-wse2-band-gap-layer-method',
    materialId: 'wse2',
    parameterKey: 'bandGap_eV',
    evidenceIds: ['evidence-zhou-2015-wse2-band-gap'],
    summary_zh:
      'WSe₂ 能隙與層數、溫度、應變、基板與量測方法有關；bulk 常被視為 indirect gap，monolayer 常被視為 direct optical transition，但不能用單一值代表所有樣品。',
    recommendedStatus: 'condition_dependent',
    recommendedValue: null,
    warnings_zh: [
      '後續正式材料資料庫應區分 bulk / few-layer / monolayer 與 optical/electronic gap。',
    ],
  },
  {
    id: 'conflict-wse2-oxidation-raman-rate',
    materialId: 'wse2',
    parameterKey: 'oxidationRate_nm_per_s',
    evidenceIds: [
      'evidence-li-2016-wse2-surface-oxidation',
      'evidence-wse2-oxidation-rate',
      'evidence-raman-probe-depth',
    ],
    summary_zh:
      'WSe₂ 氧化速率與 Raman 可見性高度依賴 oxygen plasma / RIE / UV ozone 條件、層數與量測設定；Raman 仍看到 WSe₂ 不等於完全未氧化。',
    recommendedStatus: 'needs_review',
    warnings_zh: [
      '不可把單一氧化條件下的 Raman 結果推廣到所有 O₂ RIE 或 UV ozone 條件。',
    ],
  },
  {
    id: 'conflict-sb2o3-dielectric-process-dependent',
    materialId: 'sb2o3',
    parameterKey: 'dielectricConstant',
    evidenceIds: [
      'evidence-messalea-2021-sb2o3-band-gap',
      'evidence-messalea-2021-sb2o3-dielectric-constant',
      'evidence-sb2o3-breakdown-2024-breakdown-field',
      'evidence-sb2o3-dielectric',
    ],
    summary_zh:
      'Sb₂O₃ 介電常數與 breakdown field 可能受相、厚度、缺陷、氧空缺與沉積方法影響，不應只用單一常數。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['正式材料資料庫應保留製程條件與量測方法欄位。'],
  },
  {
    id: 'conflict-pd-wse2-contact-not-guaranteed-ohmic',
    materialId: 'wse2',
    parameterKey: 'contactResistance_ohm',
    evidenceIds: [
      'evidence-wse2-vdw-contacts-2022-pd-contact',
      'evidence-pd-wse2-contact',
    ],
    summary_zh:
      'Pd/WSe₂ 接觸行為可能受 Fermi-level pinning、界面態、金屬誘發能隙態、污染與退火影響；work function alone 不足以判斷接觸。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['電性模型應維持接觸電阻手動校準與高不確定性提醒。'],
  },
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
