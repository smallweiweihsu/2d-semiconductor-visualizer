import { materials } from '../../data/materials'
import type { ParameterEvidence } from '../../types/literature'
import {
  formatAgreementStatus,
  formatParameterKey,
} from './literatureFormatting'

interface ParameterEvidenceTableProps {
  evidence: ParameterEvidence[]
  selectedId: string | null
  sourceTitles: Record<string, string>
  onSelectEvidence: (evidenceId: string) => void
}

export function ParameterEvidenceTable({
  evidence,
  selectedId,
  sourceTitles,
  onSelectEvidence,
}: ParameterEvidenceTableProps) {
  if (evidence.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-700 p-4 text-sm text-slate-500">
        目前沒有符合篩選條件的參數證據。
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-800">
      <table className="w-full min-w-[980px] border-collapse text-left text-sm">
        <thead className="bg-slate-950/80 text-xs text-slate-500">
          <tr>
            <th className="px-3 py-3 font-medium">材料</th>
            <th className="px-3 py-3 font-medium">參數</th>
            <th className="px-3 py-3 font-medium">數值</th>
            <th className="px-3 py-3 font-medium">條件 / 方法</th>
            <th className="px-3 py-3 font-medium">來源</th>
            <th className="px-3 py-3 font-medium">支持 / 衝突</th>
            <th className="px-3 py-3 font-medium">信心</th>
          </tr>
        </thead>
        <tbody>
          {evidence.map((item) => (
            <tr
              className={`cursor-pointer border-t border-slate-800/80 align-top transition hover:bg-slate-900/70 ${
                item.id === selectedId ? 'bg-cyan-950/20' : ''
              }`}
              key={item.id}
              onClick={() => onSelectEvidence(item.id)}
            >
              <td className="px-3 py-3 text-slate-200">
                {item.materialIds.map(getMaterialName).join('、')}
              </td>
              <td className="px-3 py-3 text-slate-300">
                {formatParameterKey(item.parameterKey)}
                <div className="mt-2 flex flex-wrap gap-1">
                  {getTopicMarkers(item).map((marker) => (
                    <span
                      className="rounded-full border border-slate-700 bg-slate-950 px-1.5 py-0.5 text-[10px] text-slate-400"
                      key={marker}
                    >
                      {marker}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-3 py-3 text-slate-300">
                {item.value === null || item.value === '' ? (
                  <span className="rounded-full border border-amber-700/70 bg-amber-950/30 px-2 py-1 text-xs text-amber-100">
                    需補參數
                  </span>
                ) : (
                  `${item.value}${item.unit ? ` ${item.unit}` : ''}`
                )}
              </td>
              <td className="px-3 py-3 text-xs leading-5 text-slate-500">
                {item.condition_zh || '條件待補'}
                <br />
                {item.method_zh || '方法待補'}
              </td>
              <td className="max-w-[18rem] px-3 py-3 text-xs leading-5 text-slate-500">
                {sourceTitles[item.sourceId] ?? item.sourceId}
              </td>
              <td className="px-3 py-3 text-slate-300">
                {formatAgreementStatus(item.agreementStatus)}
              </td>
              <td className="px-3 py-3 text-slate-300">
                {formatConfidence(item.confidence)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function getMaterialName(materialId: string) {
  return materials.find((material) => material.id === materialId)?.displayName ?? materialId
}

function formatConfidence(confidence: ParameterEvidence['confidence']) {
  const labels: Record<ParameterEvidence['confidence'], string> = {
    low: '低',
    medium: '中',
    high: '高',
    unknown: '未知',
  }

  return labels[confidence]
}

function getTopicMarkers(item: ParameterEvidence) {
  const markers: string[] = []

  if (item.materialIds.includes('wse2') && item.parameterKey === 'contactResistance_ohm') {
    markers.push('WSe₂ contact')
  }

  if (item.parameterKey === 'workFunction_eV') {
    markers.push('work function context')
  }

  if (item.materialIds.includes('sb2o3') && item.value === null) {
    markers.push('diffusion missing')
  }

  if (item.parameterKey === 'custom' && item.materialIds.includes('sb2o3')) {
    markers.push('oxide interface risk')
  }

  return markers
}
