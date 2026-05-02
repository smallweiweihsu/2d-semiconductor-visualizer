import { useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { parameterConflictGroups } from '../../data/parameterConflictGroups'
import { parameterEvidence } from '../../data/parameterEvidence'
import { literatureSources } from '../../data/literatureSources'
import type { DeviceStructure } from '../../types/device'
import type {
  MeasurementComparison,
  MeasurementDataset,
  PeakMarker,
  ProcessedMeasurementDataset,
} from '../../types/measurement'
import type { ProcessFlow } from '../../types/process'
import type { ProjectMetadata } from '../../types/project'
import {
  createDefaultProjectMetadata,
  createProjectSaveData,
} from '../../utils/projectExport'
import {
  generateExperimentSummary,
  generateMarkdownReport,
} from '../../utils/markdownReport'
import { ExportActions } from './ExportActions'
import { ExportWarnings } from './ExportWarnings'
import { ImportProjectPanel } from './ImportProjectPanel'
import { ProjectMetadataEditor } from './ProjectMetadataEditor'
import { ReportPreview } from './ReportPreview'

interface ProjectExportWorkspaceProps {
  deviceStructure: DeviceStructure
  measurementComparisons: MeasurementComparison[]
  measurementDatasets: MeasurementDataset[]
  peakMarkers: PeakMarker[]
  processedMeasurementDatasets: ProcessedMeasurementDataset[]
  onChangeDeviceStructure: Dispatch<SetStateAction<DeviceStructure>>
  onChangeMeasurementComparisons: Dispatch<
    SetStateAction<MeasurementComparison[]>
  >
  onChangeMeasurementDatasets: Dispatch<SetStateAction<MeasurementDataset[]>>
  onChangePeakMarkers: Dispatch<SetStateAction<PeakMarker[]>>
  onChangeProcessedMeasurementDatasets: Dispatch<
    SetStateAction<ProcessedMeasurementDataset[]>
  >
  processFlow: ProcessFlow
  onChangeProcessFlow: Dispatch<SetStateAction<ProcessFlow>>
}

export function ProjectExportWorkspace({
  deviceStructure,
  measurementComparisons,
  measurementDatasets,
  peakMarkers,
  processedMeasurementDatasets,
  onChangeDeviceStructure,
  onChangeMeasurementComparisons,
  onChangeMeasurementDatasets,
  onChangePeakMarkers,
  onChangeProcessFlow,
  onChangeProcessedMeasurementDatasets,
  processFlow,
}: ProjectExportWorkspaceProps) {
  const [metadata, setMetadata] = useState<ProjectMetadata>(() =>
    createDefaultProjectMetadata(),
  )
  const [previewMode, setPreviewMode] = useState<'report' | 'summary'>('report')
  const [statusMessage, setStatusMessage] = useState('尚未執行匯出。')

  const projectData = useMemo(
    () =>
      createProjectSaveData({
        metadata,
        deviceStructure,
        measurementComparisons,
        measurementDatasets,
        peakMarkers,
        processedMeasurementDatasets,
        literatureDatabase: {
          sources: literatureSources,
          evidence: parameterEvidence,
          conflictGroups: parameterConflictGroups,
        },
        processFlow,
        appNotes_zh: [
          'Batch 10 目前支援本機 JSON 匯出 / 匯入與 Markdown 報告產生。',
        ],
      }),
    [
      deviceStructure,
      measurementComparisons,
      measurementDatasets,
      metadata,
      peakMarkers,
      processFlow,
      processedMeasurementDatasets,
    ],
  )

  const previewContent =
    previewMode === 'report'
      ? generateMarkdownReport(projectData)
      : generateExperimentSummary(projectData)

  function refreshPreview(mode: 'report' | 'summary' = previewMode) {
    setPreviewMode(mode)
    setStatusMessage(
      mode === 'report' ? '完整報告預覽已更新。' : '實驗摘要預覽已更新。',
    )
  }

  return (
    <section className="flex min-h-[calc(100vh-12rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">結果與匯出</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            儲存目前元件設計、製程流程與模型設定，並匯出 JSON 或 Markdown
            報告，方便後續比較不同樣品或製程條件。
          </p>
        </div>

        <div className="rounded-md border border-cyan-800/60 bg-cyan-950/25 px-3 py-2 text-xs text-cyan-100">
          本機匯出 / 匯入
        </div>
      </header>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/85">
        本報告由二維半導體元件視覺化與物理沙盒自動產生。所有擴散、氧化與電性結果皆為簡化模型或定性 /
        半定量輔助判讀，不代表 TCAD、DFT、MD、NEGF 或完整製程模擬。未經文獻與實驗校準的參數不可視為定量結論。
      </aside>

      <div className="grid min-h-0 flex-1 gap-4 2xl:grid-cols-[minmax(360px,0.85fr)_minmax(520px,1.15fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <ProjectMetadataEditor
            metadata={metadata}
            onChangeMetadata={setMetadata}
          />
          <ExportActions
            projectData={projectData}
            onRefreshPreview={refreshPreview}
            onStatus={setStatusMessage}
          />
          <ImportProjectPanel
            onImportProject={(result) => {
              if (!result.data) {
                return
              }

              onChangeDeviceStructure(result.data.deviceStructure)
              onChangeProcessFlow(result.data.processFlow)
              onChangeMeasurementDatasets(result.data.measurementDatasets ?? [])
              onChangeMeasurementComparisons(
                result.data.measurementComparisons ?? [],
              )
              onChangeProcessedMeasurementDatasets(
                result.data.processedMeasurementDatasets ?? [],
              )
              onChangePeakMarkers(result.data.peakMarkers ?? [])
              setMetadata(result.data.metadata)
              setStatusMessage(
                [
                  '專案已匯入：元件結構、製程流程與 metadata 已更新。',
                  ...result.warnings_zh,
                ].join(' '),
              )
            }}
          />
          <ExportWarnings />

          <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-4 text-sm text-slate-300">
            <span className="font-medium text-slate-100">狀態：</span>
            {statusMessage}
          </div>
        </div>

        <ReportPreview
          content={previewContent}
          mode={previewMode}
          onChangeMode={(mode) => refreshPreview(mode)}
          onRefresh={() => refreshPreview()}
        />
      </div>
    </section>
  )
}
