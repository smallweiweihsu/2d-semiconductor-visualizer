import { useState } from 'react'
import { initialDeviceStructure } from '../../data/deviceStructures'
import { workspaceTabs, type WorkspaceTabId } from '../../data/workspaceTabs'
import { BottomPanel } from './BottomPanel'
import { RightInspector } from './RightInspector'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Workspace } from './Workspace'

export function AppShell() {
  const [selectedTabId, setSelectedTabId] =
    useState<WorkspaceTabId>(getInitialTabId)
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(
    getInitialCollapsedState('leftSidebarCollapsed'),
  )
  const [isRightInspectorCollapsed, setIsRightInspectorCollapsed] = useState(
    getInitialCollapsedState('rightInspectorCollapsed'),
  )
  const [deviceStructure, setDeviceStructure] = useState(() =>
    structuredClone(initialDeviceStructure),
  )
  const selectedTab =
    workspaceTabs.find((tab) => tab.id === selectedTabId) ?? workspaceTabs[0]

  function handleSelectTab(tabId: WorkspaceTabId) {
    setSelectedTabId(tabId)
    window.history.replaceState(null, '', `#${tabId}`)
  }

  function handleToggleLeftSidebar() {
    setIsLeftSidebarCollapsed((current) => {
      const nextValue = !current
      window.localStorage.setItem('leftSidebarCollapsed', String(nextValue))
      return nextValue
    })
  }

  function handleToggleRightInspector() {
    setIsRightInspectorCollapsed((current) => {
      const nextValue = !current
      window.localStorage.setItem('rightInspectorCollapsed', String(nextValue))
      return nextValue
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,1))]" />
      <div className="relative flex min-h-screen flex-col overflow-hidden">
        <TopBar
          selectedTabId={selectedTabId}
          tabs={workspaceTabs}
          onSelectTab={handleSelectTab}
        />

        <main className={`grid min-h-0 flex-1 grid-cols-1 gap-4 px-4 py-4 ${getMainGridClass(
          isLeftSidebarCollapsed,
          isRightInspectorCollapsed,
        )}`}>
          <Sidebar
            isCollapsed={isLeftSidebarCollapsed}
            onToggleCollapsed={handleToggleLeftSidebar}
          />
          <Workspace
            deviceStructure={deviceStructure}
            onChangeDeviceStructure={setDeviceStructure}
            tab={selectedTab}
          />
          <RightInspector
            activeTabId={selectedTabId}
            isCollapsed={isRightInspectorCollapsed}
            onToggleCollapsed={handleToggleRightInspector}
          />
        </main>

        <BottomPanel />
      </div>
    </div>
  )
}

function getMainGridClass(
  isLeftSidebarCollapsed: boolean,
  isRightInspectorCollapsed: boolean,
) {
  if (isLeftSidebarCollapsed && isRightInspectorCollapsed) {
    return 'xl:grid-cols-[64px_minmax(0,1fr)_64px]'
  }

  if (isLeftSidebarCollapsed) {
    return 'xl:grid-cols-[64px_minmax(0,1fr)_320px]'
  }

  if (isRightInspectorCollapsed) {
    return 'xl:grid-cols-[280px_minmax(0,1fr)_64px]'
  }

  return 'xl:grid-cols-[280px_minmax(0,1fr)_320px]'
}

function getInitialCollapsedState(storageKey: string) {
  return window.localStorage.getItem(storageKey) === 'true'
}

function getInitialTabId(): WorkspaceTabId {
  const hashTabId = window.location.hash.replace('#', '')
  const matchingTab = workspaceTabs.find((tab) => tab.id === hashTabId)

  return matchingTab?.id ?? 'structure'
}
