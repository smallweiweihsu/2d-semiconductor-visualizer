import type { DeviceStructure } from './device'
import type { DiffusionResult, DiffusionScenario } from './diffusion'
import type { ElectricalResult, ElectricalScenario } from './electrical'
import type {
  MeasurementComparison,
  MeasurementDataset,
  PeakMarker,
  ProcessedMeasurementDataset,
} from './measurement'
import type { OxidationResult, OxidationScenario } from './oxidation'
import type { ProcessFlow } from './process'

export type ProjectExportVersion = string

export interface ProjectMetadata {
  projectName_zh: string
  sampleName?: string
  researcher?: string
  institution?: string
  createdAt: string
  updatedAt: string
  notes_zh?: string
  tags_zh?: string[]
}

export interface ProjectSaveData {
  version: ProjectExportVersion
  metadata: ProjectMetadata
  deviceStructure: DeviceStructure
  processFlow: ProcessFlow
  diffusionScenario?: DiffusionScenario
  diffusionResult?: DiffusionResult
  oxidationScenario?: OxidationScenario
  oxidationResult?: OxidationResult
  electricalScenario?: ElectricalScenario
  electricalResult?: ElectricalResult
  measurementDatasets?: MeasurementDataset[]
  measurementComparisons?: MeasurementComparison[]
  processedMeasurementDatasets?: ProcessedMeasurementDataset[]
  peakMarkers?: PeakMarker[]
  appNotes_zh?: string[]
  warnings_zh?: string[]
}

export interface ProjectImportResult {
  success: boolean
  data?: ProjectSaveData
  errors_zh: string[]
  warnings_zh: string[]
}

export type ExportFormat = 'json' | 'markdown' | 'experiment_summary'
