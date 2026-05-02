import type { ParameterConflictGroup } from '../types/literature'

export const parameterConflictGroups: ParameterConflictGroup[] = [
  {
    id: 'conflict-in-sb2o3-buffer-effect-15b',
    materialId: 'in',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-in-sb2o3-buffer',
      'evidence-in-sb2o3-interface-reaction-placeholder',
      'evidence-metal-deposition-damage-sb2o3-placeholder',
    ],
    summary_zh:
      'In 可能作為候選緩衝金屬，但目前資料庫尚未有 verified evidence 證明其一定能降低金屬沉積對 Sb₂O₃ 的衝擊。此議題高度依賴沉積方法、厚度、溫度、退火與量測方式。',
    recommendedStatus: 'needs_review',
    warnings_zh: [
      '不得將 In 作為已驗證解方；需先補真實文獻與實驗校準。',
    ],
  },
  {
    id: 'conflict-metal-diffusion-into-sb2o3-15b',
    materialId: 'sb2o3',
    parameterKey: 'D0_m2s',
    evidenceIds: [
      'evidence-pd-sb2o3-d0-placeholder',
      'evidence-pd-sb2o3-ea-placeholder',
      'evidence-in-sb2o3-d0-placeholder',
      'evidence-in-sb2o3-ea-placeholder',
      'evidence-ti-sb2o3-d0-placeholder',
      'evidence-ti-sb2o3-ea-placeholder',
      'evidence-au-sb2o3-d0-placeholder',
      'evidence-au-sb2o3-ea-placeholder',
      'evidence-metal-diffusion-sb2o3',
    ],
    summary_zh:
      'Pd / In / Ti / Au 等金屬進入 Sb₂O₃ 的 D0 / Ea 參數目前缺乏 verified evidence，擴散模型不可定量使用。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['手動輸入 D0/Ea 時，應同步在文獻資料庫建立對應 evidence。'],
  },
  {
    id: 'conflict-sb-surface-oxidation-15b',
    materialId: 'sb-bulk',
    parameterKey: 'oxidationRate_nm_per_s',
    evidenceIds: [
      'evidence-millet-1991-sb-surface-oxidation-xps',
      'evidence-sb-surface-oxidation-rate-placeholder',
    ],
    summary_zh:
      'Sb 表面在空氣或氧/水環境中可能形成 Sb₂O₃，但厚度、速率與化學態需 AFM / XPS 或製程校準確認。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['不可只用暴露時間推定 Sb₂O₃ 厚度。'],
  },
  {
    id: 'conflict-metal-deposition-damage-sb2o3-15b',
    materialId: 'sb2o3',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-metal-deposition-damage-sb2o3-placeholder',
      'evidence-in-sb2o3-interface-reaction-placeholder',
    ],
    summary_zh:
      '金屬沉積可能造成界面混合、缺陷或局部損傷；不同金屬與沉積方式可能造成不同程度影響。In 是否能降低此衝擊仍需文獻與實驗驗證。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['需要分金屬、沉積能量、溫度與後續退火條件建立 evidence。'],
  },
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
      'evidence-zhang-2026-sb2o3-dielectric-constant',
      'evidence-zhang-2026-sb2o3-breakdown-field',
      'evidence-sb2o3-breakdown-2024-leakage-traps',
      'evidence-messalea-2021-sb2o3-band-gap',
      'evidence-messalea-2021-sb2o3-dielectric-constant',
      'evidence-sb2o3-breakdown-2024-breakdown-field',
      'evidence-sb2o3-dielectric',
    ],
    summary_zh:
      'Sb₂O₃ 的介電常數、漏電與 breakdown 可能與相、厚度、缺陷、氧空缺、沉積方法與電極材料相關。',
    recommendedStatus: 'condition_dependent',
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
