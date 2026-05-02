import type {
  MeasurementAxisType,
  MeasurementBeforeAfterTag,
  MeasurementDataset,
  MeasurementType,
} from '../../types/measurement'

export function getMeasurementTypeLabel(type: MeasurementType) {
  const labels: Record<MeasurementType, string> = {
    raman: 'Raman',
    pl: 'PL',
    electrical_iv: '電性 I-V',
    electrical_transfer: '電性 Id-Vg',
    custom: '自訂',
  }

  return labels[type]
}

export function formatMeasurementType(type: MeasurementType) {
  return getMeasurementTypeLabel(type)
}

export function formatAxisType(axisType: MeasurementAxisType) {
  const labels: Record<MeasurementAxisType, string> = {
    'raman_shift_cm-1': 'Raman shift',
    wavelength_nm: '波長',
    energy_eV: '能量',
    'intensity_a.u.': '強度',
    voltage_V: '電壓',
    current_A: '電流',
    temperature_K: '溫度',
    time_s: '時間',
    custom: '自訂欄位',
  }

  return labels[axisType]
}

export function formatUnit(unit?: string) {
  return unit ? ` ${unit}` : ''
}

export function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '未填寫'
  }

  if (typeof value === 'string') {
    return value
  }

  if (value === 0) {
    return '0'
  }

  const absolute = Math.abs(value)

  if (absolute >= 10000 || absolute < 0.001) {
    return value.toExponential(3)
  }

  return value.toLocaleString('zh-TW', {
    maximumFractionDigits: 4,
  })
}

export function getBeforeAfterTagLabel(tag?: MeasurementBeforeAfterTag) {
  const labels: Record<MeasurementBeforeAfterTag, string> = {
    before: '製程前',
    after: '製程後',
    reference: '參考',
    unknown: '未指定',
  }

  return labels[tag ?? 'unknown']
}

export function formatDatasetSummary(dataset: MeasurementDataset) {
  return `${getMeasurementTypeLabel(dataset.measurementType)}，${dataset.rows.length} 筆資料列，${dataset.columns.length} 個欄位`
}

