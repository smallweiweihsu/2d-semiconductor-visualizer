import type { ElectricalResult, ElectricalScenario } from '../../types/electrical'
import {
  electricalRiskLabels,
  formatNumber,
  formatResistance,
  getRiskClass,
} from './electricalFormatting'

interface ElectricalResultSummaryProps {
  result: ElectricalResult
  scenario: ElectricalScenario
}

export function ElectricalResultSummary({
  result,
  scenario,
}: ElectricalResultSummaryProps) {
  const cox_uFcm2 =
    result.Cox_F_per_m2 === null ? null : result.Cox_F_per_m2 * 100
  const facts = [
    ['Cox', `${formatNumber(result.Cox_F_per_m2, 4)} F/m²`],
    ['Cox', `${formatNumber(cox_uFcm2, 4)} µF/cm²`],
    ['載子密度', `${formatNumber(result.carrierDensity_cm2, 3)} cm⁻²`],
    ['通道電阻', formatResistance(result.channelResistance_ohm)],
    ['源極接觸電阻', formatResistance(scenario.sourceContactResistance_ohm)],
    ['汲極接觸電阻', formatResistance(scenario.drainContactResistance_ohm)],
    ['總電阻', formatResistance(result.totalResistance_ohm)],
    ['介電層電場', `${formatNumber(result.dielectricField_MV_per_cm, 3)} MV/cm`],
  ]

  if (result.subthresholdSwing_mV_per_dec !== null) {
    facts.push([
      '次臨界擺幅 SS',
      `${formatNumber(result.subthresholdSwing_mV_per_dec, 1)} mV/dec`,
    ])
  }

  if (result.saturationVoltage_V !== null) {
    facts.push([
      '夾止飽和電壓 Vd,sat',
      `${formatNumber(result.saturationVoltage_V, 2)} V`,
    ])
  }

  if (result.quantumCapacitance_F_per_m2 !== null) {
    facts.push([
      '量子電容 Cq',
      `${formatNumber(result.quantumCapacitance_F_per_m2 * 100, 3)} µF/cm²`,
    ])
    facts.push([
      '有效閘極電容 Ceff',
      `${formatNumber((result.effectiveGateCapacitance_F_per_m2 ?? 0) * 100, 3)} µF/cm²`,
    ])
  }

  if (result.thermionicSaturationCurrent_A !== null) {
    facts.push([
      '熱離子發射飽和電流 Is',
      `${formatNumber(result.thermionicSaturationCurrent_A, 3)} A`,
    ])
  }

  const missingCurveInputs =
    result.idVdCurve.points.length === 0 ||
    result.idVgCurve.points.length === 0 ||
    result.totalResistance_ohm === null

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">電性結果摘要</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            結果是簡化模型趨勢，不代表真實量測 I-V 或完整接觸輸運。
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-xs ${getRiskClass(
            result.contactRisk,
          )}`}
        >
          接觸風險：{electricalRiskLabels[result.contactRisk]}
        </span>
      </div>

      {missingCurveInputs ? (
        <p className="mt-4 rounded-md border border-amber-800/50 bg-amber-950/25 px-3 py-2 text-xs leading-5 text-amber-100/85">
          缺少必要參數，暫無法產生定量 I-V / Id-Vg 曲線。
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {facts.map(([label, value], index) => (
          <div
            className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2"
            key={`${label}-${index}`}
          >
            <div className="text-[11px] text-slate-500">{label}</div>
            <div className="mt-1 break-words text-sm font-semibold text-slate-100">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <RiskBadge label="崩潰風險" risk={result.breakdownRisk} />
        <RiskBadge label="接觸風險" risk={result.contactRisk} />
        <RiskBadge label="閘極控制風險" risk={result.gateControlRisk} />
      </div>
    </section>
  )
}

function RiskBadge({
  label,
  risk,
}: {
  label: string
  risk: ElectricalResult['breakdownRisk']
}) {
  return (
    <span className={`rounded-full border px-3 py-1 ${getRiskClass(risk)}`}>
      {label}：{electricalRiskLabels[risk]}
    </span>
  )
}
