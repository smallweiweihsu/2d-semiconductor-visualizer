import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedProject } from '../data/seedProject'
import type { DeviceStructure, SemivizProject } from '../types/semiviz'

const storageKey = 'semiviz-project-v1'

interface ProjectStoreValue {
  project: SemivizProject
  addDevice: (name: string, description: string) => DeviceStructure
  replaceProject: (project: SemivizProject) => void
  exportProject: () => void
}

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null)

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<SemivizProject>(() => readStoredProject())

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(project))
  }, [project])

  const addDevice = useCallback((name: string, description: string) => {
    const source = seedProject.devices[0]
    const timestamp = new Date().toISOString()
    const nextDevice: DeviceStructure = {
      ...source,
      id: `device-${Date.now()}`,
      name,
      description,
      tags: ['custom', 'localStorage', 'draft'],
      createdAt: timestamp.slice(0, 10),
      updatedAt: timestamp.slice(0, 10),
      layers: source.layers.map((layer) => ({ ...layer, id: `${layer.id}-${Date.now()}` })),
    }

    setProject((current) => ({
      ...current,
      devices: [nextDevice, ...current.devices],
    }))

    return nextDevice
  }, [])

  const replaceProject = useCallback((nextProject: SemivizProject) => {
    setProject(normalizeProject(nextProject))
  }, [])

  const exportProject = useCallback(() => {
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `2d-semi-visualizer-${new Date().toISOString().slice(0, 10)}.json`
    document.body.append(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }, [project])

  const value = useMemo(
    () => ({ project, addDevice, replaceProject, exportProject }),
    [addDevice, exportProject, project, replaceProject],
  )

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProjectStore() {
  const context = useContext(ProjectStoreContext)

  if (!context) {
    throw new Error('useProjectStore must be used within ProjectStoreProvider')
  }

  return context
}

function readStoredProject() {
  const raw = window.localStorage.getItem(storageKey)

  if (!raw) {
    return seedProject
  }

  try {
    return normalizeProject(JSON.parse(raw) as Partial<SemivizProject>)
  } catch {
    return seedProject
  }
}

function normalizeProject(project: Partial<SemivizProject>): SemivizProject {
  return {
    devices: project.devices?.length ? project.devices : seedProject.devices,
    materials: project.materials?.length ? project.materials : seedProject.materials,
    processes: project.processes?.length ? project.processes : seedProject.processes,
    measurements: project.measurements?.length
      ? project.measurements
      : seedProject.measurements,
    references: project.references?.length ? project.references : seedProject.references,
    hypotheses: project.hypotheses?.length ? project.hypotheses : seedProject.hypotheses,
  }
}
