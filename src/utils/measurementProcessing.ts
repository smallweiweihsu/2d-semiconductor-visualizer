import type {
  MeasurementColumn,
  MeasurementDataset,
  MeasurementRow,
  MeasurementSeries,
  PeakMarker,
  ProcessedMeasurementDataset,
  ProcessingOperation,
} from '../types/measurement'

interface NumericSeries {
  x: number[]
  y: number[]
  rowIndexes: number[]
  warnings_zh: string[]
}

interface SeriesResult {
  x: number[]
  y: number[]
  warnings_zh: string[]
}

interface LocalMaximaOptions {
  thresholdRatio: number
  minSeparation: number
  maxPeaks: number
  datasetId: string
  processedDatasetId?: string
}

export function getNumericSeries(
  dataset: Pick<MeasurementDataset, 'rows'>,
  xColumnId: string,
  yColumnId: string,
): NumericSeries {
  const x: number[] = []
  const y: number[] = []
  const rowIndexes: number[] = []

  dataset.rows.forEach((row, index) => {
    const xValue = row.values[xColumnId]
    const yValue = row.values[yColumnId]

    if (typeof xValue === 'number' && typeof yValue === 'number') {
      x.push(xValue)
      y.push(yValue)
      rowIndexes.push(index)
    }
  })

  return {
    x,
    y,
    rowIndexes,
    warnings_zh:
      x.length === dataset.rows.length
        ? []
        : ['部分資料列缺少有效的 x/y 數值，處理時已略過。'],
  }
}

export function applyAbsY(series: NumericSeries | SeriesResult): SeriesResult {
  return {
    x: [...series.x],
    y: series.y.map((value) => Math.abs(value)),
    warnings_zh: [
      ...series.warnings_zh,
      '已套用 abs(Y)；請確認取絕對值符合量測接線、掃描方向與研究問題。',
    ],
  }
}

export function applyInvertY(series: NumericSeries | SeriesResult): SeriesResult {
  return {
    x: [...series.x],
    y: series.y.map((value) => -value),
    warnings_zh: [
      ...series.warnings_zh,
      '已套用 Y 取負號；請確認電流方向與儀器接線定義。',
    ],
  }
}

export function normalizeByMax(series: NumericSeries | SeriesResult): SeriesResult {
  const maxAbs = Math.max(...series.y.map((value) => Math.abs(value)))

  if (!Number.isFinite(maxAbs) || maxAbs === 0) {
    return {
      ...series,
      warnings_zh: [...series.warnings_zh, '最大值為 0，無法以最大值正規化。'],
    }
  }

  return {
    x: [...series.x],
    y: series.y.map((value) => value / maxAbs),
    warnings_zh: [
      ...series.warnings_zh,
      '已套用最大值正規化；正規化後不可直接比較絕對強度。',
    ],
  }
}

export function normalizeMinMax(series: NumericSeries | SeriesResult): SeriesResult {
  const min = Math.min(...series.y)
  const max = Math.max(...series.y)
  const range = max - min

  if (!Number.isFinite(range) || range === 0) {
    return {
      ...series,
      warnings_zh: [...series.warnings_zh, 'Y 最大值等於最小值，無法做 Min-Max 正規化。'],
    }
  }

  return {
    x: [...series.x],
    y: series.y.map((value) => (value - min) / range),
    warnings_zh: [
      ...series.warnings_zh,
      '已套用 Min-Max 正規化；相對強度外觀會被改變。',
    ],
  }
}

export function normalizeByArea(series: NumericSeries | SeriesResult): SeriesResult {
  const area = series.x.slice(1).reduce((sum, xValue, index) => {
    const previousX = series.x[index]
    const previousY = series.y[index]
    const yValue = series.y[index + 1]

    return sum + ((yValue + previousY) / 2) * (xValue - previousX)
  }, 0)

  if (!Number.isFinite(area) || area === 0) {
    return {
      ...series,
      warnings_zh: [...series.warnings_zh, '面積為 0 或無效，無法做面積正規化。'],
    }
  }

  return {
    x: [...series.x],
    y: series.y.map((value) => value / area),
    warnings_zh: [
      ...series.warnings_zh,
      area < 0
        ? '面積為負值，已照數值正規化；請確認 x 軸順序與 baseline。'
        : '已套用面積正規化；不同處理流程不可直接比較絕對強度。',
    ],
  }
}

export function subtractConstantBaseline(
  series: NumericSeries | SeriesResult,
  baselineValue: number,
): SeriesResult {
  return {
    x: [...series.x],
    y: series.y.map((value) => value - baselineValue),
    warnings_zh: [
      ...series.warnings_zh,
      '已扣除常數 baseline；此 baseline 不代表已完成物理正確的背景模型。',
    ],
  }
}

export function subtractLinearBaseline(
  series: NumericSeries | SeriesResult,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): SeriesResult {
  if (x1 === x2) {
    return {
      ...series,
      warnings_zh: [...series.warnings_zh, '線性 baseline 的兩個 x 點相同，無法套用。'],
    }
  }

  const slope = (y2 - y1) / (x2 - x1)

  return {
    x: [...series.x],
    y: series.y.map((value, index) => {
      const baseline = y1 + slope * (series.x[index] - x1)
      return value - baseline
    }),
    warnings_zh: [
      ...series.warnings_zh,
      '已扣除線性 baseline；此處理只是視覺化輔助，並非已驗證的光譜背景模型。',
    ],
  }
}

export function suggestLocalMaxima(
  series: Pick<MeasurementSeries, 'x' | 'y'>,
  options: LocalMaximaOptions,
): PeakMarker[] {
  const maxY = Math.max(...series.y)
  const threshold = maxY * options.thresholdRatio
  const peaks: PeakMarker[] = []

  for (let index = 1; index < series.y.length - 1; index += 1) {
    const previous = series.y[index - 1]
    const current = series.y[index]
    const next = series.y[index + 1]

    if (current > previous && current >= next && current >= threshold) {
      const tooClose = peaks.some(
        (peak) => Math.abs(peak.xValue - series.x[index]) < options.minSeparation,
      )

      if (!tooClose) {
        peaks.push({
          id: `peak-${crypto.randomUUID()}`,
          datasetId: options.datasetId,
          processedDatasetId: options.processedDatasetId,
          xValue: series.x[index],
          yValue: current,
          label_zh: '建議 peak',
          peakType: 'suggested',
          confidence: 'suggested',
          notes_zh: '由簡單 local maximum 規則產生，尚未進行 fitting。',
        })
      }
    }
  }

  return peaks
    .sort((a, b) => b.yValue - a.yValue)
    .slice(0, options.maxPeaks)
    .sort((a, b) => a.xValue - b.xValue)
}

export function applyProcessingOperations(
  dataset: MeasurementDataset,
  operations: ProcessingOperation[],
  xColumnId: string,
  yColumnId: string,
) {
  const numericSeries = getNumericSeries(dataset, xColumnId, yColumnId)
  const enabledOperations = operations.filter((operation) => operation.enabled)
  const processedSeries = enabledOperations.reduce<SeriesResult>(
    (current, operation) => applyOperation(current, operation),
    numericSeries,
  )
  const rows = buildProcessedRows(
    dataset.rows,
    numericSeries.rowIndexes,
    yColumnId,
    processedSeries.y,
  )

  return {
    rows,
    series: processedSeries,
    warnings_zh: [...new Set(processedSeries.warnings_zh)],
  }
}

export function createProcessedMeasurementDataset({
  dataset,
  operations,
  xColumnId,
  yColumnId,
}: {
  dataset: MeasurementDataset
  operations: ProcessingOperation[]
  xColumnId: string
  yColumnId: string
}): ProcessedMeasurementDataset {
  const result = applyProcessingOperations(dataset, operations, xColumnId, yColumnId)
  const now = new Date().toISOString()
  const columns = markProcessedColumn(dataset.columns, yColumnId)

  return {
    id: `processed-${crypto.randomUUID()}`,
    sourceDatasetId: dataset.id,
    name_zh: `${dataset.name_zh}（處理後）`,
    operations: structuredClone(operations),
    rows: result.rows,
    columns,
    warnings_zh: result.warnings_zh,
    createdAt: now,
    updatedAt: now,
  }
}

export function createProcessingOperation(
  type: ProcessingOperation['type'],
): ProcessingOperation {
  return {
    id: `operation-${crypto.randomUUID()}`,
    type,
    name_zh: processingOperationLabel(type),
    enabled: true,
    parameters: defaultOperationParameters(type),
    createdAt: new Date().toISOString(),
    warnings_zh: operationWarnings(type),
  }
}

export function processingOperationLabel(type: ProcessingOperation['type']) {
  const labels: Record<ProcessingOperation['type'], string> = {
    abs_y: 'abs(Y)',
    invert_y: 'Y 取負號',
    normalize_max: '以最大值正規化',
    normalize_min_max: 'Min-Max 正規化',
    normalize_area: '面積正規化',
    subtract_constant_baseline: '扣除常數 baseline',
    subtract_linear_baseline: '扣除線性 baseline',
    manual_peak_marker: '手動 peak 標記',
    auto_peak_suggestion: '自動 peak 建議',
    custom: '自訂處理',
  }

  return labels[type]
}

function applyOperation(
  series: NumericSeries | SeriesResult,
  operation: ProcessingOperation,
): SeriesResult {
  switch (operation.type) {
    case 'abs_y':
      return applyAbsY(series)
    case 'invert_y':
      return applyInvertY(series)
    case 'normalize_max':
      return normalizeByMax(series)
    case 'normalize_min_max':
      return normalizeMinMax(series)
    case 'normalize_area':
      return normalizeByArea(series)
    case 'subtract_constant_baseline':
      return subtractConstantBaseline(
        series,
        Number(operation.parameters.baselineValue ?? 0),
      )
    case 'subtract_linear_baseline':
      return subtractLinearBaseline(
        series,
        Number(operation.parameters.x1 ?? series.x[0] ?? 0),
        Number(operation.parameters.y1 ?? series.y[0] ?? 0),
        Number(operation.parameters.x2 ?? series.x.at(-1) ?? 1),
        Number(operation.parameters.y2 ?? series.y.at(-1) ?? 0),
      )
    default:
      return {
        ...series,
        warnings_zh: [
          ...series.warnings_zh,
          `${operation.name_zh} 尚未套用實際處理，只保留在流程紀錄中。`,
        ],
      }
  }
}

function buildProcessedRows(
  sourceRows: MeasurementRow[],
  rowIndexes: number[],
  yColumnId: string,
  processedY: number[],
) {
  const processedByRowIndex = new Map<number, number>()

  rowIndexes.forEach((rowIndex, index) => {
    processedByRowIndex.set(rowIndex, processedY[index])
  })

  return sourceRows.map((row, index) => ({
    values: {
      ...row.values,
      [yColumnId]: processedByRowIndex.get(index) ?? row.values[yColumnId],
    },
  }))
}

function markProcessedColumn(columns: MeasurementColumn[], yColumnId: string) {
  return columns.map((column) =>
    column.id === yColumnId
      ? {
          ...column,
          label_zh: `${column.label_zh}（處理後）`,
          originalName: `${column.originalName} processed`,
        }
      : column,
  )
}

function defaultOperationParameters(
  type: ProcessingOperation['type'],
): Record<string, number | string | boolean | null> {
  if (type === 'subtract_constant_baseline') {
    return { baselineValue: 0 }
  }

  if (type === 'subtract_linear_baseline') {
    return { x1: 0, y1: 0, x2: 1, y2: 0 }
  }

  if (type === 'auto_peak_suggestion') {
    return { thresholdRatio: 0.2, minSeparation: 10, maxPeaks: 5 }
  }

  return {}
}

function operationWarnings(type: ProcessingOperation['type']) {
  if (type === 'abs_y') {
    return ['abs(I) 不一定適合所有電性資料，需確認接線方向與掃描方向。']
  }

  if (type === 'normalize_max' || type === 'normalize_min_max' || type === 'normalize_area') {
    return ['正規化會改變強度外觀，不能保留絕對強度資訊。']
  }

  if (
    type === 'subtract_constant_baseline' ||
    type === 'subtract_linear_baseline'
  ) {
    return ['baseline correction 是初步視覺化處理，尚未經物理模型驗證。']
  }

  if (type === 'auto_peak_suggestion') {
    return ['自動 peak suggestion 只是 local maximum 輔助，不是正式 fitting。']
  }

  return []
}
