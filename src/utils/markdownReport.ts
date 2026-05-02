import { deviceRoleLabels } from '../data/deviceRoles'
import { materials } from '../data/materials'
import { processStepTypeLabels } from '../data/processStepTypes'
import type { DeviceLayer } from '../types/device'
import type { Material } from '../types/material'
import type { MeasurementComparison, MeasurementDataset } from '../types/measurement'
import type { ProcessStep } from '../types/process'
import type { ProjectSaveData } from '../types/project'

const scientificLimitations =
  '本報告由二維半導體元件視覺化與物理沙盒自動產生。所有擴散、氧化與電性結果皆為簡化模型或定性 / 半定量輔助判讀，不代表 TCAD、DFT、MD、NEGF 或完整製程模擬。未經文獻與實驗校準的參數不可視為定量結論。'

export function generateMarkdownReport(projectData: ProjectSaveData) {
  return [
    '# 二維半導體元件模擬報告',
    '',
    '## 1. 專案資訊',
    metadataSection(projectData),
    '',
    '## 2. 科學限制聲明',
    scientificLimitations,
    '',
    '- 缺少參數或未知參數會限制模型可靠度。',
    '- 估計值只能作為趨勢參考，不能視為最終定量結論。',
    '- 接觸電阻、擴散係數、氧化速率、介電常數與崩潰電場需要手動校準。',
    '- 本報告不是實驗量測、論文結果或儀器分析的替代品。',
    '',
    '## 3. 元件結構',
    deviceStructureSection(projectData),
    '',
    '## 4. 材料堆疊摘要',
    materialSummarySection(projectData),
    '',
    '## 5. 製程流程',
    processFlowSection(projectData),
    '',
    '## 6. 擴散 / 退火估算',
    diffusionSection(projectData),
    '',
    '## 7. 氧化 / Raman 解釋',
    oxidationSection(projectData),
    '',
    '## 8. 電性 I-V / Id-Vg 近似',
    electricalSection(projectData),
    '',
    '## 9. 量測資料摘要',
    measurementSection(projectData),
    '',
    '## 10. 量測比較',
    measurementComparisonSection(projectData),
    '',
    '## 11. 量測資料處理摘要',
    measurementProcessingSection(projectData),
    '',
    '## 12. 主要警告與缺少參數',
    warningSection(projectData),
    '',
    '## 13. 後續建議',
    nextStepSection(),
    '',
  ].join('\n')
}

export function generateExperimentSummary(projectData: ProjectSaveData) {
  return [
    '# 實驗摘要',
    '',
    `- 專案：${fallback(projectData.metadata.projectName_zh)}`,
    `- 樣品：${fallback(projectData.metadata.sampleName)}`,
    `- 研究者：${fallback(projectData.metadata.researcher)}`,
    `- 更新時間：${formatDate(projectData.metadata.updatedAt)}`,
    '',
    '## 元件結構摘要',
    `- 元件名稱：${projectData.deviceStructure.name}`,
    `- 材料層數：${projectData.deviceStructure.layers.length}`,
    `- 使用材料：${uniqueMaterials(projectData).map((material) => material.displayName).join('、') || '尚未設定'}`,
    '',
    '## 製程步驟',
    ...projectData.processFlow.steps.map(
      (step, index) => `${index + 1}. ${step.name_zh}（${step.enabled ? '啟用' : '停用'}）`,
    ),
    '',
    '## 關鍵風險',
    '- 擴散、氧化與電性結果皆為簡化模型或定性 / 半定量判讀。',
    '- 需補齊 D0 / Ea、氧化速率、介電常數、崩潰電場、接觸電阻與遷移率等校準參數。',
    '- 建議搭配 Raman mapping、低功率 Raman、AFM、XPS、PL 與電性量測交叉驗證。',
    `- 量測資料集：${projectData.measurementDatasets?.length ?? 0} 個。`,
    '',
    '## 下一步量測建議',
    nextStepSection(),
    '',
  ].join('\n')
}

function metadataSection(projectData: ProjectSaveData) {
  const { metadata } = projectData

  return [
    `- 專案名稱：${fallback(metadata.projectName_zh)}`,
    `- 樣品名稱：${fallback(metadata.sampleName)}`,
    `- 研究者：${fallback(metadata.researcher)}`,
    `- 單位 / 實驗室：${fallback(metadata.institution)}`,
    `- 建立時間：${formatDate(metadata.createdAt)}`,
    `- 更新時間：${formatDate(metadata.updatedAt)}`,
    `- 標籤：${metadata.tags_zh?.join('、') || '無'}`,
    `- 備註：${fallback(metadata.notes_zh)}`,
  ].join('\n')
}

function deviceStructureSection(projectData: ProjectSaveData) {
  const { deviceStructure } = projectData

  return [
    `- 元件名稱：${deviceStructure.name}`,
    `- 描述：${fallback(deviceStructure.description_zh)}`,
    '',
    '| 順序 | 材料層 | 材料 | 角色 | 長度 | 寬度 | 厚度 | 位置 | 偏壓 | 備註 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...deviceStructure.layers.map((layer, index) => layerRow(layer, index)),
  ].join('\n')
}

function layerRow(layer: DeviceLayer, index: number) {
  const material = getMaterial(layer.materialId)

  return [
    index + 1,
    escapeCell(layer.name),
    escapeCell(material?.displayName ?? layer.materialId),
    escapeCell(deviceRoleLabels[layer.role]),
    `${layer.geometry.length_um} µm`,
    `${layer.geometry.width_um} µm`,
    `${layer.geometry.thickness_nm} nm`,
    `x=${layer.geometry.x_um} µm, y=${layer.geometry.y_um} µm`,
    escapeCell(layer.voltageLabel || layer.voltageMode),
    escapeCell(layer.notes_zh || ''),
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
}

function materialSummarySection(projectData: ProjectSaveData) {
  const unique = uniqueMaterials(projectData)
  const missingNotes = unique.flatMap((material) =>
    Object.entries(material.parameters)
      .filter(([, parameter]) => parameter.confidence === 'unknown')
      .slice(0, 4)
      .map(([key]) => `${material.displayName}: ${key} 需要文獻參數`),
  )

  return [
    `- 使用材料數：${unique.length}`,
    `- 使用材料：${unique.map((material) => material.displayName).join('、') || '尚未設定'}`,
    '',
    '### 缺少參數提醒',
    ...(missingNotes.length > 0 ? missingNotes.map((note) => `- ${note}`) : ['- 目前沒有整理到缺少參數。']),
  ].join('\n')
}

function processFlowSection(projectData: ProjectSaveData) {
  return [
    `- 流程名稱：${projectData.processFlow.name_zh}`,
    `- 描述：${fallback(projectData.processFlow.description_zh)}`,
    '',
    '| 順序 | 步驟 | 類型 | 啟用 | 關聯材料層 | 主要參數 | 警告 | 備註 |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |',
    ...projectData.processFlow.steps.map((step, index) =>
      processRow(step, index, projectData),
    ),
  ].join('\n')
}

function processRow(step: ProcessStep, index: number, projectData: ProjectSaveData) {
  const linkedLayers = (step.linkedLayerIds ?? [])
    .map((layerId) => projectData.deviceStructure.layers.find((layer) => layer.id === layerId)?.name)
    .filter(Boolean)
    .join('、')
  const parameters = step.parameters
    .filter((parameter) => parameter.value !== null && parameter.value !== '')
    .slice(0, 5)
    .map((parameter) => `${parameter.label_zh}=${String(parameter.value)}${parameter.unit ?? ''}`)
    .join('; ')

  return [
    index + 1,
    escapeCell(step.name_zh),
    escapeCell(processStepTypeLabels[step.type] ?? step.type),
    step.enabled ? '是' : '否',
    escapeCell(linkedLayers || '無'),
    escapeCell(parameters || '尚未填寫'),
    escapeCell(step.warnings_zh.join('; ')),
    escapeCell(step.notes_zh || ''),
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
}

function diffusionSection(projectData: ProjectSaveData) {
  if (!projectData.diffusionScenario || !projectData.diffusionResult) {
    return '目前此模組的即時狀態尚未納入專案匯出，後續批次將強化跨模組狀態保存。'
  }

  const { diffusionScenario: scenario, diffusionResult: result } = projectData

  return [
    `- 情境：${scenario.name_zh}`,
    `- 擴散物種：${scenario.diffusingSpecies}`,
    `- 主材料（host）：${scenario.hostMaterialId}`,
    `- 目標層：${scenario.targetLayerId ?? '尚未選擇'}`,
    `- 溫度：${scenario.temperature_C ?? '未知'} °C`,
    `- 時間：${scenario.time_s ?? '未知'} s`,
    `- D0：${scenario.D0_m2s ?? '需要文獻參數'} m²/s`,
    `- Ea：${scenario.Ea_eV ?? '需要文獻參數'} eV`,
    `- D(T)：${result.D_m2s ?? '無法計算'} m²/s`,
    `- 有效 D：${result.effectiveD_m2s ?? '無法計算'} m²/s`,
    `- 擴散長度：${result.diffusionLength_nm ?? '無法計算'} nm`,
    `- 受影響深度：${result.affectedDepth_nm ?? '無法計算'} nm`,
    ...result.warnings_zh.map((warning) => `- ${warning}`),
  ].join('\n')
}

function oxidationSection(projectData: ProjectSaveData) {
  if (!projectData.oxidationScenario || !projectData.oxidationResult) {
    return '目前此模組的即時狀態尚未納入專案匯出，後續批次將強化跨模組狀態保存。'
  }

  const { oxidationScenario: scenario, oxidationResult: result } = projectData

  return [
    `- 情境：${scenario.name_zh}`,
    `- 目標材料：${scenario.targetMaterialId}`,
    `- 產物材料：${scenario.productMaterialId ?? '尚未選擇'}`,
    `- 方法：${scenario.method}`,
    `- 時間：${scenario.processTime_s ?? '未知'} s`,
    `- 氧化速率：${scenario.oxidationRate_nm_per_s ?? '需要校準'} nm/s`,
    `- 估計氧化厚度：${result.estimatedOxidizedThickness_nm ?? '無法計算'} nm`,
    `- 剩餘厚度：${result.estimatedRemainingThickness_nm ?? '無法計算'} nm`,
    `- Raman 可見性：${result.ramanVisibility}`,
    '### Raman 解釋排序',
    ...result.explanations_zh.map((item, index) => `${index + 1}. ${item}`),
    '### 警告',
    ...result.warnings_zh.map((warning) => `- ${warning}`),
  ].join('\n')
}

function electricalSection(projectData: ProjectSaveData) {
  if (!projectData.electricalScenario || !projectData.electricalResult) {
    return '目前此模組的即時狀態尚未納入專案匯出，後續批次將強化跨模組狀態保存。'
  }

  const { electricalScenario: scenario, electricalResult: result } = projectData

  return [
    `- 情境：${scenario.name_zh}`,
    `- 通道層：${scenario.channelLayerId ?? '尚未選擇'}`,
    `- 閘極層：${scenario.gateLayerId ?? '尚未選擇'}`,
    `- 介電層：${scenario.gateDielectricLayerId ?? '尚未選擇'}`,
    `- 接觸模型：${scenario.contactModel}`,
    `- Cox：${result.Cox_F_per_m2 ?? '無法計算'} F/m²`,
    `- 載子密度：${result.carrierDensity_cm2 ?? '無法計算'} cm⁻²`,
    `- 通道電阻：${result.channelResistance_ohm ?? '無法計算'} Ω`,
    `- 總電阻：${result.totalResistance_ohm ?? '無法計算'} Ω`,
    '### 警告',
    ...result.warnings_zh.map((warning) => `- ${warning}`),
  ].join('\n')
}

function warningSection(projectData: ProjectSaveData) {
  const warnings = [
    ...(projectData.warnings_zh ?? []),
    ...projectData.deviceStructure.layers.flatMap((layer) => layer.warnings_zh ?? []),
    ...projectData.processFlow.steps.flatMap((step) => step.warnings_zh),
    ...(projectData.measurementDatasets ?? []).flatMap(
      (dataset) => dataset.warnings_zh,
    ),
    ...(projectData.processedMeasurementDatasets ?? []).flatMap(
      (dataset) => dataset.warnings_zh,
    ),
  ]

  return [...new Set(warnings)].map((warning) => `- ${warning}`).join('\n')
}

function measurementSection(projectData: ProjectSaveData) {
  const datasets = projectData.measurementDatasets ?? []

  if (datasets.length === 0) {
    return '目前尚未匯入量測資料。'
  }

  return [
    '完整量測資料已包含於 JSON 匯出中；Markdown 報告只列摘要，避免產生過大的文字檔。',
    '',
    '| 資料集 | 類型 | 樣品 / 條件 | 資料列 | 關聯材料層 | 關聯製程步驟 | 警告 |',
    '| --- | --- | --- | --- | --- | --- | --- |',
    ...datasets.map((dataset) => measurementRow(dataset, projectData)),
  ].join('\n')
}

function measurementRow(dataset: MeasurementDataset, projectData: ProjectSaveData) {
  const layerNames = dataset.linkedLayerIds
    .map((layerId) => projectData.deviceStructure.layers.find((layer) => layer.id === layerId)?.name)
    .filter(Boolean)
    .join('、')
  const stepNames = dataset.linkedProcessStepIds
    .map((stepId) => projectData.processFlow.steps.find((step) => step.id === stepId)?.name_zh)
    .filter(Boolean)
    .join('、')

  return [
    escapeCell(dataset.name_zh),
    escapeCell(formatMeasurementTypeForReport(dataset.measurementType)),
    escapeCell(
      [dataset.metadata.sampleName, dataset.metadata.conditionName]
        .filter(Boolean)
        .join(' / ') || '未填寫',
    ),
    dataset.rows.length,
    escapeCell(layerNames || '無'),
    escapeCell(stepNames || '無'),
    dataset.warnings_zh.length,
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
}

function measurementComparisonSection(projectData: ProjectSaveData) {
  const comparisons = projectData.measurementComparisons ?? []
  const datasets = projectData.measurementDatasets ?? []

  if (comparisons.length === 0) {
    return '目前尚未建立量測比較。'
  }

  return comparisons
    .map((comparison) => measurementComparisonText(comparison, datasets))
    .join('\n\n')
}

function measurementProcessingSection(projectData: ProjectSaveData) {
  const processed = projectData.processedMeasurementDatasets ?? []
  const markers = projectData.peakMarkers ?? []

  if (processed.length === 0 && markers.length === 0) {
    return '目前尚未建立處理後量測資料或 peak 標記。'
  }

  return [
    '完整原始與處理後資料已包含於 JSON 匯出中；Markdown 報告只列處理摘要。',
    '',
    '### 處理後資料集',
    processed.length > 0
      ? [
          '| 處理後資料 | Source dataset | 處理步驟 | 警告 |',
          '| --- | --- | --- | --- |',
          ...processed.map((dataset) =>
            processedMeasurementRow(dataset, projectData),
          ),
        ].join('\n')
      : '目前沒有處理後資料集。',
    '',
    '### Peak 標記',
    markers.length > 0
      ? [
          '| Dataset | x value | label | assignment | 類型 |',
          '| --- | --- | --- | --- | --- |',
          ...markers.map((marker) => peakMarkerRow(marker, projectData)),
        ].join('\n')
      : '目前沒有 peak 標記。',
  ].join('\n')
}

function processedMeasurementRow(
  dataset: NonNullable<ProjectSaveData['processedMeasurementDatasets']>[number],
  projectData: ProjectSaveData,
) {
  const source = projectData.measurementDatasets?.find(
    (item) => item.id === dataset.sourceDatasetId,
  )

  return [
    escapeCell(dataset.name_zh),
    escapeCell(source?.name_zh ?? dataset.sourceDatasetId),
    escapeCell(dataset.operations.map((operation) => operation.name_zh).join(' → ') || '無'),
    dataset.warnings_zh.length,
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
}

function peakMarkerRow(
  marker: NonNullable<ProjectSaveData['peakMarkers']>[number],
  projectData: ProjectSaveData,
) {
  const source = projectData.measurementDatasets?.find(
    (dataset) => dataset.id === marker.datasetId,
  )

  return [
    escapeCell(source?.name_zh ?? marker.datasetId),
    marker.xValue,
    escapeCell(marker.label_zh),
    escapeCell(marker.assignment_zh || '未指定'),
    marker.peakType === 'manual' ? '手動' : '建議',
  ].join(' | ').replace(/^/, '| ').replace(/$/, ' |')
}

function measurementComparisonText(
  comparison: MeasurementComparison,
  datasets: MeasurementDataset[],
) {
  const datasetNames = comparison.datasetIds
    .map((datasetId) => datasets.find((dataset) => dataset.id === datasetId)?.name_zh)
    .filter(Boolean)
    .join('、')

  return [
    `### ${comparison.name_zh}`,
    `- 類型：${formatMeasurementTypeForReport(comparison.measurementType)}`,
    `- 包含資料集：${datasetNames || '未找到資料集'}`,
    `- 備註：${fallback(comparison.notes_zh)}`,
  ].join('\n')
}

function formatMeasurementTypeForReport(type: MeasurementDataset['measurementType']) {
  const labels: Record<MeasurementDataset['measurementType'], string> = {
    raman: 'Raman',
    pl: 'PL',
    electrical_iv: '電性 I-V',
    electrical_transfer: '電性 Id-Vg',
    custom: '自訂',
  }

  return labels[type]
}

function nextStepSection() {
  return [
    '- 補齊 D0 / Ea 文獻參數。',
    '- 補齊 Sb₂O₃ 介電常數 / 崩潰電場。',
    '- 使用 Raman / 低功率 Raman / AFM / XPS 驗證氧化程度。',
    '- 使用電性量測或 TLM 校準接觸電阻。',
    '- 比較退火前後 I-V / Raman / PL。',
  ].join('\n')
}

function uniqueMaterials(projectData: ProjectSaveData): Material[] {
  const ids = new Set(projectData.deviceStructure.layers.map((layer) => layer.materialId))

  return [...ids]
    .map((id) => getMaterial(id))
    .filter((material): material is Material => Boolean(material))
}

function getMaterial(materialId: string) {
  return materials.find((material) => material.id === materialId)
}

function fallback(value?: string) {
  return value && value.trim() ? value : '未填寫'
}

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('zh-TW')
}

function escapeCell(value: string) {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}
