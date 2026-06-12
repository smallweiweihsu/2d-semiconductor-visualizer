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
import { normalizeImportedProject, normalizeStoredProject } from './projectValidation'
import type { DeviceStructure, SemivizProject } from '../types/semiviz'

const storageKey = 'semiviz-project-v1'

interface ProjectStoreValue {
  project: SemivizProject
  activeDevice: DeviceStructure
  addDevice: (name: string, description: string) => DeviceStructure
  setActiveDeviceId: (deviceId: string) => void
  replaceProject: (project: unknown) => { ok: boolean; error?: string }
  exportProject: () => void
}

const ProjectStoreContext = createContext<ProjectStoreValue | null>(null)

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<SemivizProject>(() => readStoredProject())
  const activeDevice = project.devices.find((device) => device.id === project.activeDeviceId) ?? project.devices[0]

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
      activeDeviceId: nextDevice.id,
      devices: [nextDevice, ...current.devices],
    }))

    return nextDevice
  }, [])

  const setActiveDeviceId = useCallback((deviceId: string) => {
    setProject((current) => {
      if (!current.devices.some((device) => device.id === deviceId)) {
        return current
      }

      return { ...current, activeDeviceId: deviceId }
    })
  }, [])

  const replaceProject = useCallback((nextProject: unknown) => {
    const result = normalizeImportedProject(nextProject)

    if (result.ok && result.project) {
      setProject(result.project)
    }

    return { ok: result.ok, error: result.error }
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
    () => ({ project, activeDevice, addDevice, setActiveDeviceId, replaceProject, exportProject }),
    [activeDevice, addDevice, exportProject, project, replaceProject, setActiveDeviceId],
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
    return normalizeStoredProject(JSON.parse(raw))
  } catch {
    return seedProject
  }
}
