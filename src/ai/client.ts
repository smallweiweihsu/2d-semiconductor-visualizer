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
      body: JSON.stringify({ prompt, system, maxTokens }),
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
