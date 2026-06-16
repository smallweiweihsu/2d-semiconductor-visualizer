import { useState } from 'react'
import { useLocation } from 'wouter'
import { Sparkles, X, KeyRound, Send, Settings2 } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { useActiveSelection } from '../../store/activeSelection'
import { aiAsk } from '../../ai/tasks'
import { promptForAiToken, getAiModel, setAiModel, AI_MODELS } from '../../ai/client'
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
  question?: string
}

export function FloatingAI() {
  const [location] = useLocation()
  const { project, activeDevice, addHypothesis, updateReference, updateMaterial } = useProjectStore()
  const { active } = useActiveSelection()
  const [open, setOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [model, setModel] = useState(getAiModel())
  const [webSearch, setWebSearch] = useState(false)
  const [q, setQ] = useState('')
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [done, setDone] = useState<string>('')
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
    setDone('')
    setTurns((t) => [...t, { role: 'user', text: question }])
    setQ('')
    const answer = await run(aiAsk(question, buildContext(), webSearch))
    if (answer != null) setTurns((t) => [...t, { role: 'ai', text: answer, question }])
  }

  function saveAsNote(turn: ChatTurn) {
    addHypothesis(turn.question ? `AI：${turn.question}` : 'AI 筆記', turn.text)
    setDone('已存成 Research Note ✓')
  }

  function applyToSelection(turn: ChatTurn) {
    if (!active) return
    const stamp = `\n\n[AI] ${turn.text}`
    if (active.type === 'reference') {
      updateReference(active.id, (r) => ({ ...r, notes: `${r.notes ?? ''}${stamp}`.trim() }))
      setDone(`已加入文獻「${active.label}」備註 ✓`)
    } else {
      updateMaterial(active.id, (m) => ({ ...m, notes: [...m.notes, `[AI] ${turn.text}`] }))
      setDone(`已加入材料「${active.label}」註記 ✓`)
    }
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
          <button type="button" title="模型 / 設定" onClick={() => setShowSettings((v) => !v)}><Settings2 size={15} /></button>
          <button type="button" title="設定 AI 密碼" onClick={promptForAiToken}><KeyRound size={15} /></button>
          <button type="button" title="關閉" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>
      </header>
      {showSettings ? (
        <div className="floating-ai-settings">
          <label>使用模型
            <select value={model} onChange={(e) => { setModel(e.target.value); setAiModel(e.target.value) }}>
              {AI_MODELS.map((m) => <option value={m.id} key={m.id}>{m.label}</option>)}
            </select>
          </label>
          <p className="ai-sub">也可在 Vercel 設 <code>AI_MODEL</code> 當預設；此處選擇只存在你的瀏覽器。</p>
        </div>
      ) : null}
      <div className="floating-ai-body">
        {turns.length === 0 ? (
          <p className="floating-ai-hint">問我任何關於目前頁面、材料、文獻或量測的問題。回答後可「存成 Research Note」或「加入目前選取的文獻／材料」。</p>
        ) : turns.map((turn, i) => (
          <div className={`floating-ai-turn ${turn.role}`} key={i}>
            <span className="floating-ai-role">{turn.role === 'user' ? '你' : 'AI'}</span>
            <p>{turn.text}</p>
            {turn.role === 'ai' ? (
              <div className="floating-ai-apply">
                <button type="button" onClick={() => saveAsNote(turn)}>📌 存成 Research Note</button>
                {active ? <button type="button" onClick={() => applyToSelection(turn)}>＋ 加入目前{active.type === 'reference' ? '文獻' : '材料'}（{active.label}）</button> : null}
              </div>
            ) : null}
          </div>
        ))}
        {loading ? <div className="floating-ai-turn ai"><span className="floating-ai-role">AI</span><p>思考中…</p></div> : null}
        {error ? <p className="floating-ai-error">{error}</p> : null}
        {done ? <p className="floating-ai-done">{done}</p> : null}
      </div>
      <label className="floating-ai-websearch"><input type="checkbox" checked={webSearch} onChange={(e) => setWebSearch(e.target.checked)} /> 🔎 上網搜尋（找論文/最新資訊，較慢）</label>
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
