export const workspaceTabs = [
  {
    id: 'structure',
    label: '元件結構',
    title: '元件結構',
    description:
      '建立與編輯二維半導體元件的材料層堆疊、內建模板、幾何尺寸、材料角色與偏壓標籤。',
    features: ['內建模板選擇', '材料層堆疊', '局部層位置示意', '2D 側視預覽'],
  },
  {
    id: 'materials',
    label: '材料資料庫',
    title: '材料資料庫',
    description:
      '管理二維半導體元件中常用的金屬、二維半導體、介電層、氧化物與塊材導體參數。',
    features: ['材料搜尋', '分類篩選', '分組參數詳情', '缺少參數提醒'],
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
    title: '製程流程與退火擴散',
    description:
      '建立金屬沉積、介電層沉積、氧化、RIE、退火與量測流程；目前僅記錄與組織製程條件，尚未進行真實擴散或製程模擬。',
    features: ['流程時間線', '製程樣板', '參數編輯', '材料層關聯'],
  },
  {
    id: 'oxidation',
    label: '氧化模擬',
    title: '氧化模擬',
    description: '規劃 WOx 與 Sb₂O₃ 等氧化層形成過程的視覺化設定。',
    features: ['氧化前後結構', '氧化進度', '厚度變化', '製程條件註記'],
  },
  {
    id: 'measurements',
    label: '量測資料',
    title: '量測資料匯入與比較',
    description:
      '匯入 Raman、PL 與電性資料，進行初步視覺化、before/after 比較，並與元件材料層與製程步驟建立關聯。',
    features: ['CSV / TXT 匯入', '欄位對應', '資料預覽', 'before / after 比較'],
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
