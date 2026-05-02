import type {
  MeasurementAxisType,
  MeasurementColumn,
  MeasurementDataFormat,
  MeasurementDataset,
  MeasurementImportResult,
  MeasurementMetadata,
  MeasurementRow,
  MeasurementSeries,
  MeasurementType,
} from '../types/measurement'

export type DelimiterMode = 'auto' | 'comma' | 'tab' | 'space' | 'semicolon'

interface CreateMeasurementDatasetInput {
  text: string
  measurementType: MeasurementType
  format: MeasurementDataFormat
  fileName?: string
  name_zh?: string
  metadata?: MeasurementMetadata
  columnMappings?: Record<string, MeasurementAxisType>
  delimiterMode?: DelimiterMode
}

const delimiterMap: Record<Exclude<DelimiterMode, 'auto'>, RegExp | string> = {
  comma: ',',
  tab: '\t',
  space: /\s+/,
  semicolon: ';',
}

export function parseDelimitedText(
  text: string,
  delimiterMode: DelimiterMode = 'auto',
) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const delimiter = delimiterMode === 'auto' ? detectDelimiter(lines) : delimiterMode

  return {
    delimiter,
    lines,
    rows: lines.map((line) => splitLine(line, delimiter)),
  }
}

export function detectHeaderRow(rows: string[][]) {
  const firstRow = rows[0] ?? []

  return firstRow.some((cell) => Number.isNaN(Number(cell.trim())))
}

export function parseNumericValue(value: string): number | string | null {
  const trimmed = value.trim()

  if (!trimmed) {
    return null
  }

  const normalized = trimmed.replace(/,/g, '')
  const numeric = Number(normalized)

  return Number.isFinite(numeric) ? numeric : trimmed
}

export function inferMeasurementColumnType(
  columnName: string,
  values: Array<number | string | null>,
): MeasurementAxisType {
  const name = columnName.toLowerCase()
  const numericRatio =
    values.length === 0
      ? 0
      : values.filter((value) => typeof value === 'number').length / values.length

  if (/raman|shift|cm-?1|cm⁻¹/.test(name)) {
    return 'raman_shift_cm-1'
  }

  if (/wavelength|lambda|nm/.test(name)) {
    return 'wavelength_nm'
  }

  if (/energy|ev/.test(name)) {
    return 'energy_eV'
  }

  if (/intensity|counts|count|a\.?u\.?|signal/.test(name)) {
    return 'intensity_a.u.'
  }

  if (/voltage|^v$|vd|vg|bias/.test(name)) {
    return 'voltage_V'
  }

  if (/current|^i$|id|is|amp|ampere/.test(name)) {
    return 'current_A'
  }

  if (/temperature|temp|kelvin|^k$/.test(name)) {
    return 'temperature_K'
  }

  if (/time|sec|second|^t$/.test(name)) {
    return 'time_s'
  }

  return numericRatio > 0.8 ? 'custom' : 'custom'
}

export function createMeasurementDatasetFromText({
  columnMappings = {},
  delimiterMode = 'auto',
  fileName,
  format,
  metadata = {},
  measurementType,
  name_zh,
  text,
}: CreateMeasurementDatasetInput): MeasurementImportResult {
  const parsed = parseDelimitedText(text, delimiterMode)
  const errors_zh: string[] = []
  const warnings_zh: string[] = []

  if (parsed.rows.length === 0) {
    return {
      success: false,
      errors_zh: ['沒有可匯入的資料列。'],
      warnings_zh: [],
    }
  }

  const hasHeader = detectHeaderRow(parsed.rows)
  const header = hasHeader
    ? parsed.rows[0]
    : parsed.rows[0].map((_, index) => `Column ${index + 1}`)
  const dataRows = hasHeader ? parsed.rows.slice(1) : parsed.rows
  const normalizedRows = dataRows.map((row) =>
    header.map((_, index) => parseNumericValue(row[index] ?? '')),
  )

  const columns: MeasurementColumn[] = header.map((name, index) => {
    const id = `col-${index + 1}`
    const values = normalizedRows.map((row) => row[index] ?? null)
    const inferredType = inferMeasurementColumnType(name, values)
    const mappedType = columnMappings[id] ?? inferredType

    return {
      id,
      originalName: name || `Column ${index + 1}`,
      mappedType,
      label_zh: name || `欄位 ${index + 1}`,
      unit: inferUnit(mappedType),
      index,
    }
  })
  const rows: MeasurementRow[] = normalizedRows.map((row) => ({
    values: columns.reduce<Record<string, number | string | null>>(
      (values, column) => {
        values[column.id] = row[column.index] ?? null
        return values
      },
      {},
    ),
  }))
  const dataset: MeasurementDataset = {
    id: `measurement-${crypto.randomUUID()}`,
    name_zh:
      name_zh ||
      fileName?.replace(/\.[^.]+$/, '') ||
      defaultDatasetName(measurementType),
    measurementType,
    format,
    rawText: text,
    fileName,
    importedAt: new Date().toISOString(),
    linkedLayerIds: [],
    linkedProcessStepIds: [],
    metadata: {
      beforeAfterTag: 'unknown',
      ...metadata,
    },
    columns,
    rows,
    warnings_zh,
  }

  const validation = validateMeasurementDataset(dataset)
  errors_zh.push(...validation.errors_zh)
  warnings_zh.push(...validation.warnings_zh)
  dataset.warnings_zh = warnings_zh

  return {
    success: errors_zh.length === 0,
    dataset: errors_zh.length === 0 ? dataset : undefined,
    errors_zh,
    warnings_zh,
  }
}

export function createSeriesFromDataset(
  dataset: MeasurementDataset,
  xColumnId: string,
  yColumnId: string,
): MeasurementSeries {
  const points = dataset.rows
    .map((row) => ({
      x: row.values[xColumnId],
      y: row.values[yColumnId],
    }))
    .filter(
      (point): point is { x: number; y: number } =>
        typeof point.x === 'number' && typeof point.y === 'number',
    )
  const xColumn = dataset.columns.find((column) => column.id === xColumnId)
  const yColumn = dataset.columns.find((column) => column.id === yColumnId)

  return {
    id: `series-${dataset.id}-${xColumnId}-${yColumnId}`,
    datasetId: dataset.id,
    label_zh: dataset.name_zh,
    x: points.map((point) => point.x),
    y: points.map((point) => point.y),
    xAxisType: xColumn?.mappedType ?? 'custom',
    yAxisType: yColumn?.mappedType ?? 'custom',
  }
}

export function validateMeasurementDataset(dataset: MeasurementDataset) {
  const errors_zh: string[] = []
  const warnings_zh: string[] = []
  const numericColumns = dataset.columns.filter((column) =>
    dataset.rows.some((row) => typeof row.values[column.id] === 'number'),
  )
  const hasLikelyX = dataset.columns.some((column) =>
    [
      'raman_shift_cm-1',
      'wavelength_nm',
      'energy_eV',
      'voltage_V',
      'temperature_K',
      'time_s',
    ].includes(column.mappedType),
  )
  const hasLikelyY = dataset.columns.some((column) =>
    ['intensity_a.u.', 'current_A', 'custom'].includes(column.mappedType),
  )

  if (dataset.rows.length === 0) {
    errors_zh.push('資料集沒有任何資料列。')
  }

  if (numericColumns.length === 0) {
    errors_zh.push('資料集沒有可繪圖的數值欄位。')
  }

  if (!hasLikelyX) {
    warnings_zh.push('尚未明確指定 x 軸欄位。')
  }

  if (!hasLikelyY) {
    warnings_zh.push('尚未明確指定 y 軸欄位。')
  }

  if (dataset.rows.length > 0 && dataset.rows.length < 4) {
    warnings_zh.push('資料點數偏少，趨勢判讀可能不可靠。')
  }

  if (dataset.measurementType === 'raman' || dataset.measurementType === 'pl') {
    warnings_zh.push('Raman / PL intensity 通常為任意單位，跨條件比較需確認儀器設定一致。')
  }

  if (
    dataset.measurementType === 'electrical_iv' ||
    dataset.measurementType === 'electrical_transfer'
  ) {
    warnings_zh.push('電流正負號與單位需依量測接線與儀器設定確認。')
  }

  return { errors_zh, warnings_zh }
}

function detectDelimiter(lines: string[]): Exclude<DelimiterMode, 'auto'> {
  const sample = lines.slice(0, 5).join('\n')
  const counts = {
    comma: (sample.match(/,/g) ?? []).length,
    tab: (sample.match(/\t/g) ?? []).length,
    semicolon: (sample.match(/;/g) ?? []).length,
    space: (sample.match(/\s+/g) ?? []).length,
  }

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Exclude<
    DelimiterMode,
    'auto'
  >
}

function splitLine(line: string, delimiter: Exclude<DelimiterMode, 'auto'>) {
  const separator = delimiterMap[delimiter]

  return line
    .split(separator)
    .map((cell) => cell.replace(/^"|"$/g, '').trim())
}

function inferUnit(axisType: MeasurementAxisType) {
  const unitMap: Partial<Record<MeasurementAxisType, string>> = {
    'raman_shift_cm-1': 'cm⁻¹',
    wavelength_nm: 'nm',
    energy_eV: 'eV',
    'intensity_a.u.': 'a.u.',
    voltage_V: 'V',
    current_A: 'A',
    temperature_K: 'K',
    time_s: 's',
  }

  return unitMap[axisType]
}

function defaultDatasetName(measurementType: MeasurementType) {
  const labels: Record<MeasurementType, string> = {
    raman: 'Raman 量測資料',
    pl: 'PL 量測資料',
    electrical_iv: '電性 I-V 資料',
    electrical_transfer: '電性 Id-Vg 資料',
    custom: '自訂量測資料',
  }

  return labels[measurementType]
}

