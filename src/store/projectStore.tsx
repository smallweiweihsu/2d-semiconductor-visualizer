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
import { currentStorageKey, readProjectFromStorage, resetProjectStorage } from './projectMigration'
import { normalizeImportedProject } from './projectValidation'
import type { DeviceStructure, LiteratureSource, Material, SemivizProject } from '../types/semiviz'

const storageKey = currentStorageKey

interface ProjectStoreValue {
  project: SemivizProject
  activeDevice: DeviceStructure
  addDevice: (name: string, description: string) => DeviceStructure
  updateActiveDevice: (updater: (device: DeviceStructure) => DeviceStructure) => void
  updateMaterial: (materialId: string, updater: (material: Material) => Material) => void
  addReference: () => LiteratureSource
  updateReference: (referenceId: string, updater: (reference: LiteratureSource) => LiteratureSource) => void
  setActiveDeviceId: (deviceId: string) => void
  replaceProject: (project: unknown) => { ok: boolean; error?: string }
  resetProject: () => void
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
    const idSuffix = Date.now()
    const layerIdMap = new Map(source.layers.map((layer) => [layer.id, `${layer.id}-${idSuffix}`]))
    const nextDevice: DeviceStructure = {
      ...source,
      id: `device-${idSuffix}`,
      name,
      description,
      tags: ['custom', 'localStorage', 'draft'],
      createdAt: timestamp.slice(0, 10),
      updatedAt: timestamp.slice(0, 10),
      simulationConfig: {
        channelLayerId: mapLayerId(source.simulationConfig?.channelLayerId, layerIdMap),
        gateDielectricLayerId: mapLayerId(source.simulationConfig?.gateDielectricLayerId, layerIdMap),
        sourceLayerId: mapLayerId(source.simulationConfig?.sourceLayerId, layerIdMap),
        drainLayerId: mapLayerId(source.simulationConfig?.drainLayerId, layerIdMap),
        gateLayerId: mapLayerId(source.simulationConfig?.gateLayerId, layerIdMap),
      },
      layers: source.layers.map((layer) => ({ ...layer, id: layerIdMap.get(layer.id) ?? `${layer.id}-${idSuffix}` })),
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

  const updateActiveDevice = useCallback((updater: (device: DeviceStructure) => DeviceStructure) => {
    setProject((current) => {
      const deviceIndex = current.devices.findIndex((device) => device.id === current.activeDeviceId)

      if (deviceIndex < 0) {
        return current
      }

      const devices = [...current.devices]
      devices[deviceIndex] = updater(devices[deviceIndex])
      return { ...current, devices }
    })
  }, [])

  const updateMaterial = useCallback((materialId: string, updater: (material: Material) => Material) => {
    setProject((current) => ({
      ...current,
      materials: current.materials.map((material) => material.id === materialId ? updater(material) : material),
    }))
  }, [])

  const addReference = useCallback(() => {
    const nextReference: LiteratureSource = {
      id: `ref-${Date.now()}`,
      title: 'New reference',
      authors: '',
      year: new Date().getFullYear(),
      status: 'candidate',
      reliabilityScore: 5,
      notes: '',
    }

    setProject((current) => ({
      ...current,
      references: [nextReference, ...current.references],
    }))

    return nextReference
  }, [])

  const updateReference = useCallback((referenceId: string, updater: (reference: LiteratureSource) => LiteratureSource) => {
    setProject((current) => ({
      ...current,
      references: current.references.map((reference) => reference.id === referenceId ? updater(reference) : reference),
    }))
  }, [])

  const replaceProject = useCallback((nextProject: unknown) => {
    const result = normalizeImportedProject(nextProject)

    if (result.ok && result.project) {
      setProject(result.project)
    }

    return { ok: result.ok, error: result.error }
  }, [])

  const resetProject = useCallback(() => {
    setProject(resetProjectStorage(window.localStorage))
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
    () => ({
      project,
      activeDevice,
      addDevice,
      updateActiveDevice,
      updateMaterial,
      addReference,
      updateReference,
      setActiveDeviceId,
      replaceProject,
      resetProject,
      exportProject,
    }),
    [activeDevice, addDevice, addReference, exportProject, project, replaceProject, resetProject, setActiveDeviceId, updateActiveDevice, updateMaterial, updateReference],
  )

  return (
    <ProjectStoreContext.Provider value={value}>
      {children}
    </ProjectStoreContext.Provider>
  )
}

function mapLayerId(layerId: string | undefined, layerIdMap: Map<string, string>) {
  return layerId ? layerIdMap.get(layerId) : undefined
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
  return readProjectFromStorage(window.localStorage)
}
