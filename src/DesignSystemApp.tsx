import { ManusShell } from './components/semiviz/ManusShell'
import { ProjectStoreProvider } from './store/projectStore'
import { UiModeProvider } from './store/uiMode'

export function DesignSystemApp() {
  return (
    <ProjectStoreProvider>
      <UiModeProvider>
        <ManusShell />
      </UiModeProvider>
    </ProjectStoreProvider>
  )
}
