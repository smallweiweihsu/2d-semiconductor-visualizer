import type { LiteratureSource, Material, MaterialParameter } from '../types/semiviz'
import { callAI, extractJson } from './client'

export interface PaperOutlineResult {
  outline: string
  parameters: string
  relevance?: string
}

// Generate a ~150-char Traditional-Chinese outline (+ extracted params) for a paper.
export async function aiPaperOutline(ref: LiteratureSource, fullText?: string): Promise<PaperOutlineResult> {
  const meta = `標題：${ref.title}\n作者：${ref.authors ?? ''}\n年份：${ref.year}\n期刊：${ref.journal ?? ''}\nDOI：${ref.doi ?? ''}`
  const body = fullText?.trim()
    ? `\n\n以下為論文全文/摘要片段（可能不完整）：\n${fullText.slice(0, 40000)}`
    : '\n\n（未提供全文，請依標題與你既有的知識撰寫，務必不要捏造具體數據；不確定的數值請略過或標註「需查證」。）'
  const prompt = `請為這篇二維半導體論文撰寫研究筆記。${meta}${body}\n\n請只輸出 JSON：{"outline":"約150字的繁體中文大綱，含主題、方法、關鍵結果","parameters":"逗號分隔的提取參數，如 mobility, SS, Rc","relevance":"與 WSe2 p-FET、Sb2O3/WOx 介面工程的相關性，一句話"}`
  const text = await callAI({ prompt, maxTokens: 900 })
  const json = extractJson<PaperOutlineResult>(text)
  if (json && json.outline) return json
  return { outline: text, parameters: ref.parameterExtracted ?? '' }
}

export async function aiMeasurementAnalysis(input: {
  name: string
  kind: string
  metrics: Record<string, string>
}): Promise<string> {
  const metricLines = Object.entries(input.metrics).map(([k, v]) => `${k}: ${v}`).join('\n')
  const prompt = `這是一筆二維半導體電性量測（${input.kind}），名稱「${input.name}」。自動萃取參數如下：\n${metricLines}\n\n請用繁體中文給 3–5 點解讀與可能原因/改善建議（例如 SS 偏高、on/off、回滯、接觸電阻等），精簡、條列、半定量，並提醒需依量測條件解讀。不要捏造未提供的數值。`
  return callAI({ prompt, maxTokens: 700 })
}

export interface BackfillSuggestion {
  param: string
  value: string
  unit?: string
  confidence?: string
  source?: string
}

export async function aiMaterialBackfill(material: Material, missing: string[]): Promise<BackfillSuggestion[]> {
  const prompt = `材料「${material.displayName}」（分類：${material.category}）缺少這些參數：${missing.join('、')}。\n請依文獻常見值給「估計值」，並標註典型出處（作者/年或期刊）。只輸出 JSON 陣列：[{"param":"work function","value":"4.0–4.5","unit":"eV","confidence":"estimated","source":"出處"}]。不要捏造精確到不合理的數字，範圍可用「a–b」。`
  const text = await callAI({ prompt, maxTokens: 800 })
  const json = extractJson<BackfillSuggestion[]>(text)
  return Array.isArray(json) ? json : []
}

export async function aiAsk(question: string, context: string, webSearch = false): Promise<string> {
  const prompt = `${context}\n\n問題：${question}`
  return callAI({
    prompt,
    webSearch,
    system: '你是二維半導體元件研究助理，熟悉 WSe2 p-FET、Sb2O3/WOx 介面工程、接觸/能帶、變溫傳輸。請用繁體中文精簡作答，必要時條列；不確定就說不確定，不要捏造數據。若有開啟網路搜尋，請查證後附上來源/DOI。',
    maxTokens: 1200,
  })
}

export interface FoundPaper {
  title: string
  authors?: string
  year?: number
  journal?: string
  doi?: string
  url?: string
  material?: string
  electrode?: string
  outline: string
  relevance?: string
}

// 用網路搜尋找出使用者尚未收錄的論文，回傳含大綱的結構化清單。
export async function aiFindPapers(topic: string, excludeTitles: string[], count = 3): Promise<FoundPaper[]> {
  const exclude = excludeTitles.slice(0, 60).map((t) => `- ${t}`).join('\n')
  const prompt = `請用網路搜尋找出 ${count} 篇「${topic}」相關、且**不在下列清單中**的真實論文（請盡量找近年、可查證 DOI 的）。\n\n使用者已收錄（請避開重複）：\n${exclude || '（無）'}\n\n請務必查證每篇真的存在、DOI 正確，不要捏造。只輸出 JSON 陣列：[{"title":"","authors":"第一作者 et al.","year":2024,"journal":"","doi":"","url":"","material":"WSe2","electrode":"如 Pd / vdW 金屬 / 介電 等","outline":"約150字繁體中文大綱","relevance":"與 WSe2 p-FET、Sb2O3/WOx 的相關性一句話"}]`
  const text = await callAI({ prompt, webSearch: true, maxTokens: 3000, system: '你是嚴謹的文獻搜尋助理。只回報你用網路查證過、確實存在的論文與正確 DOI，絕不捏造。輸出務必是合法 JSON。' })
  const json = extractJson<FoundPaper[]>(text)
  return Array.isArray(json) ? json.filter((p) => p && p.title) : []
}

// (helper kept for callers needing parameter labels)
export type { MaterialParameter }
