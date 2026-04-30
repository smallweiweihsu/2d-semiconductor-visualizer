import type { WorkspaceTab, WorkspaceTabId } from '../../data/workspaceTabs'

interface TabNavigationProps {
  tabs: readonly WorkspaceTab[]
  selectedTabId: WorkspaceTabId
  onSelectTab: (tabId: WorkspaceTabId) => void
}

export function TabNavigation({
  tabs,
  selectedTabId,
  onSelectTab,
}: TabNavigationProps) {
  return (
    <nav className="mt-5 border-t border-slate-800/80 pt-3">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {tabs.map((tab) => {
          const isSelected = tab.id === selectedTabId

          return (
            <button
              aria-selected={isSelected}
              className={`whitespace-nowrap rounded-md border px-3 py-2 text-sm transition ${
                isSelected
                  ? 'border-cyan-700 bg-cyan-950/45 text-cyan-100 shadow-lg shadow-cyan-950/30'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
