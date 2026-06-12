import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Download, Plus, Upload, X } from 'lucide-react'
import { useProjectStore } from '../../store/projectStore'
import type { SemivizProject } from '../../types/semiviz'

export function ProjectActions() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState('New Device')
  const [description, setDescription] = useState('自訂二維半導體元件結構')
  const { addDevice, exportProject, replaceProject } = useProjectStore()

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

    const text = await file.text()
    replaceProject(JSON.parse(text) as SemivizProject)
    input.value = ''
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
        <button className="manus-button ghost" onClick={() => inputRef.current?.click()}>
          <Upload size={15} />
          匯入資料
        </button>
        <button className="manus-button ghost" onClick={exportProject}>
          <Download size={15} />
          匯出 JSON
        </button>
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
