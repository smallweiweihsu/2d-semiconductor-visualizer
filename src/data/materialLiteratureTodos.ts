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

export const materialLiteratureTodos: MaterialLiteratureTodo[] = [
  ...todoSeeds.flatMap(seedToTodos),
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
