import { useState } from 'react'
import { workspaceTabs, type WorkspaceTabId } from '../../data/workspaceTabs'
import { BottomPanel } from './BottomPanel'
import { RightInspector } from './RightInspector'
import { Sidebar } from './Sidebar'
import { TabNavigation } from './TabNavigation'
import { TopBar } from './TopBar'
import { Workspace } from './Workspace'

export function AppShell() {
  const [selectedTabId, setSelectedTabId] =
    useState<WorkspaceTabId>(getInitialTabId)
  const selectedTab =
    workspaceTabs.find((tab) => tab.id === selectedTabId) ?? workspaceTabs[0]

  function handleSelectTab(tabId: WorkspaceTabId) {
    setSelectedTabId(tabId)
    window.history.replaceState(null, '', `#${tabId}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,1))]" />
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <TopBar />
        <TabNavigation
          selectedTabId={selectedTabId}
          tabs={workspaceTabs}
          onSelectTab={handleSelectTab}
        />

        <main className="grid flex-1 grid-cols-1 gap-4 px-4 py-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <Sidebar />
          <Workspace tab={selectedTab} />
          <RightInspector />
        </main>

        <BottomPanel />
      </div>
    </div>
  )
}

function getInitialTabId(): WorkspaceTabId {
  const hashTabId = window.location.hash.replace('#', '')
  const matchingTab = workspaceTabs.find((tab) => tab.id === hashTabId)

  return matchingTab?.id ?? 'structure'
}
