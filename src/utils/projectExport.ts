import type { DeviceStructure } from '../types/device'
import type {
  LiteratureDatabase,
} from '../types/literature'
import type {
  MeasurementComparison,
  MeasurementDataset,
  PeakMarker,
  ProcessedMeasurementDataset,
} from '../types/measurement'
import type { ProcessFlow } from '../types/process'
import type {
  ProjectImportResult,
  ProjectMetadata,
  ProjectSaveData,
} from '../types/project'

export const PROJECT_EXPORT_VERSION = '1.0.0'

export interface CreateProjectSaveDataInput {
  metadata: ProjectMetadata
  deviceStructure: DeviceStructure
  measurementComparisons?: MeasurementComparison[]
  measurementDatasets?: MeasurementDataset[]
  peakMarkers?: PeakMarker[]
  processedMeasurementDatasets?: ProcessedMeasurementDataset[]
  literatureDatabase?: LiteratureDatabase
  acknowledgedNoticeIds?: string[]
  processFlow: ProcessFlow
  appNotes_zh?: string[]
  warnings_zh?: string[]
}

export function createProjectSaveData({
  metadata,
  deviceStructure,
  measurementComparisons = [],
  measurementDatasets = [],
  peakMarkers = [],
  processedMeasurementDatasets = [],
  literatureDatabase,
  acknowledgedNoticeIds = [],
  processFlow,
  appNotes_zh = [],
  warnings_zh = [],
}: CreateProjectSaveDataInput): ProjectSaveData {
  const now = new Date().toISOString()

  return {
    version: PROJECT_EXPORT_VERSION,
    metadata: {
      ...metadata,
      updatedAt: now,
      createdAt: metadata.createdAt || now,
    },
    deviceStructure,
    measurementComparisons,
    measurementDatasets,
    peakMarkers,
    processedMeasurementDatasets,
    literatureDatabase,
    acknowledgedNoticeIds,
    processFlow,
    appNotes_zh,
    warnings_zh: [
      ...warnings_zh,
      '目前擴散、氧化與電性模組的即時情境狀態尚未納入跨模組專案匯出，後續批次將強化狀態保存。',
    ],
  }
}

export function serializeProjectToJson(projectData: ProjectSaveData) {
  return JSON.stringify(projectData, null, 2)
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string,
) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function createTimestampedFilename(prefix: string, extension: string) {
  const timestamp = new Date()
    .toISOString()
    .slice(0, 16)
    .replace('T', '-')
    .replace(':', '')

  return `${prefix}-${timestamp}.${extension}`
}

export function validateProjectSaveData(data: unknown): ProjectImportResult {
  const errors_zh: string[] = []
  const warnings_zh: string[] = []
  const candidate = data as Partial<ProjectSaveData>

  if (!candidate || typeof candidate !== 'object') {
    return {
      success: false,
      errors_zh: ['JSON 內容不是有效的專案物件。'],
      warnings_zh: [],
    }
  }

  if (!candidate.version) {
    errors_zh.push('缺少版本欄位。')
  }

  if (!candidate.metadata) {
    errors_zh.push('缺少專案 metadata。')
  }

  if (!candidate.deviceStructure) {
    errors_zh.push('缺少元件結構資料。')
  }

  if (!candidate.processFlow) {
    errors_zh.push('缺少製程流程資料。')
  }

  if (!Array.isArray(candidate.deviceStructure?.layers)) {
    errors_zh.push('元件結構缺少 layers 陣列。')
  }

  if (!Array.isArray(candidate.processFlow?.steps)) {
    errors_zh.push('製程流程缺少 steps 陣列。')
  }

  if (candidate.version && candidate.version !== PROJECT_EXPORT_VERSION) {
    warnings_zh.push(
      `匯入版本為 ${candidate.version}，目前支援版本為 ${PROJECT_EXPORT_VERSION}；將嘗試讀取相容欄位。`,
    )
  }

  if (
    candidate.diffusionScenario ||
    candidate.oxidationScenario ||
    candidate.electricalScenario
  ) {
    warnings_zh.push('部分模組狀態目前尚未自動還原，已保留在匯入資料中。')
  }

  if (
    candidate.measurementDatasets &&
    !Array.isArray(candidate.measurementDatasets)
  ) {
    errors_zh.push('量測資料欄位格式不正確。')
  }

  if (
    candidate.measurementComparisons &&
    !Array.isArray(candidate.measurementComparisons)
  ) {
    errors_zh.push('量測比較欄位格式不正確。')
  }

  if (
    candidate.processedMeasurementDatasets &&
    !Array.isArray(candidate.processedMeasurementDatasets)
  ) {
    errors_zh.push('處理後量測資料欄位格式不正確。')
  }

  if (candidate.peakMarkers && !Array.isArray(candidate.peakMarkers)) {
    errors_zh.push('Peak 標記欄位格式不正確。')
  }

  if (
    candidate.literatureDatabase &&
    (!Array.isArray(candidate.literatureDatabase.sources) ||
      !Array.isArray(candidate.literatureDatabase.evidence) ||
      !Array.isArray(candidate.literatureDatabase.conflictGroups) ||
      (candidate.literatureDatabase.recommendations !== undefined &&
        !Array.isArray(candidate.literatureDatabase.recommendations)) ||
      (candidate.literatureDatabase.todos !== undefined &&
        !Array.isArray(candidate.literatureDatabase.todos)))
  ) {
    errors_zh.push('文獻資料庫欄位格式不正確。')
  }

  return {
    success: errors_zh.length === 0,
    data: errors_zh.length === 0 ? (candidate as ProjectSaveData) : undefined,
    errors_zh,
    warnings_zh,
  }
}

export function parseProjectJson(jsonText: string): ProjectImportResult {
  try {
    const data = JSON.parse(jsonText) as unknown

    return validateProjectSaveData(data)
  } catch {
    return {
      success: false,
      errors_zh: ['JSON 格式無法解析，請確認檔案內容。'],
      warnings_zh: [],
    }
  }
}

export function createDefaultProjectMetadata(): ProjectMetadata {
  const now = new Date().toISOString()

  return {
    projectName_zh: '二維半導體元件模擬專案',
    sampleName: '',
    researcher: '',
    institution: '',
    createdAt: now,
    updatedAt: now,
    notes_zh: '',
    tags_zh: [],
  }
}
