export const workspaceTabs = [
  {
    id: 'structure',
    label: '元件結構',
    title: '元件結構',
    description:
      '建立與檢視 Sb 塊材 / Sb₂O₃ / WSe₂ / Pd / 上閘極等二維半導體元件堆疊結構。',
    features: ['3D 結構檢視', '長寬厚度設定', '電極與材料標籤', '剖面與爆炸圖模式'],
  },
  {
    id: 'materials',
    label: '材料資料庫',
    title: '材料資料庫',
    description:
      '管理二維半導體元件中常用的金屬、二維半導體、介電層、氧化物與塊材導體參數。',
    features: ['分類篩選', '材料詳情', '參數信心標示', '缺少參數提醒'],
  },
  {
    id: 'electrical',
    label: '電性分析',
    title: '電性分析',
    description: '規劃元件 I-V 曲線、接觸電阻與閘極控制趨勢的近似分析介面。',
    features: ['I-V 曲線預覽', '偏壓條件設定', '接觸假設', '分析摘要'],
  },
  {
    id: 'diffusion',
    label: '擴散與退火',
    title: '擴散與退火',
    description: '未來用於描述退火條件下的元素擴散與界面變化趨勢。',
    features: ['退火時間與溫度', '擴散深度占位', '界面濃度標記', '參數敏感度'],
  },
  {
    id: 'oxidation',
    label: '氧化模擬',
    title: '氧化模擬',
    description: '規劃 WOx 與 Sb₂O₃ 等氧化層形成過程的視覺化設定。',
    features: ['氧化前後結構', '氧化進度', '厚度變化', '製程條件註記'],
  },
  {
    id: 'lattice',
    label: '晶格視覺化',
    title: '晶格視覺化',
    description: '未來展示晶格方向、層間對齊與材料界面示意。',
    features: ['晶格方向標籤', '層間堆疊示意', '缺陷標記', '界面對齊提示'],
  },
  {
    id: 'results',
    label: '結果與匯出',
    title: '結果與匯出',
    description: '未來集中整理模擬設定、視覺化結果與研究紀錄。',
    features: ['結果摘要', '參數紀錄', '圖表匯出占位', '報告註記'],
  },
] as const

export type WorkspaceTab = (typeof workspaceTabs)[number]
export type WorkspaceTabId = WorkspaceTab['id']
