import { useState } from 'react'
import { useLocation } from 'wouter'
import { Sparkles, X, KeyRound, Send } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { aiAsk } from '../../ai/tasks'
import { promptForAiToken } from '../../ai/client'
import { useAsync } from '../../ai/useAsync'

const ROUTE_LABELS: Record<string, string> = {
  '/': 'Dashboard',
  '/device-builder': 'Device Builder',
  '/process-flow': 'Process Flow',
  '/iv-simulator': 'I–V Simulator',
  '/band-diagram': 'Band Diagram',
  '/materials': 'Materials',
  '/references': 'References',
  '/measurements': 'Measurements',
  '/comparison-lab': 'Comparison Lab',
  '/research-notes': 'Research Notes',
}

interface ChatTurn {
  role: 'user' | 'ai'
  text: string
}

export function FloatingAI() {
  const [location] = useLocation()
  const { project, activeDevice } = useProjectStore()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const { loading, error, run } = useAsync<string>()

  function buildContext(): string {
    const main = document.querySelector('.manus-main') as HTMLElement | null
    const visible = (main?.innerText ?? '').replace(/\s+/g, ' ').trim().slice(0, 5000)
    const pageLabel = ROUTE_LABELS[location] ?? location
    return [
      `使用者目前在「${pageLabel}」頁面（${location}）。`,
      `專案概況：材料 ${project.materials.length} 種、文獻 ${project.references.length} 篇、量測 ${project.measurements.length} 筆、元件 ${project.devices.length} 個；活躍元件「${activeDevice.name}」。`,
      `目前畫面可見內容（節錄）：\n${visible}`,
    ].join('\n')
  }

  async function send() {
    const question = q.trim()
    if (!question) return
    setTurns((t) => [...t, { role: 'user', text: question }])
    setQ('')
    const answer = await run(aiAsk(question, buildContext()))
    if (answer != null) setTurns((t) => [...t, { role: 'ai', text: answer }])
  }

  if (!open) {
    return (
      <button className="floating-ai-fab" type="button" aria-label="開啟 AI 助手" onClick={() => setOpen(true)}>
        <Sparkles size={20} />
      </button>
    )
  }

  return (
    <div className="floating-ai-panel" role="dialog" aria-label="AI 助手">
      <header className="floating-ai-head">
        <span><Sparkles size={16} /> AI 助手 · 看得到本頁</span>
        <div className="floating-ai-head-actions">
          <button type="button" title="設定 AI 密碼" onClick={promptForAiToken}><KeyRound size={15} /></button>
          <button type="button" title="關閉" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>
      </header>
      <div className="floating-ai-body">
        {turns.length === 0 ? (
          <p className="floating-ai-hint">問我任何關於目前頁面、材料、文獻或量測的問題。例如「這頁的 SS 偏高可能原因？」或「幫我比較目前選的材料」。我會讀取目前畫面內容後回答。</p>
        ) : turns.map((turn, i) => (
          <div className={`floating-ai-turn ${turn.role}`} key={i}>
            <span className="floating-ai-role">{turn.role === 'user' ? '你' : 'AI'}</span>
            <p>{turn.text}</p>
          </div>
        ))}
        {loading ? <div className="floating-ai-turn ai"><span className="floating-ai-role">AI</span><p>思考中…</p></div> : null}
        {error ? <p className="floating-ai-error">{error}</p> : null}
      </div>
      <div className="floating-ai-input">
        <textarea
          rows={2}
          placeholder="輸入問題，Enter 送出 / Shift+Enter 換行"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }}
        />
        <button className="manus-button primary" type="button" disabled={loading || !q.trim()} onClick={() => void send()}><Send size={15} /></button>
      </div>
    </div>
  )
}
