import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Download, MoreHorizontal, Plus, RotateCcw, Upload, X } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import { parseProjectJson } from '../../store/projectValidation'

export function ProjectActions() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('New Device')
  const [description, setDescription] = useState('自訂二維半導體元件結構')
  const [importMessage, setImportMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { addDevice, exportProject, replaceProject, resetProject } = useProjectStore()

  function handleCreate(event: FormEvent) {
    event.preventDefault()
    addDevice(name.trim() || 'New Device', description.trim() || '自訂二維半導體元件結構')
    setIsModalOpen(false)
    setName('New Device')
    setDescription('自訂二維半導體元件結構')
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]

    if (!file) {
      return
    }

    try {
      const result = parseProjectJson(await file.text())

      if (!result.ok || !result.project) {
        setImportMessage(`匯入失敗：${result.error ?? 'project schema 不完整'}`)
        return
      }

      const replaceResult = replaceProject(result.project)
      setImportMessage(replaceResult.ok ? '匯入完成' : `匯入失敗：${replaceResult.error ?? 'project schema 不完整'}`)
    } catch {
      setImportMessage('匯入失敗：無法讀取檔案')
    } finally {
      input.value = ''
    }
  }

  function handleReset() {
    const confirmed = window.confirm('This will reset localStorage project data to the latest seed data. Export JSON first if you want to keep your data.')

    if (!confirmed) {
      return
    }

    resetProject()
    window.dispatchEvent(new CustomEvent('semiviz:reset-simulation-demo-values'))
    setImportMessage('已重設 local project')
  }

  return (
    <>
      <input
        ref={inputRef}
        aria-label="Import JSON file"
        className="sr-only"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          void handleImport(event)
        }}
      />
      <div className="manus-actions">
        {importMessage ? <span className="import-status" role="status">{importMessage}</span> : null}
        <button className="manus-button ghost" onClick={() => inputRef.current?.click()}>
          <Upload size={15} />
          匯入專案
        </button>
        <div className="manus-overflow">
          <button className="manus-button ghost icon-only" aria-label="更多動作" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            <MoreHorizontal size={16} />
          </button>
          {menuOpen ? (
            <>
              <div className="manus-overflow-scrim" role="presentation" onClick={() => setMenuOpen(false)} />
              <div className="manus-overflow-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => { exportProject(); setMenuOpen(false) }}>
                  <Download size={14} /> 匯出 JSON
                </button>
                <button type="button" role="menuitem" className="danger" onClick={() => { handleReset(); setMenuOpen(false) }}>
                  <RotateCcw size={14} /> 重設本機專案
                </button>
              </div>
            </>
          ) : null}
        </div>
        <button className="manus-button primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={15} />
          新增元件
        </button>
      </div>

      {isModalOpen ? (
        <div className="manus-modal-backdrop" role="presentation">
          <form className="manus-modal" onSubmit={handleCreate}>
            <header>
              <div>
                <h2>新增元件</h2>
                <p>建立一個會保存到 localStorage 的 device draft。</p>
              </div>
              <button aria-label="關閉新增元件" type="button" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </header>
            <label>
              元件名稱
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              描述
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <footer>
              <button className="manus-button ghost" type="button" onClick={() => setIsModalOpen(false)}>
                取消
              </button>
              <button className="manus-button primary" type="submit">
                建立並保存
              </button>
            </footer>
          </form>
        </div>
      ) : null}
    </>
  )
}
