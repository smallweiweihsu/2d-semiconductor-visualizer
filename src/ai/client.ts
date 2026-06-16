// Thin client for the /api/ai serverless proxy (Anthropic Claude).
export interface AiCallOptions {
  prompt: string
  system?: string
  maxTokens?: number
}

const TOKEN_KEY = 'ai_access_token'

export function getAiToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setAiToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export const AI_MODELS: Array<{ id: string; label: string }> = [
  { id: '', label: '預設（伺服器設定）' },
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8（最強，較慢/較貴）' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6（均衡）' },
  { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5（均衡，穩定）' },
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5（最快/最便宜）' },
]

const MODEL_KEY = 'ai_model'

export function getAiModel(): string {
  try {
    return localStorage.getItem(MODEL_KEY) ?? ''
  } catch {
    return ''
  }
}

export function setAiModel(model: string): void {
  try {
    if (model) localStorage.setItem(MODEL_KEY, model)
    else localStorage.removeItem(MODEL_KEY)
  } catch {
    /* ignore */
  }
}

export function promptForAiToken(): void {
  const current = getAiToken()
  const next = window.prompt('輸入 AI 存取密碼（與 Vercel 的 AI_ACCESS_TOKEN 相同）', current)
  if (next != null) setAiToken(next.trim())
}

export async function callAI({ prompt, system, maxTokens }: AiCallOptions): Promise<string> {
  let res: Response
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-ai-token': getAiToken() },
      body: JSON.stringify({ prompt, system, maxTokens, model: getAiModel() || undefined }),
    })
  } catch {
    throw new Error('無法連線 AI 服務（請確認已部署 /api 並設定金鑰）')
  }
  let data: { text?: string; error?: string } = {}
  try {
    data = (await res.json()) as typeof data
  } catch {
    throw new Error('AI 回應格式錯誤')
  }
  if (!res.ok) throw new Error(data.error ?? `AI 呼叫失敗（${res.status}）`)
  return (data.text ?? '').trim()
}

// Try to pull a JSON object/array out of a model reply that may be wrapped in prose or fences.
export function extractJson<T = unknown>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.search(/[[{]/)
  if (start === -1) return null
  for (let end = candidate.length; end > start; end--) {
    const slice = candidate.slice(start, end)
    try {
      return JSON.parse(slice) as T
    } catch {
      /* keep shrinking */
    }
  }
  return null
}
