import { ManusShell } from './components/semiviz/ManusShell'
import { ProjectStoreProvider } from './store/projectStore'
import { UiModeProvider } from './store/uiMode'
import { ActiveSelectionProvider } from './store/activeSelection'

export function DesignSystemApp() {
  return (
    <ProjectStoreProvider>
      <UiModeProvider>
        <ActiveSelectionProvider>
          <ManusShell />
        </ActiveSelectionProvider>
      </UiModeProvider>
    </ProjectStoreProvider>
  )
}
