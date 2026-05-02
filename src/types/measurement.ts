export type MeasurementType =
  | 'raman'
  | 'pl'
  | 'electrical_iv'
  | 'electrical_transfer'
  | 'custom'

export type MeasurementDataFormat = 'csv' | 'txt' | 'manual_paste'

export type MeasurementAxisType =
  | 'raman_shift_cm-1'
  | 'wavelength_nm'
  | 'energy_eV'
  | 'intensity_a.u.'
  | 'voltage_V'
  | 'current_A'
  | 'temperature_K'
  | 'time_s'
  | 'custom'

export type MeasurementBeforeAfterTag =
  | 'before'
  | 'after'
  | 'reference'
  | 'unknown'

export interface MeasurementMetadata {
  sampleName?: string
  conditionName?: string
  instrument?: string
  operator?: string
  date?: string
  laserWavelength_nm?: number | null
  laserPower_mW?: number | null
  integrationTime_s?: number | null
  grating?: string
  temperature_K?: number | null
  atmosphere?: string
  biasCondition?: string
  beforeAfterTag?: MeasurementBeforeAfterTag
  processCondition?: string
}

export interface MeasurementColumn {
  id: string
  originalName: string
  mappedType: MeasurementAxisType
  label_zh: string
  unit?: string
  index: number
}

export interface MeasurementRow {
  values: Record<string, number | string | null>
}

export interface MeasurementDataset {
  id: string
  name_zh: string
  measurementType: MeasurementType
  format: MeasurementDataFormat
  rawText?: string
  fileName?: string
  importedAt: string
  linkedLayerIds: string[]
  linkedProcessStepIds: string[]
  metadata: MeasurementMetadata
  columns: MeasurementColumn[]
  rows: MeasurementRow[]
  notes_zh?: string
  warnings_zh: string[]
}

export interface MeasurementSeries {
  id: string
  datasetId: string
  label_zh: string
  x: number[]
  y: number[]
  xAxisType: MeasurementAxisType
  yAxisType: MeasurementAxisType
}

export interface MeasurementImportResult {
  success: boolean
  dataset?: MeasurementDataset
  errors_zh: string[]
  warnings_zh: string[]
}

export interface MeasurementComparison {
  id: string
  name_zh: string
  measurementType: MeasurementType
  datasetIds: string[]
  linkedLayerIds: string[]
  linkedProcessStepIds: string[]
  notes_zh?: string
}

export type ProcessingOperationType =
  | 'abs_y'
  | 'invert_y'
  | 'normalize_max'
  | 'normalize_min_max'
  | 'normalize_area'
  | 'subtract_constant_baseline'
  | 'subtract_linear_baseline'
  | 'manual_peak_marker'
  | 'auto_peak_suggestion'
  | 'custom'

export interface ProcessingOperation {
  id: string
  type: ProcessingOperationType
  name_zh: string
  enabled: boolean
  parameters: Record<string, number | string | boolean | null>
  createdAt: string
  notes_zh?: string
  warnings_zh?: string[]
}

export interface ProcessedMeasurementDataset {
  id: string
  sourceDatasetId: string
  name_zh: string
  operations: ProcessingOperation[]
  rows: MeasurementRow[]
  columns: MeasurementColumn[]
  warnings_zh: string[]
  createdAt: string
  updatedAt: string
}

export interface PeakMarker {
  id: string
  datasetId: string
  processedDatasetId?: string
  xValue: number
  yValue: number
  label_zh: string
  peakType: 'manual' | 'suggested'
  assignment_zh?: string
  confidence: 'manual' | 'suggested' | 'unknown'
  notes_zh?: string
}

export interface MeasurementProcessingState {
  processedDatasets: ProcessedMeasurementDataset[]
  peakMarkers: PeakMarker[]
}
