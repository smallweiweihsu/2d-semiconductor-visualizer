import type {
  MaterialLiteratureTodo,
  MaterialParameterKey,
} from '../types/literature'

type TodoPriority = MaterialLiteratureTodo['priority']

interface TodoSeed {
  materialId: string
  priority: TodoPriority
  parameters: Array<{
    key: MaterialParameterKey
    reason_zh: string
    terms: string[]
  }>
}

const todoSeeds: TodoSeed[] = [
  {
    materialId: 'wse2',
    priority: 'high',
    parameters: [
      {
        key: 'bandGap_eV',
        reason_zh: '電性模型與 band alignment 需要 WSe₂ 能隙參數。',
        terms: ['WSe2 band gap monolayer few-layer', 'WSe2 optical bandgap'],
      },
      {
        key: 'electronAffinity_eV',
        reason_zh: '接觸與 band alignment 預覽需要電子親和能。',
        terms: ['WSe2 electron affinity', 'WSe2 band alignment electron affinity'],
      },
      {
        key: 'mobility_cm2Vs',
        reason_zh: 'Id-Vg / Id-Vd 近似需要遷移率範圍與量測條件。',
        terms: ['WSe2 field effect mobility device', 'WSe2 mobility top gate'],
      },
      {
        key: 'latticeConstant_A',
        reason_zh: '未來晶格視覺化與材料比較需要晶格常數。',
        terms: ['WSe2 lattice constant', 'WSe2 crystal structure lattice parameter'],
      },
      {
        key: 'custom',
        reason_zh: '需要整理 Raman mode positions，但目前 literature type 尚未有專用 key。',
        terms: ['WSe2 Raman mode E A peak position', 'WSe2 Raman spectrum mode'],
      },
      {
        key: 'oxidationRate_nm_per_s',
        reason_zh: '氧化模組需要 WSe₂ 轉 WOx 的速率或製程校準資料。',
        terms: ['WSe2 oxidation WOx rate O2 RIE', 'WSe2 UV ozone oxidation WOx'],
      },
      {
        key: 'ramanProbeDepth_nm',
        reason_zh: 'Raman 仍可見性的判讀需要探測深度或吸收相關資料。',
        terms: ['WSe2 Raman penetration depth oxidation', 'Raman visibility WSe2 WOx'],
      },
      {
        key: 'custom',
        reason_zh: 'Pd / Ti / Au / In 與 WSe₂ 接觸行為需要按金屬與製程條件整理。',
        terms: ['WSe2 Pd Ti Au In contact Fermi level pinning', 'WSe2 metal contact resistance'],
      },
    ],
  },
  {
    materialId: 'sb2o3',
    priority: 'high',
    parameters: [
      {
        key: 'dielectricConstant',
        reason_zh: '上閘極電容、gate control 與電性模型需要 Sb₂O₃ 介電常數。',
        terms: ['Sb2O3 dielectric constant thin film', 'antimony oxide dielectric constant'],
      },
      {
        key: 'breakdownField_MVcm',
        reason_zh: '介電層漏電與崩潰風險需要崩潰電場資料。',
        terms: ['Sb2O3 breakdown field dielectric', 'antimony oxide leakage breakdown'],
      },
      {
        key: 'resistivity_ohm_m',
        reason_zh: '介電漏電與絕緣性判斷需要電阻率資料。',
        terms: ['Sb2O3 resistivity dielectric film', 'antimony oxide electrical resistivity'],
      },
      {
        key: 'bandOffset_eV',
        reason_zh: 'WSe₂ / Sb₂O₃ gate dielectric barrier 需要 band offset 候選資料。',
        terms: ['WSe2 Sb2O3 band offset', 'Sb2O3 band alignment semiconductor'],
      },
      {
        key: 'D0_m2s',
        reason_zh: 'Pd/In/Ti/Au 等金屬進入 Sb₂O₃ 的擴散估算需要 D0。',
        terms: ['metal diffusion Sb2O3 D0 Pd In Ti Au', 'diffusion coefficient metal antimony oxide'],
      },
      {
        key: 'Ea_eV',
        reason_zh: 'Pd/In/Ti/Au 等金屬進入 Sb₂O₃ 的 Arrhenius 模型需要 Ea。',
        terms: ['metal diffusion Sb2O3 activation energy', 'Pd diffusion antimony oxide Ea'],
      },
      {
        key: 'custom',
        reason_zh: 'Sb₂O₃ leakage / trap behavior 會影響 gate control 與 hysteresis。',
        terms: ['Sb2O3 trap states leakage dielectric', 'antimony oxide defects leakage'],
      },
    ],
  },
  {
    materialId: 'sb-bulk',
    priority: 'high',
    parameters: [
      {
        key: 'workFunction_eV',
        reason_zh: 'Sb bulk 作為底部 source / platform 時需要功函數候選資料。',
        terms: ['antimony work function Sb bulk', 'Sb metal work function'],
      },
      {
        key: 'resistivity_ohm_m',
        reason_zh: '底部 source 平台的電阻近似需要 Sb bulk 電阻率。',
        terms: ['antimony electrical resistivity bulk', 'Sb bulk resistivity'],
      },
      {
        key: 'custom',
        reason_zh: 'Sb 表面氧化成 Sb₂O₃ 的速率與厚度需要製程/環境資料。',
        terms: ['antimony surface oxidation Sb2O3 ambient', 'Sb oxidation rate Sb2O3'],
      },
      {
        key: 'custom',
        reason_zh: 'Sb/Sb₂O₃ interface behavior 可能影響接觸與通道，需要文獻整理。',
        terms: ['Sb Sb2O3 interface electronic properties', 'antimony oxide interface'],
      },
    ],
  },
  {
    materialId: 'pd',
    priority: 'high',
    parameters: [
      {
        key: 'workFunction_eV',
        reason_zh: 'Pd/WSe₂ contact warning 與 band preview 需要功函數候選資料。',
        terms: ['Pd work function thin film', 'palladium work function contact WSe2'],
      },
      {
        key: 'meltingPoint_C',
        reason_zh: '熱穩定性與退火風險摘要需要熔點資料。',
        terms: ['Pd melting point', 'palladium thermal stability thin film'],
      },
      {
        key: 'custom',
        reason_zh: 'Pd/WSe₂ 接觸不應假設 ideal ohmic，需要接觸行為文獻。',
        terms: ['Pd WSe2 contact resistance Fermi level pinning', 'Pd contact WSe2 transistor'],
      },
      {
        key: 'D0_m2s',
        reason_zh: 'Pd into Sb₂O₃ 擴散模型需要 D0/Ea 候選資料。',
        terms: ['Pd diffusion Sb2O3 D0 Ea', 'palladium diffusion antimony oxide'],
      },
    ],
  },
  {
    materialId: 'in',
    priority: 'high',
    parameters: [
      {
        key: 'workFunction_eV',
        reason_zh: 'In 作為候選緩衝金屬或接觸金屬時需要功函數資料。',
        terms: ['indium work function thin film', 'In metal work function'],
      },
      {
        key: 'meltingPoint_C',
        reason_zh: 'In 熔點較低，熱穩定性風險需要明確標示。',
        terms: ['indium melting point', 'In thermal stability thin film'],
      },
      {
        key: 'custom',
        reason_zh: 'In / Sb₂O₃ interface buffer 行為是研究假設，需文獻與實驗驗證。',
        terms: ['In Sb2O3 interface buffer', 'indium antimony oxide interface'],
      },
      {
        key: 'D0_m2s',
        reason_zh: 'In into Sb₂O₃ 擴散模型需要 D0/Ea 候選資料。',
        terms: ['In diffusion Sb2O3 D0 Ea', 'indium diffusion antimony oxide'],
      },
      {
        key: 'custom',
        reason_zh: 'In 熱穩定性與界面反應風險需要獨立整理。',
        terms: ['indium thermal stability oxide interface', 'In diffusion oxide annealing'],
      },
    ],
  },
  {
    materialId: 'wox',
    priority: 'high',
    parameters: [
      {
        key: 'bandGap_eV',
        reason_zh: 'WOx band gap 受 stoichiometry 影響，需分條件整理。',
        terms: ['WOx band gap stoichiometry', 'tungsten oxide band gap oxygen vacancy'],
      },
      {
        key: 'resistivity_ohm_m',
        reason_zh: 'WOx 導電性與氧缺陷可能影響氧化後電性判讀。',
        terms: ['WOx resistivity oxygen vacancy', 'tungsten oxide electrical resistivity'],
      },
      {
        key: 'custom',
        reason_zh: 'WOx Raman features 需要整理，但不應自動判定固定化學計量。',
        terms: ['WOx Raman peaks tungsten oxide', 'WO3 Raman spectrum WSe2 oxidation'],
      },
      {
        key: 'custom',
        reason_zh: 'WOx composition dependence 是氧化/Raman 解釋的重要限制。',
        terms: ['WOx composition dependence WSe2 oxidation', 'substoichiometric tungsten oxide WOx'],
      },
    ],
  },
]

const mediumMaterials = [
  'ti',
  'au',
  'cr',
  'ni',
  'pt',
  'al',
  'ag',
  'cu',
  'sc',
  'hfo2',
  'al2o3',
  'sio2',
  'hbn',
]
const lowMaterials = ['mos2', 'ws2', 'mose2', 'mote2', 'graphene', 'black-phosphorus']
const diffusionMetals = ['pd', 'in', 'ti', 'au', 'cr', 'ni', 'pt', 'al', 'ag', 'cu', 'sc']

const batch15BTodos: MaterialLiteratureTodo[] = [
  createBatch15BTodo(
    'sb2o3',
    'high',
    'bandGap_eV',
    'Sb₂O₃ band gap 會影響 band alignment、gate leakage 與 dielectric barrier 判讀。',
    [
      'Sb2O3 band gap thin film high-k dielectric',
      'antimony trioxide optical band gap dielectric',
    ],
  ),
  createBatch15BTodo(
    'sb2o3',
    'high',
    'custom',
    'Sb₂O₃ leakage / trap behavior 會影響 hysteresis、gate leakage 與 breakdown interpretation。',
    [
      'Sb2O3 leakage trap oxygen vacancy dielectric',
      'antimony oxide trap density breakdown leakage',
    ],
  ),
  createBatch15BTodo(
    'sb2o3',
    'high',
    'custom',
    '氧空缺與缺陷可能影響 Sb₂O₃ 介電常數、漏電與金屬擴散風險。',
    [
      'Sb2O3 oxygen vacancy defect dielectric breakdown',
      'high-k antimony oxide oxygen vacancy trap',
    ],
  ),
  createBatch15BTodo(
    'sb2o3',
    'high',
    'custom',
    '金屬沉積時 Sb₂O₃ 是否受損、混合或形成 interface defects 是目前最急需釐清的製程問題。',
    [
      'metal deposition damage Sb2O3 interface',
      'metal antimony oxide interface mixing deposition damage',
    ],
  ),
  createBatch15BTodo(
    'sb-bulk',
    'high',
    'oxidationRate_nm_per_s',
    'Sb 表面在 air、oxygen、moisture 或 glovebox leakage 下形成 Sb₂O₃ 的速率需要校準。',
    [
      'Sb surface oxidation Sb2O3 air exposure XPS AFM',
      'antimony oxidation rate ambient moisture Sb2O3',
    ],
  ),
  createBatch15BTodo(
    'sb-bulk',
    'high',
    'custom',
    'Sb/Sb₂O₃ interface behavior 可能影響底部 source、局部氧化層與 WSe₂ 接觸區域。',
    [
      'Sb Sb2O3 interface XPS electronic properties',
      'antimony antimony oxide interface oxidation moisture',
    ],
  ),
  createBatch15BTodo(
    'in',
    'high',
    'Ea_eV',
    'In into Sb₂O₃ 的 Ea 缺失會阻止擴散模型做定量估算。',
    ['In diffusion Sb2O3 activation energy', 'indium diffusion antimony oxide Ea'],
  ),
  createBatch15BTodo(
    'in',
    'high',
    'custom',
    'In/Sb₂O₃ interface reaction 與 buffer effect 需要直接文獻或實驗，不能由一般 In 性質推論。',
    [
      'In Sb2O3 interface reaction buffer layer',
      'indium antimony oxide interface deposition',
    ],
  ),
  createBatch15BTodo(
    'in',
    'high',
    'custom',
    'In contact layer 的低熔點與熱穩定性可能影響退火、擴散與界面形貌。',
    [
      'indium contact thermal stability annealing oxide interface',
      'indium thin film diffusion low melting point device',
    ],
  ),
  createBatch15BTodo(
    'pd',
    'high',
    'Ea_eV',
    'Pd into Sb₂O₃ 的 Ea 缺失會阻止擴散模型做定量估算。',
    ['Pd diffusion Sb2O3 activation energy', 'palladium diffusion antimony oxide Ea'],
  ),
  createBatch15BTodo(
    'pd',
    'high',
    'custom',
    'Pd/Sb₂O₃ interface reaction 與 deposition damage risk 需要與 Pd/WSe₂ contact 分開追蹤。',
    [
      'Pd Sb2O3 interface reaction deposition damage',
      'palladium antimony oxide interface mixing',
    ],
  ),
  createBatch15BTodo(
    'wox',
    'high',
    'custom',
    'WSe₂ oxidation product may be non-stoichiometric WOx；Raman signatures 與 electrical resistivity 需按 composition 追蹤。',
    [
      'WSe2 oxidation WOx composition Raman signature',
      'tungsten oxide WOx resistivity oxygen vacancy Raman',
    ],
  ),
]

const contactMetals15C = [
  'pd',
  'ti',
  'au',
  'in',
  'sc',
  'ni',
  'pt',
  'cr',
  'al',
  'ag',
  'cu',
] as const

const batch15CTodos: MaterialLiteratureTodo[] = contactMetals15C.flatMap(
  (materialId) => seedMetalContactTodos(materialId),
)

const dielectricMaterials15D = ['hfo2', 'al2o3', 'sio2', 'hbn', 'sb2o3'] as const

const batch15DTodos: MaterialLiteratureTodo[] = dielectricMaterials15D.flatMap(
  (materialId) => seedDielectricTodos(materialId),
)

export const materialLiteratureTodos: MaterialLiteratureTodo[] = [
  ...todoSeeds.flatMap(seedToTodos),
  ...batch15BTodos,
  ...batch15CTodos,
  ...batch15DTodos,
  ...diffusionMetals.flatMap((materialId) => seedMetalDiffusionTodos(materialId)),
  ...mediumMaterials.flatMap((materialId) =>
    seedGenericTodos(materialId, 'medium'),
  ),
  ...lowMaterials.flatMap((materialId) => seedGenericTodos(materialId, 'low')),
]

function seedToTodos(seed: TodoSeed) {
  return seed.parameters.map((parameter, index) =>
    createTodo(
      seed.materialId,
      seed.priority,
      parameter.key,
      parameter.reason_zh,
      parameter.terms,
      index,
    ),
  )
}

function seedGenericTodos(materialId: string, priority: TodoPriority) {
  const genericParameters: Array<{
    key: MaterialParameterKey
    reason_zh: string
    terms: string[]
  }> = [
    {
      key: 'workFunction_eV',
      reason_zh: '接觸、band alignment 或材料比較需要候選功函數資料。',
      terms: [`${materialId} work function`, `${materialId} contact semiconductor`],
    },
    {
      key: 'bandGap_eV',
      reason_zh: '半導體 / 介電 / 氧化物模型需要能隙或絕緣能隙候選資料。',
      terms: [`${materialId} band gap`, `${materialId} electronic properties`],
    },
    {
      key: 'dielectricConstant',
      reason_zh: '若作為介電或絕緣材料，需要介電常數與製程條件。',
      terms: [`${materialId} dielectric constant`, `${materialId} thin film dielectric`],
    },
    {
      key: 'custom',
      reason_zh: '需要整理與本研究元件相關的接觸、氧化、Raman 或製程限制。',
      terms: [`${materialId} WSe2 contact oxidation Raman`, `${materialId} 2D semiconductor device`],
    },
  ]

  return genericParameters.map((parameter, index) =>
    createTodo(
      materialId,
      priority,
      parameter.key,
      parameter.reason_zh,
      parameter.terms,
      index,
    ),
  )
}

function seedMetalDiffusionTodos(materialId: string) {
  const priority: TodoPriority = ['pd', 'in', 'ti', 'au'].includes(materialId)
    ? 'high'
    : 'medium'
  const materialLabel = materialId.toUpperCase()

  return [
    createBatch15BTodo(
      materialId,
      priority,
      'D0_m2s',
      `${materialLabel} into Sb₂O₃ 的 D0 缺失會阻止擴散模型做定量估算。`,
      [
        `${materialId} diffusion Sb2O3 D0`,
        `${materialId} diffusion antimony oxide coefficient`,
      ],
    ),
    createBatch15BTodo(
      materialId,
      priority,
      'Ea_eV',
      `${materialLabel} into Sb₂O₃ 的 Ea 缺失會阻止 Arrhenius 擴散模型做定量估算。`,
      [
        `${materialId} diffusion Sb2O3 activation energy`,
        `${materialId} antimony oxide diffusion Ea`,
      ],
    ),
    createBatch15BTodo(
      materialId,
      priority,
      'custom',
      `${materialLabel}/Sb₂O₃ oxide interface reaction、adhesion layer behavior 或 deposition damage 需與 diffusion 分開追蹤。`,
      [
        `${materialId} Sb2O3 interface reaction`,
        `${materialId} oxide interface deposition damage adhesion layer`,
      ],
    ),
  ]
}

function seedMetalContactTodos(materialId: string) {
  const highPriorityMetals = ['pd', 'ti', 'au', 'in', 'sc']
  const mediumPriorityMetals = ['ni', 'pt', 'cr', 'al', 'ag', 'cu']
  const priority: TodoPriority = highPriorityMetals.includes(materialId)
    ? 'high'
    : mediumPriorityMetals.includes(materialId)
      ? 'medium'
      : 'low'
  const label = materialId.toUpperCase()
  const baseTerms = [`${label} WSe2 contact`, `${materialId} WSe2 Fermi level pinning`]

  return [
    createBatch15CTodo(
      materialId,
      priority,
      'custom',
      `${label}/WSe₂ contact behavior 需要 verified evidence；WSe2 contact 與 Fermi-level pinning 不可只靠 work function 判斷。`,
      [...baseTerms, `${materialId} WSe2 Schottky barrier`],
    ),
    createBatch15CTodo(
      materialId,
      priority,
      'workFunction_eV',
      `${label} work function 可作 contact context，但受表面、晶向、污染、沉積與環境影響，不能單獨排名 WSe₂ 接觸品質。`,
      [`${label} work function thin film`, `${materialId} metal work function surface orientation`],
    ),
    createBatch15CTodo(
      materialId,
      priority,
      'contactResistance_ohm',
      `${label}/WSe₂ contact resistance 若沒有 comparable device/TLM/fitting 資料，電性模型仍需手動輸入。`,
      [`${label} WSe2 contact resistance`, `${materialId} WSe2 TLM contact resistance`],
    ),
    createBatch15CTodo(
      materialId,
      priority,
      'custom',
      `${label}/WSe₂ Schottky barrier、Fermi-level pinning 與 interface states 需要按接觸幾何、層數與退火條件整理。`,
      [`${label} WSe2 Schottky barrier`, `${materialId} WSe2 interface states pinning`],
    ),
    createBatch15CTodo(
      materialId,
      priority,
      'custom',
      `${label} adhesion / interface layer role 可能改變 WSe₂ 或 Sb₂O₃ 界面；需與 diffusion 和 deposition damage 分開追蹤。`,
      [`${label} adhesion layer WSe2 contact`, `${materialId} oxide interface adhesion layer`],
    ),
    createBatch15CTodo(
      materialId,
      priority,
      'custom',
      `${label} thermal stability during annealing 可能影響接觸電阻、擴散、Raman/PL 與界面缺陷。`,
      [`${label} WSe2 contact annealing thermal stability`, `${materialId} thin film annealing interface diffusion`],
    ),
    createBatch15CTodo(
      materialId,
      priority,
      'custom',
      `${label} 可能透過缺陷、污染、界面態或金屬擴散間接改變 Raman / PL / electrical behavior，需文獻或實驗比對。`,
      [`${label} WSe2 Raman PL contact damage`, `${materialId} metal deposition damage TMD`],
    ),
  ]
}

function seedDielectricTodos(materialId: string) {
  const highPriority = ['sb2o3', 'hfo2', 'al2o3', 'hbn']
  const priority: TodoPriority = highPriority.includes(materialId) ? 'high' : 'medium'
  const labelMap: Record<string, string> = {
    hfo2: 'HfO2',
    al2o3: 'Al2O3',
    sio2: 'SiO2',
    hbn: 'hBN',
    sb2o3: 'Sb2O3',
  }
  const label = labelMap[materialId] ?? materialId

  return [
    createBatch15DTodo(
      materialId,
      priority,
      'dielectricConstant',
      `${label} dielectric constant 需要按相、厚度、沉積方法、頻率與漏電條件整理；不可用單一 k 代表所有結構。`,
      [`${label} dielectric constant thin film`, `${label} dielectric constant WSe2 top gate`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'bandGap_eV',
      `${label} band gap 會影響 gate leakage 與 dielectric barrier，但需確認材料相與量測方法。`,
      [`${label} band gap dielectric`, `${label} optical band gap thin film`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'electronAffinity_eV',
      `${label} electron affinity 只能作 band alignment context，不能單獨決定 WSe₂ interface band offset。`,
      [`${label} electron affinity`, `${label} band alignment WSe2 electron affinity`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'breakdownField_MVcm',
      `${label} breakdown field 受厚度、pinholes、缺陷、電極、漏電與製程影響，需要 device-specific evidence。`,
      [`${label} breakdown field thin film`, `${label} dielectric breakdown WSe2 gate`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'resistivity_ohm_m',
      `${label} resistivity / insulation quality 需要與 leakage current、缺陷與測試幾何一起整理。`,
      [`${label} resistivity dielectric leakage`, `${label} insulation resistivity thin film`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'custom',
      `${label} leakage behavior 需建立文獻 evidence，避免把 breakdown 或 leakage risk 視為固定材料常數。`,
      [`${label} leakage current 2D semiconductor dielectric`, `${label} gate leakage traps WSe2`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'custom',
      `${label} interface traps / hysteresis 可能影響 WSe₂ top gate 或 substrate device，需要獨立追蹤。`,
      [`${label} WSe2 interface traps hysteresis`, `${label} charge traps 2D FET`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'bandOffset_eV',
      `${label}/WSe₂ band offset 需指定 interface、製程、厚度與量測方法，不可由 bulk electron affinity 直接推論。`,
      [`${label} WSe2 band offset`, `${label} WSe2 band alignment XPS`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'custom',
      `${label} deposition / ALD compatibility with WSe₂ 需要追蹤 nucleation、seed layer、damage 與殘留污染。`,
      [`${label} WSe2 ALD compatibility`, `${label} deposition WSe2 interface damage`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'custom',
      `${label} remote phonon scattering / mobility degradation 可能影響 high-k gate 的實際效益。`,
      [`${label} remote phonon scattering 2D material`, `high-k dielectric remote phonon WSe2`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'custom',
      `${label} hysteresis / charge trap impact 需要與掃描方向、測試環境與退火歷史一起記錄。`,
      [`${label} WSe2 hysteresis charge trap`, `${label} 2D FET hysteresis dielectric`],
    ),
    createBatch15DTodo(
      materialId,
      priority,
      'custom',
      `${label} suitability for top gate dielectric 需按 Cox、leakage、interface traps、deposition damage 與 breakdown 綜合比較。`,
      [`${label} WSe2 top gate dielectric`, `${label} 2D semiconductor top gate high-k`],
    ),
    createBatch15DTodo(
      materialId,
      materialId === 'sio2' ? 'medium' : priority,
      'custom',
      `${label} suitability for substrate / encapsulation 需區分 substrate traps、vdW encapsulation、轉移污染與表面粗糙度。`,
      [`${label} WSe2 substrate encapsulation`, `${label} 2D semiconductor substrate traps encapsulation`],
    ),
  ]
}

function createBatch15DTodo(
  materialId: string,
  priority: TodoPriority,
  parameterKey: MaterialParameterKey,
  reason_zh: string,
  suggestedSearchTerms: string[],
): MaterialLiteratureTodo {
  return {
    id: `todo-15d-${materialId}-${parameterKey}-${slugify(suggestedSearchTerms[0])}`,
    materialId,
    priority,
    parameterKey,
    reason_zh,
    suggestedSearchTerms,
    status: 'todo',
    notes_zh:
      'Batch 15D 新增待查項目；用於介電常數、band offset、leakage、interface traps、ALD compatibility、remote phonon、top gate 與 encapsulation 追蹤。',
  }
}

function createBatch15CTodo(
  materialId: string,
  priority: TodoPriority,
  parameterKey: MaterialParameterKey,
  reason_zh: string,
  suggestedSearchTerms: string[],
): MaterialLiteratureTodo {
  return {
    id: `todo-15c-${materialId}-${parameterKey}-${slugify(suggestedSearchTerms[0])}`,
    materialId,
    priority,
    parameterKey,
    reason_zh,
    suggestedSearchTerms,
    status: 'todo',
    notes_zh:
      'Batch 15C 新增待查項目；用於金屬/WSe₂ contact、work function、contact resistance、pinning 與金屬/Sb₂O₃ 擴散追蹤。',
  }
}

function createBatch15BTodo(
  materialId: string,
  priority: TodoPriority,
  parameterKey: MaterialParameterKey,
  reason_zh: string,
  suggestedSearchTerms: string[],
): MaterialLiteratureTodo {
  return {
    id: `todo-15b-${materialId}-${parameterKey}-${slugify(suggestedSearchTerms[0])}`,
    materialId,
    priority,
    parameterKey,
    reason_zh,
    suggestedSearchTerms,
    status: 'todo',
    notes_zh: 'Batch 15B 新增待查項目；尚未人工審核。',
  }
}

function createTodo(
  materialId: string,
  priority: TodoPriority,
  parameterKey: MaterialParameterKey,
  reason_zh: string,
  suggestedSearchTerms: string[],
  index: number,
): MaterialLiteratureTodo {
  return {
    id: `todo-${materialId}-${parameterKey}-${index}`,
    materialId,
    priority,
    parameterKey,
    reason_zh,
    suggestedSearchTerms,
    status: 'todo',
    notes_zh: '待查文獻；尚未人工審核。',
  }
}

function slugify(value: string) {
  return value
    .replace(/[^\dA-Za-z]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36)
}
