import type { ParameterEvidence } from '../types/literature'

const placeholderWarning = [
  '此紀錄為文獻候選占位，尚未經人工審核，不可作為正式參數。',
]

const contactMetals15C = [
  'pd',
  'ti',
  'au',
  'cr',
  'ni',
  'pt',
  'al',
  'ag',
  'cu',
  'sc',
  'in',
]

const lowerPriorityDiffusionMetals15C = [
  'cr',
  'ni',
  'pt',
  'al',
  'ag',
  'cu',
  'sc',
]

const batch15CContactEvidence: ParameterEvidence[] = contactMetals15C.flatMap(
  (metalId) => [
    {
      id: `evidence-${metalId}-wse2-contact-placeholder`,
      sourceId:
        metalId === 'sc'
          ? 'src-placeholder-sc-wse2-contact'
          : 'src-placeholder-metal-wse2-contact-review',
      materialIds: ['wse2', metalId],
      parameterKey: 'contactResistance_ohm',
      value: null,
      unit: 'ohm',
      condition_zh:
        '待查：metal/WSe₂ contact resistance；需確認金屬沉積方式、接觸幾何、層數、退火、污染與量測方法。',
      method_zh: '待查：device electrical characterization / TLM / fitting。',
      agreementStatus: 'unclear',
      confidence: 'unknown',
      quoteOrSummary_zh:
        '待查：此金屬與 WSe₂ 接觸行為尚未整理 verified evidence。',
      applicability_zh:
        '後續可用於電性模型 contact warning；目前不可當作使用者元件接觸電阻。',
      warnings_zh: [
        'Work function alone 不足以預測 WSe₂ contact quality。',
        'Fermi-level pinning、interface states、contamination、annealing 與 geometry 可能主導接觸。',
      ],
    },
    {
      id: `evidence-${metalId}-work-function-context-placeholder`,
      sourceId: 'src-placeholder-metal-wse2-contact-review',
      materialIds: [metalId, 'wse2'],
      parameterKey: 'workFunction_eV',
      value: null,
      unit: 'eV',
      condition_zh:
        '待查：work function depends on surface, crystal orientation, contamination, deposition, and environment。',
      method_zh: '待查：surface science / photoemission / literature compilation。',
      agreementStatus: 'condition_dependent',
      confidence: 'unknown',
      quoteOrSummary_zh:
        'Work function 可作為 contact context，但不能單獨推論 WSe₂ contact resistance 或 Schottky barrier。',
      applicability_zh:
        '僅用於 band alignment / contact warning 背景，不可作為金屬排名或 contact quality 結論。',
      warnings_zh: [
        '不要依 work function alone 排名 Pd/Ti/Au/In/Sc 或其他金屬接觸品質。',
      ],
    },
  ],
)

const batch15CLowerMetalDiffusionEvidence: ParameterEvidence[] =
  lowerPriorityDiffusionMetals15C.flatMap((metalId) => [
    {
      id: `evidence-${metalId}-sb2o3-d0-placeholder`,
      sourceId: 'src-placeholder-metal-sb2o3-diffusion-lower-priority',
      materialIds: [metalId, 'sb2o3'],
      parameterKey: 'D0_m2s',
      value: null,
      unit: 'm²/s',
      condition_zh:
        '待查：金屬進入 Sb₂O₃ 的熱擴散參數。需確認材料相、薄膜品質、溫度範圍、退火氣氛與量測方法。',
      method_zh: '待查文獻或實驗。',
      agreementStatus: 'unclear',
      confidence: 'unknown',
      applicability_zh: '後續可用於擴散模型；目前不可定量。',
      warnings_zh: placeholderWarning,
    },
    {
      id: `evidence-${metalId}-sb2o3-ea-placeholder`,
      sourceId: 'src-placeholder-metal-sb2o3-diffusion-lower-priority',
      materialIds: [metalId, 'sb2o3'],
      parameterKey: 'Ea_eV',
      value: null,
      unit: 'eV',
      condition_zh:
        '待查：金屬進入 Sb₂O₃ 的 activation energy。需確認 diffusion 與 oxide/interface reaction 是否可分離。',
      method_zh: '待查文獻或實驗。',
      agreementStatus: 'unclear',
      confidence: 'unknown',
      applicability_zh: '後續可用於擴散模型；目前不可定量。',
      warnings_zh: placeholderWarning,
    },
  ])

const dielectricMaterials15D = ['hfo2', 'al2o3', 'sio2', 'hbn', 'sb2o3']

const dielectricSourceByMaterial15D: Record<string, string> = {
  hfo2: 'src-placeholder-hfo2-wse2-dielectric-interface',
  al2o3: 'src-park-2016-al2o3-wse2-tiopc-ald',
  sio2: 'src-wse2-sio2-band-alignment-2022',
  hbn: 'src-laturia-2018-hbn-tmd-dielectric',
  sb2o3: 'src-messalea-2021-sb2o3-high-k',
}

const dielectricLabelByMaterial15D: Record<string, string> = {
  hfo2: 'HfO₂',
  al2o3: 'Al₂O₃',
  sio2: 'SiO₂',
  hbn: 'hBN',
  sb2o3: 'Sb₂O₃',
}

const batch15DDielectricPropertyEvidence: ParameterEvidence[] =
  dielectricMaterials15D.flatMap((materialId) => {
    const label = dielectricLabelByMaterial15D[materialId]
    const sourceId = dielectricSourceByMaterial15D[materialId]

    return [
      {
        id: `evidence-15d-${materialId}-dielectric-constant`,
        sourceId,
        materialIds: [materialId, 'wse2'],
        parameterKey: 'dielectricConstant',
        value: null,
        condition_zh:
          `${label}/WSe₂ gate dielectric context；k 需指定相、厚度、沉積方法、頻率、漏電與量測結構。`,
        method_zh: 'Capacitance / dielectric characterization or literature review; exact method needs source review.',
        agreementStatus: 'condition_dependent',
        confidence: materialId === 'hfo2' ? 'unknown' : 'low',
        applicability_zh:
          `可作為 ${label} dielectric tracking；目前不可寫入正式材料資料庫或當作 universal k。`,
        warnings_zh: [
          '介電常數受製程、厚度、缺陷、頻率與漏電影響。',
          '若手動輸入 k，應在文獻資料庫建立對應 source 與 evidence。',
        ],
      },
      {
        id: `evidence-15d-${materialId}-breakdown-field`,
        sourceId,
        materialIds: [materialId, 'wse2'],
        parameterKey: 'breakdownField_MVcm',
        value: null,
        unit: 'MV/cm',
        condition_zh:
          `${label}/WSe₂ 或相關 thin-film dielectric stack；breakdown criterion、device area、electrode 與 defect density 需確認。`,
        method_zh: 'Dielectric breakdown / leakage characterization; exact method needs source review.',
        agreementStatus: 'condition_dependent',
        confidence: 'unknown',
        applicability_zh:
          '可作為 electrical breakdown warning 的 candidate evidence；目前不可定量。',
        warnings_zh: [
          'breakdown field 受厚度、pinholes、缺陷、電極、漏電與處理條件影響。',
        ],
      },
      {
        id: `evidence-15d-${materialId}-band-gap`,
        sourceId,
        materialIds: [materialId],
        parameterKey: 'bandGap_eV',
        value: null,
        unit: 'eV',
        condition_zh:
          `${label} dielectric band gap；需確認 bulk/thin-film、相、缺陷與光學或電子量測方法。`,
        method_zh: 'Optical/electronic characterization or literature review.',
        agreementStatus: 'condition_dependent',
        confidence: 'unknown',
        applicability_zh:
          '可作為 gate leakage / dielectric barrier 背景；不可直接代表實際 interface barrier。',
        warnings_zh: ['band gap 不等於實際 WSe₂ interface band offset。'],
      },
      {
        id: `evidence-15d-${materialId}-electron-affinity`,
        sourceId: 'src-placeholder-dielectric-band-offset-wse2',
        materialIds: [materialId, 'wse2'],
        parameterKey: 'electronAffinity_eV',
        value: null,
        unit: 'eV',
        condition_zh:
          `${label}/WSe₂ band alignment context；electron affinity 需與 interface dipole、defects、charges 分開判讀。`,
        method_zh: '待查：photoemission / literature compilation / band alignment analysis。',
        agreementStatus: 'unclear',
        confidence: 'unknown',
        applicability_zh:
          '僅作 band alignment context，不可單獨決定 band offset 或 leakage barrier。',
        warnings_zh: [
          'electron affinity alone 不代表真實 band alignment。',
          'interface dipoles、defects 與 trapped charges 可能主導。',
        ],
      },
      {
        id: `evidence-15d-${materialId}-wse2-band-offset`,
        sourceId:
          materialId === 'sio2'
            ? 'src-wse2-sio2-band-alignment-2022'
            : 'src-placeholder-dielectric-band-offset-wse2',
        materialIds: [materialId, 'wse2'],
        parameterKey: 'bandOffset_eV',
        value: null,
        unit: 'eV',
        condition_zh:
          `${label}/WSe₂ interface；需指定製程、厚度、表面處理、defect / dipole 狀態與量測方法。`,
        method_zh:
          materialId === 'sio2'
            ? 'XPS / valence band photoemission candidate source; exact values need source review.'
            : '待查：XPS / UPS / electrical extraction / literature review。',
        agreementStatus: 'condition_dependent',
        confidence: materialId === 'sio2' ? 'low' : 'unknown',
        applicability_zh:
          '可用於 band offset tracking；不可用 bulk material values 直接推論。',
        warnings_zh: [
          'band offset 是 interface-specific，不是 universal material parameter。',
        ],
      },
    ]
  })

const batch15DInterfaceEvidence: ParameterEvidence[] = [
  {
    id: 'evidence-lau-2023-high-k-interface-review',
    sourceId: 'src-lau-2023-tmd-dielectrics-review',
    materialIds: ['wse2', 'hfo2', 'al2o3', 'sio2', 'hbn', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '2D TMD dielectric applications review；需依材料、製程、界面與 device geometry 分類。',
    method_zh: 'Review article',
    agreementStatus: 'supports',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該 review 可作為 high-k / conventional dielectric integration、interface quality、leakage 與 traps 的候選背景來源。',
    applicability_zh:
      '適合用於 dielectric module warnings；不可直接給定 HfO₂/Al₂O₃/SiO₂/hBN/Sb₂O₃ 的 universal k、breakdown 或 band offset。',
    warnings_zh: [
      'High-k 可提高 Cox，但 interface traps、remote phonon scattering、leakage 與 deposition damage 可能抵消效益。',
    ],
  },
  {
    id: 'evidence-laturia-2018-hbn-dielectric-reference',
    sourceId: 'src-laturia-2018-hbn-tmd-dielectric',
    materialIds: ['hbn', 'wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'hBN and TMD dielectric properties from monolayer to bulk；具體 dielectric tensor / layer dependence 需回查原文。',
    method_zh: 'First-principles / dielectric property analysis',
    agreementStatus: 'supports',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該文獻可作為 hBN dielectric reference 與 layer-dependent dielectric properties 的候選來源。',
    applicability_zh:
      '適合將 hBN 作為 vdW dielectric reference；仍需確認轉移污染、厚度與界面品質。',
    warnings_zh: ['hBN cleaner reference 不代表所有 hBN stack 都是 ideal interface。'],
  },
  {
    id: 'evidence-park-2016-al2o3-wse2-ald-interface',
    sourceId: 'src-park-2016-al2o3-wse2-tiopc-ald',
    materialIds: ['al2o3', 'wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'Al₂O₃ ALD on WSe₂ with titanyl phthalocyanine functionalization；需確認 seed layer、溫度、厚度與 leakage measurement。',
    method_zh: 'Atomic layer deposition and dielectric/interface characterization',
    agreementStatus: 'condition_dependent',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該文獻可作為 Al₂O₃/WSe₂ ALD nucleation 與 dielectric deposition compatibility 的候選來源。',
    applicability_zh:
      '適合提醒 ALD dielectric 不一定保留 pristine WSe₂ interface；需依 functionalization 與製程判斷。',
    warnings_zh: ['functionalized ALD 與 direct ALD 不可混為同一條件。'],
  },
  {
    id: 'evidence-park-2017-al2o3-ald-coverage-2d',
    sourceId: 'src-park-2017-al2o3-ald-2d-crystals',
    materialIds: ['al2o3', 'wse2', 'hbn'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'Al₂O₃ ALD on MoS₂/WS₂/WSe₂/hBN；surface coverage 與 adsorption energy 需依 2D crystal surface condition 判讀。',
    method_zh: 'ALD surface coverage / adsorption energy study',
    agreementStatus: 'condition_dependent',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該來源可用於追蹤 ALD 在 WSe₂ 與 hBN 表面 nucleation/coverage 不一定相同。',
    applicability_zh:
      '適合用於 ALD compatibility warning；不可直接給定 leakage、trap density 或 k。',
    warnings_zh: ['surface coverage 不等於完整 device dielectric quality。'],
  },
  {
    id: 'evidence-oliva-2019-wse2-high-k-hysteresis',
    sourceId: 'src-oliva-2019-wse2-high-k-hysteresis',
    materialIds: ['wse2', 'hfo2', 'al2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'Double-gated n-type WSe₂ FETs with high-k top gate dielectric；需確認 dielectric material, stack, sweep protocol 與 trap model。',
    method_zh: 'Electrical hysteresis dynamics characterization',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    quoteOrSummary_zh:
      '該來源可作為 high-k top gate dielectric 可能引入 hysteresis / trap dynamics 的候選提醒。',
    applicability_zh:
      '適合用於 electrical module warning；不可直接推論所有 high-k/WSe₂ device hysteresis。',
    warnings_zh: ['hysteresis 需搭配掃描方向、速度、溫度、環境與 device history 判讀。'],
  },
  {
    id: 'evidence-15d-remote-phonon-high-k-placeholder',
    sourceId: 'src-placeholder-remote-phonon-scattering-2d-dielectric',
    materialIds: ['wse2', 'hfo2', 'al2o3', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：high-k dielectric near WSe₂ may affect mobility through remote phonon scattering or interface disorder。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh:
      'High-k 增加 Cox 不代表一定提升 device performance；remote phonon、traps、leakage 與 deposition damage 需分開追蹤。',
    applicability_zh:
      '用於 high-k risk warning；目前不可量化 mobility degradation。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-15d-sio2-wse2-substrate-traps-placeholder',
    sourceId: 'src-wse2-sio2-band-alignment-2022',
    materialIds: ['sio2', 'wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'WSe₂/SiO₂ interface and substrate context；charged impurities、traps、roughness 與 adsorbates 需另行整理。',
    method_zh: 'Band alignment source plus substrate trap TODO tracking',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    applicability_zh:
      '適合提醒 SiO₂ common substrate 不等於 harmless interface。',
    warnings_zh: ['SiO₂ substrate traps/hysteresis 需與 band alignment 分開建立 evidence。'],
  },
]

export const parameterEvidence: ParameterEvidence[] = [
  ...batch15DDielectricPropertyEvidence,
  ...batch15DInterfaceEvidence,
  {
    id: 'evidence-allain-2015-2d-contact-review',
    sourceId: 'src-allain-2015-2d-semiconductor-contacts',
    materialIds: ['wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'General 2D semiconductor contacts review；需確認個別材料、金屬與接觸幾何。',
    method_zh: 'Review article',
    agreementStatus: 'supports',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該 review 可作為二維半導體 contacts、Schottky barrier、contact resistance 與 contact engineering 的候選背景來源。',
    applicability_zh:
      '適合電性模組 contact warning；不可直接給定 WSe₂/Pd/Ti/Au/In/Sc 的 contact resistance。',
    warnings_zh: ['Work function alone 不足以預測真實 2D semiconductor contact behavior。'],
  },
  {
    id: 'evidence-wang-2016-wse2-metal-ohmic-question',
    sourceId: 'src-wang-2016-wse2-metal-ohmic',
    materialIds: ['wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'WSe₂-metal interfaces；具體金屬、計算/實驗方法與 device relevance 需回查原文。',
    method_zh: 'Literature source on WSe₂-metal interface contact behavior',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    quoteOrSummary_zh:
      '該文題名直接指出 WSe₂-metal interface 是否存在 p-type Ohmic contact 需要審慎判讀。',
    applicability_zh:
      '適合提醒：不能假設任何金屬/WSe₂ 接觸一定 Ohmic。',
    warnings_zh: ['需人工確認金屬種類、方法與是否適用目前 Sb/Sb₂O₃/WSe₂ 結構。'],
  },
  {
    id: 'evidence-liu-2022-au-wse2-vdw-contact',
    sourceId: 'src-liu-2022-wse2-au-vdw-contacts',
    materialIds: ['wse2', 'au'],
    parameterKey: 'contactResistance_ohm',
    value: null,
    unit: 'ohm',
    condition_zh:
      'Au van der Waals contact to WSe₂；非傳統直接蒸鍍金屬接觸，需確認 transfer/contact process。',
    method_zh: 'Device electrical characterization',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    quoteOrSummary_zh:
      '網頁摘要指出 van der Waals contact 可避免傳統接觸形成時的 interaction / defect，並改善 WSe₂ transistor behavior。',
    applicability_zh:
      '可作為 Au/WSe₂ contact engineering 的候選來源；不可直接套用到使用者金屬沉積接觸。',
    warnings_zh: ['vdW transferred contact 與 evaporated contact 不可混為同一條件。'],
  },
  {
    id: 'evidence-ngo-2022-oxidized-edge-flp-wse2',
    sourceId: 'src-ngo-2022-oxidized-edge-flp-wse2',
    materialIds: ['wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'Oxidized edges of vdW TMD transistors；需確認材料、氧化方式與接觸金屬。',
    method_zh: 'Device/contact mechanism study',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    quoteOrSummary_zh:
      '該來源可用於提醒 oxidized edge / oxide-related interface 可能造成 Fermi-level pinning。',
    applicability_zh:
      '適合與 WSe₂ oxidation、edge damage、metal contact warning 連結；不可直接視為所有 WSe₂ contact 的機制。',
    warnings_zh: ['氧化與接觸行為需區分 edge、surface、bulk layer 與 contact geometry。'],
  },
  {
    id: 'evidence-di-bartolomeo-2018-ni-wse2-environment',
    sourceId: 'src-di-bartolomeo-2018-wse2-contacts',
    materialIds: ['wse2', 'ni'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'Back-gated WSe₂ FET with Ni/Au contacts；environmental exposure affects electrical characteristics。',
    method_zh: 'Electrical characterization under environmental conditions',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    applicability_zh:
      '適合提醒 WSe₂ contact/electrical behavior 受環境、吸附與界面條件影響；不可直接給定 contact resistance。',
    warnings_zh: ['環境效應、Ni contact 與 device geometry 需分開比較。'],
  },
  {
    id: 'evidence-ti-reactive-adhesion-risk-placeholder',
    sourceId: 'src-placeholder-metal-deposition-damage-oxide-interface',
    materialIds: ['ti', 'sb2o3', 'wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：Ti as reactive / adhesion metal near oxide or WSe₂ interface；需確認沉積能量、厚度、退火與界面化學。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh:
      'Ti 常被視為 adhesion / reactive metal candidate，但對 Sb₂O₃ 或 WSe₂ 介面的具體影響不可未經來源推論。',
    applicability_zh: '僅作為 interface-risk placeholder。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-au-noble-not-benign-placeholder',
    sourceId: 'src-placeholder-metal-wse2-contact-review',
    materialIds: ['au', 'wse2', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：Au contact / oxide interface behavior；需確認接觸形成方式與污染、pinning、退火條件。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh:
      'Au 較惰性不代表 automatically harmless 或 ideal contact；interface contamination 與 geometry 仍可能主導。',
    applicability_zh: '用於避免把 noble metal 當作保證良好接觸。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-al-oxide-forming-risk-placeholder',
    sourceId: 'src-placeholder-metal-deposition-damage-oxide-interface',
    materialIds: ['al', 'sb2o3', 'wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：Al as oxide-forming metal near Sb₂O₃/WSe₂；需確認原生氧化、界面反應與沉積條件。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '用於 oxide interface risk tracking；目前不可視為結論。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-cu-ag-diffusion-concern-placeholder',
    sourceId: 'src-placeholder-metal-sb2o3-diffusion-lower-priority',
    materialIds: ['cu', 'ag', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：Cu/Ag diffusion concern in oxide or semiconductor interface；需確認是否適用 Sb₂O₃。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '用於提醒 lower-priority metal diffusion 仍不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-pt-ni-cr-contact-interface-uncertainty-placeholder',
    sourceId: 'src-placeholder-metal-wse2-contact-review',
    materialIds: ['pt', 'ni', 'cr', 'wse2', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：Pt/Ni/Cr WSe₂ contact and oxide interface behavior；需分金屬、接觸幾何與退火條件整理。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '用於 contact/interface uncertainty tracking。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-sc-low-work-function-contact-placeholder',
    sourceId: 'src-placeholder-sc-wse2-contact',
    materialIds: ['sc', 'wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：Sc low-work-function contact engineering 是否適用 WSe₂；需確認 carrier type、barrier、reactivity 與 stability。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh:
      '低 work function 只能作背景，不可直接視為 WSe₂ contact improvement。',
    warnings_zh: placeholderWarning,
  },
  ...batch15CContactEvidence,
  ...batch15CLowerMetalDiffusionEvidence,
  {
    id: 'evidence-tonndorf-2013-wse2-pl-raman',
    sourceId: 'src-tonndorf-2013-wse2-pl-raman',
    materialIds: ['wse2'],
    parameterKey: 'custom',
    value: null,
    condition_zh: '單層 WSe₂；Raman / PL 量測條件需回查原文。',
    method_zh: 'Photoluminescence and Raman spectroscopy',
    agreementStatus: 'supports',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該文獻提供單層 MoS₂、MoSe₂、WSe₂ 的 PL emission 與 Raman response，可作為 WSe₂ 光譜模組與 peak 標記的候選來源。',
    applicability_zh:
      '適合用於建立 WSe₂ Raman / PL 候選資料；實際 peak position 與 intensity 需依雷射波長、樣品層數、應變、摻雜與基板判讀。',
    warnings_zh: [
      '不可直接把 peak intensity 視為材料品質；需搭配儀器條件與樣品狀態。',
    ],
  },
  {
    id: 'evidence-zhou-2015-wse2-band-gap',
    sourceId: 'src-zhou-2015-wse2-growth-electrical',
    materialIds: ['wse2'],
    parameterKey: 'bandGap_eV',
    value: 'bulk ~1.2 eV indirect; monolayer ~1.65 eV direct',
    unit: 'eV',
    condition_zh:
      'bulk 與 monolayer WSe₂；文獻用於大面積成長與 p-type electrical properties 背景。',
    method_zh: 'Literature-reported optical/electrical context; confirm exact method in source.',
    agreementStatus: 'supports',
    confidence: 'medium',
    applicability_zh:
      '可作為 WSe₂ band gap 初始候選資料；實際能隙受層數、溫度、應變、基板與量測方法影響。',
    warnings_zh: ['不要將此值直接當成所有 WSe₂ 樣品的固定能隙。'],
  },
  {
    id: 'evidence-li-2016-wse2-surface-oxidation',
    sourceId: 'src-li-2016-wse2-layer-oxidation',
    materialIds: ['wse2', 'wox'],
    parameterKey: 'oxidationRate_nm_per_s',
    value: null,
    unit: 'nm/s',
    condition_zh:
      'remote oxygen plasma / selective surface layer oxidation；具體 rate 需回查原文與製程條件。',
    method_zh: 'Raman and photoluminescence before/after oxygen plasma oxidation',
    agreementStatus: 'condition_dependent',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該文獻研究 WSe₂ 表面層氧化與 Raman / PL 變化，可用於解釋氧化後仍可能看到 WSe₂ 訊號的情境。',
    applicability_zh:
      '適合用於 WSe₂ → WOx 氧化模組與 Raman interpretation；但不可直接套用到所有 O₂ RIE 條件。',
    warnings_zh: ['氧化速率需依 plasma 條件、功率、時間、樣品厚度與環境校準。'],
  },
  {
    id: 'evidence-messalea-2021-sb2o3-band-gap',
    sourceId: 'src-messalea-2021-sb2o3-high-k',
    materialIds: ['sb2o3'],
    parameterKey: 'bandGap_eV',
    value: 'approximately 4.4',
    unit: 'eV',
    condition_zh: 'α-Sb₂O₃；substrate-independent/scalable process；需確認厚度、相與量測方法。',
    method_zh: 'Optical/material characterization; confirm in source.',
    agreementStatus: 'supports',
    confidence: 'medium',
    applicability_zh:
      '可作為 Sb₂O₃ wide band gap 候選資料；實際值可能受相、缺陷、氧空缺與製程影響。',
    warnings_zh: ['尚不可直接寫入正式材料資料庫；需人工審核。'],
  },
  {
    id: 'evidence-messalea-2021-sb2o3-dielectric-constant',
    sourceId: 'src-messalea-2021-sb2o3-high-k',
    materialIds: ['sb2o3'],
    parameterKey: 'dielectricConstant',
    value: null,
    condition_zh: '2D Sb₂O₃ high-k dielectric；具體 k 值需回查原文表格/圖。',
    method_zh: 'Electrical dielectric characterization',
    agreementStatus: 'supports',
    confidence: 'medium',
    applicability_zh:
      '可作為 Sb₂O₃ dielectric constant 的候選來源，但需補數值與條件。',
    warnings_zh: ['不同相、厚度與缺陷狀態可能造成 k 值差異。'],
  },
  {
    id: 'evidence-sb2o3-breakdown-2024-breakdown-field',
    sourceId: 'src-sb2o3-breakdown-2024',
    materialIds: ['sb2o3'],
    parameterKey: 'breakdownField_MVcm',
    value: 'projected ~10',
    unit: 'MV/cm',
    condition_zh: 'High-k antimony oxide breakdown mechanism study；需確認模型假設與樣品條件。',
    method_zh: 'Dielectric breakdown analysis',
    agreementStatus: 'condition_dependent',
    confidence: 'medium',
    applicability_zh:
      '可作為 breakdown risk 模組的候選參考，但不代表使用者實驗室 Sb₂O₃ 一定具有相同崩潰電場。',
    warnings_zh: ['缺陷、氧空缺、厚度、沉積法與電極會強烈影響 breakdown。'],
  },
  {
    id: 'evidence-wse2-vdw-contacts-2022-pd-contact',
    sourceId: 'src-wse2-vdw-contacts-2022',
    materialIds: ['wse2', 'pd'],
    parameterKey: 'contactResistance_ohm',
    value: null,
    unit: 'ohm',
    condition_zh:
      'WSe₂ transistors, comparison of contact concepts; exact device/contact structure must be checked.',
    method_zh: 'Device electrical characterization',
    agreementStatus: 'condition_dependent',
    confidence: 'medium',
    quoteOrSummary_zh:
      '該文獻可用於提醒：WSe₂ 金屬接觸不能只靠 work function 或 Schottky-Mott rule 判斷，Fermi-level pinning 與界面條件可能重要。',
    applicability_zh:
      '適合放入電性模組 contact warning 與 band alignment limitation；不可直接當作使用者 Pd/WSe₂ 接觸電阻。',
    warnings_zh: ['不可假設 Pd/WSe₂ 一定是理想 ohmic contact。'],
  },
  {
    id: 'evidence-in-sb2o3-buffer',
    sourceId: 'lit-in-sb2o3-buffer-placeholder',
    materialIds: ['in', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh: '待查：In 是否可降低金屬沉積對 Sb₂O₃ 的界面衝擊。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh:
      '使用者提到有 paper 指出 In 可能減少金屬對 Sb₂O₃ 的衝擊；本記錄僅作為待查候選，不代表已驗證。',
    applicability_zh:
      '需確認該 paper 的材料系統、沉積方式、厚度、退火條件與量測方法是否適用於目前 Sb₂O₃/WSe₂/Sb 結構。',
    warnings_zh: ['尚未填入真實文獻來源；不可視為結論。'],
  },
  {
    id: 'evidence-zhang-2026-sb2o3-dielectric-constant',
    sourceId: 'src-zhang-2026-sb2o3-wse2-dielectric',
    materialIds: ['sb2o3', 'wse2'],
    parameterKey: 'dielectricConstant',
    value: 'approximately 6',
    condition_zh:
      'monolayer Sb₂O₃ dielectric integrated with WSe₂ transistor；需回查原文確認頻率、厚度、interface quality 與 device geometry。',
    method_zh: 'Electrical characterization of 2D transistor dielectric stack',
    agreementStatus: 'supports',
    confidence: 'low',
    quoteOrSummary_zh:
      '網頁摘要指出 epitaxially grown single-crystalline monolayer Sb₂O₃ 可作為 WSe₂ transistor dielectric，並列出 dielectric constant 約 6。',
    applicability_zh:
      '可作為 Sb₂O₃/WSe₂ dielectric stack 的候選 evidence；不可直接推廣到所有 Sb₂O₃ 薄膜或使用者製程。',
    warnings_zh: ['需人工完整審核原文與量測條件後，才可考慮建立 recommendation。'],
  },
  {
    id: 'evidence-zhang-2026-sb2o3-breakdown-field',
    sourceId: 'src-zhang-2026-sb2o3-wse2-dielectric',
    materialIds: ['sb2o3', 'wse2'],
    parameterKey: 'breakdownField_MVcm',
    value: 'approximately 11',
    unit: 'MV/cm',
    condition_zh:
      'monolayer Sb₂O₃ dielectric in WSe₂ transistor context；需確認 breakdown criterion、device area 與 leakage definition。',
    method_zh: 'Electrical breakdown characterization',
    agreementStatus: 'supports',
    confidence: 'low',
    applicability_zh:
      '可作為 electrical breakdown warning 的候選 evidence；不可直接代表使用者實驗室 Sb₂O₃ layer。',
    warnings_zh: ['breakdown 受缺陷、電極、面積、厚度、環境與製程影響。'],
  },
  {
    id: 'evidence-sb2o3-breakdown-2024-leakage-traps',
    sourceId: 'src-sb2o3-breakdown-2024',
    materialIds: ['sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'High-k antimony oxide dielectric breakdown；需確認 thin-film phase、electrode、field stress 與 sample preparation。',
    method_zh: 'Dielectric breakdown mechanism analysis',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    quoteOrSummary_zh:
      '來源摘要指出 oxygen vacancies 與 metallic species migration 可能參與 high-k antimony oxide breakdown mechanism。',
    applicability_zh:
      '適合用於 leakage / trap / breakdown warning；不可直接轉成固定 leakage current 或 defect density。',
    warnings_zh: ['oxygen vacancy、trap 與金屬遷移需要 device-specific 校準。'],
  },
  {
    id: 'evidence-millet-1991-sb-surface-oxidation-xps',
    sourceId: 'src-millet-1991-sb-surface-oxidation-xps',
    materialIds: ['sb-bulk', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      'Sb 表面氧化層；原文條件為 UV laser irradiation 下成長之氧化層，需要確認是否適用 ambient exposure。',
    method_zh: 'XPS surface and interface characterization',
    agreementStatus: 'condition_dependent',
    confidence: 'low',
    quoteOrSummary_zh:
      '該文可作為 Sb 表面氧化層與 Sb₂O₃ 化學態 XPS 判讀的候選來源。',
    applicability_zh:
      '適合提醒 Sb surface oxidation 需要 XPS/AFM 或製程校準；不可直接用於 ambient oxidation rate。',
    warnings_zh: ['不可僅由暴露時間定量推斷 Sb₂O₃ 厚度。'],
  },
  {
    id: 'evidence-sb-surface-oxidation-rate-placeholder',
    sourceId: 'src-millet-1991-sb-surface-oxidation-xps',
    materialIds: ['sb-bulk', 'sb2o3'],
    parameterKey: 'oxidationRate_nm_per_s',
    value: null,
    unit: 'nm/s',
    condition_zh: 'Sb surface oxidation to Sb₂O₃；air / ambient / oxygen / moisture rate 仍待查。',
    method_zh: 'XPS / AFM calibration needed',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh:
      '後續可用於氧化模組；目前沒有 verified oxidation rate，不可定量。',
    warnings_zh: ['Sb 表面氧化速率與厚度需由 XPS / AFM 或製程校準確認。'],
  },
  {
    id: 'evidence-in-sb2o3-interface-reaction-placeholder',
    sourceId: 'lit-in-sb2o3-buffer-placeholder',
    materialIds: ['in', 'sb2o3'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：In/Sb₂O₃ interface reaction、buffer behavior、沉積厚度、退火與量測方法。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh:
      '目前資料庫沒有 verified evidence 支持 In 一定能降低金屬沉積對 Sb₂O₃ 的界面衝擊。',
    applicability_zh:
      '僅可作為 literature review 與實驗設計追蹤項目，不可作為結論。',
    warnings_zh: [
      '不可宣稱 In universally reduces damage。',
      '需檢查 deposition method、thickness、temperature、annealing 與 measurement method。',
    ],
  },
  {
    id: 'evidence-pd-sb2o3-d0-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['pd', 'sb2o3'],
    parameterKey: 'D0_m2s',
    value: null,
    unit: 'm²/s',
    condition_zh:
      '待查：Pd 進入 Sb₂O₃ 的熱擴散參數；需確認材料相、溫度範圍、薄膜品質與量測方法。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-pd-sb2o3-ea-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['pd', 'sb2o3'],
    parameterKey: 'Ea_eV',
    value: null,
    unit: 'eV',
    condition_zh:
      '待查：Pd 進入 Sb₂O₃ 的 activation energy；需確認 Arrhenius fitting 範圍與材料條件。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-in-sb2o3-d0-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['in', 'sb2o3'],
    parameterKey: 'D0_m2s',
    value: null,
    unit: 'm²/s',
    condition_zh:
      '待查：In 進入 Sb₂O₃ 的熱擴散參數；需確認材料相、溫度範圍、薄膜品質與量測方法。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-in-sb2o3-ea-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['in', 'sb2o3'],
    parameterKey: 'Ea_eV',
    value: null,
    unit: 'eV',
    condition_zh:
      '待查：In 進入 Sb₂O₃ 的 activation energy；需確認 Arrhenius fitting 範圍與材料條件。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-ti-sb2o3-d0-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['ti', 'sb2o3'],
    parameterKey: 'D0_m2s',
    value: null,
    unit: 'm²/s',
    condition_zh:
      '待查：Ti 進入 Sb₂O₃ 的熱擴散參數；需確認 Ti oxidation / interface reaction 是否主導。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-ti-sb2o3-ea-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['ti', 'sb2o3'],
    parameterKey: 'Ea_eV',
    value: null,
    unit: 'eV',
    condition_zh:
      '待查：Ti 進入 Sb₂O₃ 的 activation energy；需確認 diffusion 與 chemical reaction 是否可分離。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-au-sb2o3-d0-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['au', 'sb2o3'],
    parameterKey: 'D0_m2s',
    value: null,
    unit: 'm²/s',
    condition_zh:
      '待查：Au 進入 Sb₂O₃ 的熱擴散參數；需確認材料相、溫度範圍、薄膜品質與量測方法。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-au-sb2o3-ea-placeholder',
    sourceId: 'src-placeholder-pd-in-ti-au-sb2o3-diffusion',
    materialIds: ['au', 'sb2o3'],
    parameterKey: 'Ea_eV',
    value: null,
    unit: 'eV',
    condition_zh:
      '待查：Au 進入 Sb₂O₃ 的 activation energy；需確認 Arrhenius fitting 範圍與材料條件。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '後續可用於 Batch 7 擴散模型；目前不可定量。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-metal-deposition-damage-sb2o3-placeholder',
    sourceId: 'src-placeholder-metal-deposition-damage-sb2o3',
    materialIds: ['sb2o3', 'pd', 'in', 'ti', 'au'],
    parameterKey: 'custom',
    value: null,
    condition_zh:
      '待查：金屬沉積對 Sb₂O₃ 造成界面混合、缺陷或局部損傷的條件依賴性。',
    method_zh: '待查文獻或實驗。',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    quoteOrSummary_zh:
      '目前資料庫未驗證任何金屬可普遍降低 Sb₂O₃ 沉積損傷；In 仍只是候選緩衝金屬。',
    applicability_zh:
      '適合用於製程與擴散模組 warning；不可作為材料選擇結論。',
    warnings_zh: ['不同金屬、沉積能量、厚度、基板溫度與退火會改變界面損傷風險。'],
  },
  {
    id: 'evidence-sb2o3-dielectric',
    sourceId: 'lit-sb2o3-dielectric-placeholder',
    materialIds: ['sb2o3'],
    parameterKey: 'dielectricConstant',
    value: null,
    unit: '無單位',
    condition_zh: '待補：薄膜製程、厚度、頻率與漏電條件。',
    method_zh: '待補',
    agreementStatus: 'condition_dependent',
    confidence: 'unknown',
    applicability_zh: '未來需依製程條件分類，不可直接寫入材料資料庫。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-pd-wse2-contact',
    sourceId: 'lit-pd-wse2-contact-placeholder',
    materialIds: ['pd', 'wse2'],
    parameterKey: 'contactResistance_ohm',
    value: null,
    unit: 'Ω',
    condition_zh: '待補：金屬沉積、退火、污染與界面態條件。',
    method_zh: '待補',
    agreementStatus: 'condition_dependent',
    confidence: 'unknown',
    applicability_zh: '接觸行為可能受 pinning、缺陷與退火影響。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-wse2-oxidation-rate',
    sourceId: 'lit-wse2-wox-oxidation-placeholder',
    materialIds: ['wse2', 'wox'],
    parameterKey: 'oxidationRate_nm_per_s',
    value: null,
    unit: 'nm/s',
    condition_zh: '待補：O₂ RIE、UV ozone、thermal 或 ambient 條件。',
    method_zh: '待補',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '氧化速率需依方法、功率、時間與樣品厚度校準。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-raman-probe-depth',
    sourceId: 'lit-raman-visible-oxidation-placeholder',
    materialIds: ['wse2', 'wox'],
    parameterKey: 'ramanProbeDepth_nm',
    value: null,
    unit: 'nm',
    condition_zh: '待補：雷射波長、材料吸收、層厚與基板背景。',
    method_zh: '待補',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: 'Raman 可見性不能單靠單一深度參數判定。',
    warnings_zh: placeholderWarning,
  },
  {
    id: 'evidence-metal-diffusion-sb2o3',
    sourceId: 'lit-metal-diffusion-sb2o3-placeholder',
    materialIds: ['pd', 'in', 'ti', 'au', 'sb2o3'],
    parameterKey: 'D0_m2s',
    value: null,
    unit: 'm²/s',
    condition_zh: '待補：金屬種類、Sb₂O₃ 製程、退火溫度與時間。',
    method_zh: '待補',
    agreementStatus: 'unclear',
    confidence: 'unknown',
    applicability_zh: '未來需分金屬與製程條件建立獨立 evidence。',
    warnings_zh: placeholderWarning,
  },
]
