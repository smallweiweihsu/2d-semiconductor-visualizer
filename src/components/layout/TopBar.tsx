import type { WorkspaceTab, WorkspaceTabId } from '../../data/workspaceTabs'
import { TabNavigation } from './TabNavigation'

interface TopBarProps {
  tabs: readonly WorkspaceTab[]
  selectedTabId: WorkspaceTabId
  onSelectTab: (tabId: WorkspaceTabId) => void
}

export function TopBar({ tabs, selectedTabId, onSelectTab }: TopBarProps) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/85 px-4 py-5 backdrop-blur">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
              二維半導體元件視覺化與物理沙盒
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              用於二維半導體元件設計、3D 結構視覺化與物理近似分析的研究工具
            </p>
          </div>

          <div className="w-fit rounded-full border border-cyan-800/70 bg-cyan-950/40 px-3 py-1 text-xs font-medium text-cyan-200">
            MVP 開發中
          </div>
        </div>

        <TabNavigation
          selectedTabId={selectedTabId}
          tabs={tabs}
          onSelectTab={onSelectTab}
        />
      </div>
    </header>
  )
}
