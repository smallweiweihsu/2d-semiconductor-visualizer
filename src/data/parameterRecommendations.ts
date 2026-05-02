import type { ParameterRecommendation } from '../types/literature'

const createdAt = '2026-05-02T00:00:00.000Z'

export const parameterRecommendations: ParameterRecommendation[] = [
  {
    id: 'recommendation-sb2o3-metal-diffusion-blocker-15b',
    materialId: 'sb2o3',
    parameterKey: 'D0_m2s',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: [
      'evidence-pd-sb2o3-d0-placeholder',
      'evidence-in-sb2o3-d0-placeholder',
      'evidence-ti-sb2o3-d0-placeholder',
      'evidence-au-sb2o3-d0-placeholder',
    ],
    rationale_zh:
      '目前 Pd/In/Ti/Au into Sb₂O₃ 的 D0/Ea 仍缺 verified evidence，因此擴散模組應繼續顯示缺少文獻參數，不應自動給定數值。',
    limitation_zh:
      '所有 D0/Ea evidence 目前皆為 placeholder 或 candidate；不可定量使用。',
    condition_zh: 'metal diffusion into Sb₂O₃ literature gap。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-in-sb2o3-buffer-candidate-only-15b',
    materialId: 'in',
    parameterKey: 'custom',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: [
      'evidence-in-sb2o3-buffer',
      'evidence-in-sb2o3-interface-reaction-placeholder',
    ],
    rationale_zh:
      'In 可作為實驗候選緩衝金屬，但目前資料庫未驗證其一定能降低 Sb₂O₃ 介面衝擊。',
    limitation_zh:
      '需補真實來源，並確認 deposition method、thickness、temperature、annealing 與 measurement method。',
    condition_zh: 'In / Sb₂O₃ interface buffer remains candidate only。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-sb2o3-dielectric-condition-specific-15b',
    materialId: 'sb2o3',
    parameterKey: 'dielectricConstant',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: [
      'evidence-messalea-2021-sb2o3-dielectric-constant',
      'evidence-zhang-2026-sb2o3-dielectric-constant',
      'evidence-sb2o3-breakdown-2024-leakage-traps',
    ],
    rationale_zh:
      'Sb₂O₃ dielectric constant / breakdown / leakage 應依相、厚度、製程與電極條件分開記錄，不建議只使用單一全域值。',
    limitation_zh:
      'candidate values 尚未完整人工審核；正式材料資料庫仍不應自動更新。',
    condition_zh: 'process-dependent Sb₂O₃ dielectric properties。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-sb-surface-oxidation-xps-afm-15b',
    materialId: 'sb-bulk',
    parameterKey: 'oxidationRate_nm_per_s',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: [
      'evidence-millet-1991-sb-surface-oxidation-xps',
      'evidence-sb-surface-oxidation-rate-placeholder',
    ],
    rationale_zh:
      'Sb 表面氧化推論應搭配 XPS 化學態與 AFM 厚度，不能僅由暴露時間直接定量。',
    limitation_zh: '目前沒有 verified ambient oxidation rate。',
    condition_zh: 'Sb surface oxidation to Sb₂O₃ calibration needed。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-wse2-band-gap-condition-specific',
    materialId: 'wse2',
    parameterKey: 'bandGap_eV',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: ['evidence-zhou-2015-wse2-band-gap'],
    rationale_zh:
      '目前文獻候選顯示 WSe₂ band gap 需區分 bulk / monolayer 與 optical/electronic gap。建議正式材料資料庫不要只放單一 bandGap_eV，後續應加入 condition-specific parameters。',
    limitation_zh: '尚未人工完整審核；不可直接推廣到所有 WSe₂ 樣品。',
    condition_zh: 'bulk / few-layer / monolayer 與 optical/electronic gap 需分開。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-sb2o3-dielectric-needs-review',
    materialId: 'sb2o3',
    parameterKey: 'dielectricConstant',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: [
      'evidence-messalea-2021-sb2o3-dielectric-constant',
      'evidence-sb2o3-breakdown-2024-breakdown-field',
    ],
    rationale_zh:
      'Sb₂O₃ 介電常數與 breakdown field 有候選來源，但製程依賴性高，需審核後再決定是否寫入正式材料資料庫。',
    limitation_zh: '需要確認相、厚度、缺陷、氧空缺與電極結構。',
    condition_zh: '2D / thin-film Sb₂O₃ dielectric characterization。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-pd-wse2-contact-warning',
    materialId: 'wse2',
    parameterKey: 'contactResistance_ohm',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: ['evidence-wse2-vdw-contacts-2022-pd-contact'],
    rationale_zh:
      'Pd/WSe₂ contact 應維持 high-uncertainty warning，不應以 work function alone 推論 ohmic contact。',
    limitation_zh: '接觸電阻需由實驗 fitting、TLM 或 device-specific 量測校準。',
    condition_zh: 'WSe₂ metal contact / Fermi-level pinning caution。',
    createdAt,
    updatedAt: createdAt,
  },
  {
    id: 'recommendation-in-sb2o3-buffer-todo',
    materialId: 'in',
    parameterKey: 'custom',
    recommendedValue: null,
    status: 'draft',
    basedOnEvidenceIds: ['evidence-in-sb2o3-buffer'],
    rationale_zh:
      'In/Sb₂O₃ buffer effect 仍是待查議題，目前只能作為實驗與文獻追蹤項目。',
    limitation_zh: '尚未填入真實文獻來源；不可視為 In 已被證實能降低此結構介面衝擊。',
    condition_zh: 'In / Sb₂O₃ interface buffer hypothesis。',
    createdAt,
    updatedAt: createdAt,
  },
]
