import type { ParameterConflictGroup } from '../types/literature'

export const parameterConflictGroups: ParameterConflictGroup[] = [
  {
    id: 'conflict-hfo2-dielectric-process-dependent-15d',
    materialId: 'hfo2',
    parameterKey: 'dielectricConstant',
    evidenceIds: [
      'evidence-15d-hfo2-dielectric-constant',
      'evidence-15d-hfo2-breakdown-field',
      'evidence-lau-2023-high-k-interface-review',
    ],
    summary_zh:
      'HfO₂ 的介電常數受相、厚度、沉積方法、退火、缺陷與頻率影響，不應使用單一值代表所有 top-gate 結構。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['HfO₂ k 與 breakdown 需按製程和 device stack 建立 evidence。'],
  },
  {
    id: 'conflict-al2o3-interface-traps-15d',
    materialId: 'al2o3',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-park-2016-al2o3-wse2-ald-interface',
      'evidence-park-2017-al2o3-ald-coverage-2d',
      'evidence-15d-al2o3-dielectric-constant',
    ],
    summary_zh:
      'Al₂O₃ 常用於 2D FET dielectric，但 ALD nucleation、界面缺陷、charge traps 與 hysteresis 可能影響 WSe₂ 元件。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['Al₂O₃/WSe₂ 條件需分 direct ALD、seed/functionalization 與後續退火。'],
  },
  {
    id: 'conflict-sio2-substrate-traps-15d',
    materialId: 'sio2',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-15d-sio2-wse2-band-offset',
      'evidence-15d-sio2-wse2-substrate-traps-placeholder',
    ],
    summary_zh:
      'SiO₂ 是常見基板/介電層，但 charged impurities、traps、hysteresis 與表面粗糙度可能影響 2D 半導體電性。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['SiO₂ 作為 reference substrate 也需標示 surface preparation 與環境條件。'],
  },
  {
    id: 'conflict-hbn-clean-dielectric-reference-15d',
    materialId: 'hbn',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-laturia-2018-hbn-dielectric-reference',
      'evidence-15d-hbn-dielectric-constant',
      'evidence-park-2017-al2o3-ald-coverage-2d',
    ],
    summary_zh:
      'hBN 常被視為較乾淨的 van der Waals dielectric / encapsulation reference，但實際介面品質仍與轉移、污染、厚度與製程有關。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['hBN 不是自動 ideal interface；轉移殘膠與厚度仍需記錄。'],
  },
  {
    id: 'conflict-wse2-dielectric-band-offset-not-universal-15d',
    materialId: 'wse2',
    parameterKey: 'bandOffset_eV',
    evidenceIds: [
      'evidence-15d-hfo2-wse2-band-offset',
      'evidence-15d-al2o3-wse2-band-offset',
      'evidence-15d-sio2-wse2-band-offset',
      'evidence-15d-hbn-wse2-band-offset',
      'evidence-15d-sb2o3-wse2-band-offset',
    ],
    summary_zh:
      'WSe₂ 與 HfO₂/Al₂O₃/SiO₂/hBN/Sb₂O₃ 的 band offset 受介面化學、缺陷、電荷、dipole 與製程影響，不能只用 bulk electron affinity 判斷。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['Band offset 應以 interface-specific evidence 管理，不可做全域值。'],
  },
  {
    id: 'conflict-high-k-benefit-interface-risk-15d',
    materialId: 'wse2',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-lau-2023-high-k-interface-review',
      'evidence-oliva-2019-wse2-high-k-hysteresis',
      'evidence-15d-remote-phonon-high-k-placeholder',
    ],
    summary_zh:
      'High-k dielectric 可增加 gate capacitance，但也可能帶來 remote phonon scattering、interface traps、leakage 或 deposition damage。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['High-k 不應被自動視為提升元件性能；需與 mobility、hysteresis、leakage 一起比較。'],
  },
  {
    id: 'conflict-sb2o3-conventional-dielectric-comparison-15d',
    materialId: 'sb2o3',
    parameterKey: 'dielectricConstant',
    evidenceIds: [
      'evidence-15d-sb2o3-dielectric-constant',
      'evidence-15d-sb2o3-breakdown-field',
      'evidence-messalea-2021-sb2o3-dielectric-constant',
      'evidence-sb2o3-breakdown-2024-breakdown-field',
      'evidence-lau-2023-high-k-interface-review',
    ],
    summary_zh:
      'Sb₂O₃ 作為新型 2D/high-k dielectric 時，需和 HfO₂、Al₂O₃、SiO₂、hBN 分別比較 k、band gap、breakdown、leakage 與界面品質。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['Sb₂O₃ 不應在未分類製程條件前取代 conventional dielectric evidence。'],
  },
  {
    id: 'conflict-wse2-metal-contact-condition-dependent-15c',
    materialId: 'wse2',
    parameterKey: 'contactResistance_ohm',
    evidenceIds: [
      'evidence-allain-2015-2d-contact-review',
      'evidence-wang-2016-wse2-metal-ohmic-question',
      'evidence-wse2-vdw-contacts-2022-pd-contact',
      'evidence-liu-2022-au-wse2-vdw-contact',
      'evidence-di-bartolomeo-2018-ni-wse2-environment',
    ],
    summary_zh:
      'WSe₂ 與金屬接觸的接觸電阻與 Schottky barrier 受金屬種類、界面態、Fermi-level pinning、污染、退火、接觸幾何與材料層數影響。Work function alone 不足以預測真實接觸。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['電性模型應維持手動 contact resistance / fitting，不應自動給定預設值。'],
  },
  {
    id: 'conflict-ti-au-pd-in-sc-wse2-contact-review-15c',
    materialId: 'wse2',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-pd-wse2-contact-placeholder',
      'evidence-ti-wse2-contact-placeholder',
      'evidence-au-wse2-contact-placeholder',
      'evidence-in-wse2-contact-placeholder',
      'evidence-sc-wse2-contact-placeholder',
      'evidence-sc-low-work-function-contact-placeholder',
    ],
    summary_zh:
      'Ti、Au、Pd、In、Sc 等金屬可能對 WSe₂ 接觸形成不同趨勢，但資料庫目前仍需更多 verified evidence 才能比較適用性。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['不得依 work function 或單篇不同結構文獻直接排名金屬適用性。'],
  },
  {
    id: 'conflict-lower-metal-diffusion-sb2o3-15c',
    materialId: 'sb2o3',
    parameterKey: 'D0_m2s',
    evidenceIds: [
      'evidence-ti-sb2o3-d0-placeholder',
      'evidence-au-sb2o3-d0-placeholder',
      'evidence-cr-sb2o3-d0-placeholder',
      'evidence-ni-sb2o3-d0-placeholder',
      'evidence-pt-sb2o3-d0-placeholder',
      'evidence-al-sb2o3-d0-placeholder',
      'evidence-ag-sb2o3-d0-placeholder',
      'evidence-cu-sb2o3-d0-placeholder',
      'evidence-sc-sb2o3-d0-placeholder',
    ],
    summary_zh:
      'Ti/Au/Cr/Ni/Pt/Al/Ag/Cu/Sc 進入 Sb₂O₃ 的 D0/Ea 目前多為待查資料，不應用於定量擴散計算。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['需要直接、可比較的 Sb₂O₃ diffusion source 才能啟用定量模型。'],
  },
  {
    id: 'conflict-reactive-metals-oxide-interface-damage-15c',
    materialId: 'sb2o3',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-ti-reactive-adhesion-risk-placeholder',
      'evidence-al-oxide-forming-risk-placeholder',
      'evidence-pt-ni-cr-contact-interface-uncertainty-placeholder',
      'evidence-metal-deposition-damage-sb2o3-placeholder',
    ],
    summary_zh:
      '部分金屬可能與氧化層反應、形成界面缺陷或造成氧空缺相關問題，但需依材料、沉積能量、厚度、退火與量測方法確認。',
    recommendedStatus: 'needs_review',
    warnings_zh: ['reactive / adhesion metal 不能只以常識分類，需要文獻或實驗 evidence。'],
  },
  {
    id: 'conflict-noble-metals-not-automatically-harmless-15c',
    materialId: 'wse2',
    parameterKey: 'custom',
    evidenceIds: [
      'evidence-au-noble-not-benign-placeholder',
      'evidence-liu-2022-au-wse2-vdw-contact',
      'evidence-pt-ni-cr-contact-interface-uncertainty-placeholder',
    ],
    summary_zh:
      'Au/Pt 等較惰性金屬不代表一定形成理想接觸，界面污染、pinning、接觸幾何與退火仍可能主導電性。',
    recommendedStatus: 'condition_dependent',
    warnings_zh: ['noble metal 不等於低接觸電阻或低界面損傷。'],
  },
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
