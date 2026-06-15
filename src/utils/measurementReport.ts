import type { DeviceStructure, MeasurementData, SemivizProject } from '../types/semiviz'
import { calculateElectricalMetrics, extractTransferParameters } from '../measurements/electricalMetrics'

function fmt(v: number | undefined, digits = 2): string {
  if (v === undefined || !Number.isFinite(v)) return 'n/a'
  return Math.abs(v) >= 1e4 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(2) : v.toFixed(digits)
}

function temperatureOf(m: MeasurementData): string {
  const t = `${m.sampleName} ${m.notes ?? ''}`.match(/(\d{1,3})\s*[kK]\b/)
  return t ? `${t[1]}K` : '—'
}

/** 產生單一元件的量測 Markdown 報告：結構 + 所有量測的萃取參數彙整。 */
export function generateMeasurementReport(project: SemivizProject, device: DeviceStructure): string {
  const lines: string[] = []
  lines.push(`# 量測報告：${device.name}`)
  lines.push('')
  lines.push(`產生時間：${new Date().toLocaleString()}`)
  lines.push('')

  // 元件結構
  lines.push('## 元件結構')
  lines.push('')
  lines.push('| 層 | 材料 | 角色 | 厚度 (nm) | 偏壓 |')
  lines.push('| --- | --- | --- | --- | --- |')
  for (const layer of device.layers) {
    const mat = project.materials.find((mm) => mm.id === layer.materialId)
    const bias = layer.voltageLabel && layer.voltageValue_V != null ? `${layer.voltageLabel}=${layer.voltageValue_V}V` : '—'
    lines.push(`| ${layer.name} | ${mat?.displayName ?? layer.materialId} | ${layer.role} | ${layer.geometry.thickness_nm} | ${bias} |`)
  }
  lines.push('')

  // 量測彙整
  const elec = project.measurements.filter((m) => m.electrical && (m.deviceName === device.name || m.deviceId === device.id))
  lines.push('## 電性量測彙整')
  lines.push('')
  if (!elec.length) {
    lines.push('（此元件尚無電性量測資料）')
  } else {
    lines.push('| 名稱 | 類型 | 溫度 | on/off | Vth (V) | SS (mV/dec) | gm_max (S) | max\\|Id\\| (A) |')
    lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |')
    for (const m of elec) {
      const metrics = calculateElectricalMetrics(m)
      const ext = extractTransferParameters(m.electrical!.points)
      const kind = m.electrical!.measurementKind === 'id_vg' ? '轉移' : m.electrical!.measurementKind === 'id_vd' ? '輸出' : '—'
      lines.push(`| ${m.sampleName} | ${kind} | ${temperatureOf(m)} | ${metrics.onOffRatio ? metrics.onOffRatio.toExponential(1) : 'n/a'} | ${fmt(ext.vth_V)} | ${ext.ssMin_mVdec !== undefined ? ext.ssMin_mVdec.toFixed(0) : 'n/a'} | ${fmt(ext.gmMax_S)} | ${fmt(metrics.maxAbsId_A)} |`)
    }
  }
  lines.push('')

  lines.push('## 其他量測')
  lines.push('')
  const others = project.measurements.filter((m) => !m.electrical && (m.deviceName === device.name || m.deviceId === device.id))
  if (!others.length) lines.push('（無）')
  else for (const m of others) lines.push(`- ${m.type.toUpperCase()} · ${m.sampleName} · ${m.date}`)
  lines.push('')

  lines.push('## 說明')
  lines.push('參數為自動萃取之半定量結果：Vth 採定電流法（Id=1nA）、SS 取次臨界最小值、gm 取最大微分；需依量測條件與校準解讀，不可直接視為定量結論。')
  return lines.join('\n')
}
