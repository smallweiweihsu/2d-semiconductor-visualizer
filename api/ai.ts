// Vercel serverless proxy for Anthropic Claude. The API key never reaches the
// browser — it is read from the ANTHROPIC_API_KEY environment variable that you
// set in the Vercel dashboard (Project → Settings → Environment Variables).
import process from 'node:process'

interface ProxyReq {
  method?: string
  body?: unknown
  headers?: Record<string, string | string[] | undefined>
}
interface ProxyRes {
  status: (code: number) => ProxyRes
  json: (data: unknown) => void
  setHeader: (key: string, value: string) => void
}

export default async function handler(req: ProxyReq, res: ProxyRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: '伺服器尚未設定 ANTHROPIC_API_KEY（請在 Vercel 環境變數加入）' })
    return
  }
  // 選用的存取密碼：若有設定 AI_ACCESS_TOKEN，前端必須在 x-ai-token 標頭帶上相同值
  const requiredToken = process.env.AI_ACCESS_TOKEN
  if (requiredToken) {
    const headerToken = req.headers?.['x-ai-token']
    const provided = Array.isArray(headerToken) ? headerToken[0] : headerToken
    if (provided !== requiredToken) {
      res.status(401).json({ error: '需要 AI 存取密碼（請在 App 點「🔑 密碼」輸入，與 Vercel 的 AI_ACCESS_TOKEN 相同）' })
      return
    }
  }
  let payload: { system?: string; prompt?: string; maxTokens?: number }
  try {
    payload = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as typeof payload
  } catch {
    res.status(400).json({ error: '無法解析請求內容' })
    return
  }
  const prompt = (payload?.prompt ?? '').toString().slice(0, 60000)
  if (!prompt.trim()) {
    res.status(400).json({ error: '缺少 prompt' })
    return
  }
  const model = process.env.AI_MODEL || 'claude-sonnet-4-6'
  const maxTokens = Math.min(Math.max(Number(payload?.maxTokens) || 1200, 64), 4096)
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: payload?.system ?? '你是二維半導體元件研究的助理，請用繁體中文、精簡且準確地回答，不要捏造數據。',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = (await upstream.json()) as { content?: Array<{ text?: string }>; error?: { message?: string } }
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message ?? 'Anthropic API 錯誤' })
      return
    }
    const text = (data.content ?? []).map((block) => block.text ?? '').join('').trim()
    res.status(200).json({ text })
  } catch (err) {
    res.status(502).json({ error: (err as Error)?.message ?? 'AI 服務連線失敗' })
  }
}
