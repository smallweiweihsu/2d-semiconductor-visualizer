import { ManusShell } from './components/semiviz/ManusShell'
import { ProjectStoreProvider } from './store/projectStore'

export function DesignSystemApp() {
  return (
    <ProjectStoreProvider>
      <ManusShell />
    </ProjectStoreProvider>
  )
}
