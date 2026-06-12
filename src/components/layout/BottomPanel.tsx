import { useState } from 'react'
import { PlotPlaceholder } from '../plots/PlotPlaceholder'

const storageKey = 'bottomPanelOpen'

function getInitialOpenState() {
  // 預設收合：底部圖表目前是占位內容，預設隱藏以降低頁面複雜度。
  return window.localStorage.getItem(storageKey) === 'true'
}

export function BottomPanel() {
  const [isOpen, setIsOpen] = useState(getInitialOpenState)

  function handleToggle() {
    setIsOpen((current) => {
      const nextValue = !current
      window.localStorage.setItem(storageKey, String(nextValue))
      return nextValue
    })
  }

  return (
    <section className="border-t border-slate-800/80 bg-slate-950/85 px-4 pb-4 pt-0">
      <div className="mx-auto max-w-7xl">
        <button
          aria-expanded={isOpen}
          className="mt-2 flex w-full items-center justify-between rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          onClick={handleToggle}
          type="button"
        >
          <span>底部圖表與分析面板（占位）</span>
          <span>{isOpen ? '收合' : '展開'}</span>
        </button>
        {isOpen ? (
          <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30">
            <PlotPlaceholder />
          </div>
        ) : null}
      </div>
    </section>
  )
}
