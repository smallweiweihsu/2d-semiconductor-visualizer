import { useState } from 'react'
import { materials } from '../../data/materials'
import { estimateSchottkyBarrier } from '../../physics/bandAlignment'
import type { ElectricalScenario } from '../../types/electrical'
import { getMaterialLabel, parseNumericMaterialValue } from './electricalFormatting'

interface BandAlignmentPreviewProps {
  scenario: ElectricalScenario
}

const contactMetals = materials.filter(
  (material) => material.category === 'metal' || material.category === 'bulk_conductor',
)

export function BandAlignmentPreview({ scenario }: BandAlignmentPreviewProps) {
  const [metalId, setMetalId] = useState('')
  const [pinningFactor, setPinningFactor] = useState<number | null>(null)
  const [chargeNeutralityLevel_eV, setChargeNeutralityLevel_eV] = useState<
    number | null
  >(null)

  const channel = materials.find((item) => item.id === scenario.channelMaterialId)
  const dielectric = materials.find(
    (item) => item.id === scenario.gateDielectricMaterialId,
  )
  const metal = contactMetals.find((item) => item.id === metalId)
  const electronAffinity = parseNumericMaterialValue(
    channel?.parameters.electronAffinity_eV.value ?? null,
  )
  const bandGap = parseNumericMaterialValue(channel?.parameters.bandGap_eV.value ?? null)
  const dielectricConstant = parseNumericMaterialValue(
    dielectric?.parameters.dielectricConstant.value ?? null,
  )
  const metalWorkFunction = parseNumericMaterialValue(
    metal?.parameters.workFunction_eV.value ?? null,
  )

  // Schottky–Mott / pinning 估算（Sze & Ng 2007 Ch. 3；Kim et al. 2017）。
  const barrier = estimateSchottkyBarrier({
    metalWorkFunction_eV: metalWorkFunction,
    electronAffinity_eV: electronAffinity,
    bandGap_eV: bandGap,
    pinningFactor,
    chargeNeutralityLevel_eV,
  })

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">能帶 / 接觸定性預覽</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          以 Schottky–Mott 規則（可選 pinning 修正）估算理想化障礙高度；功函數本身不能決定真實二維材料接觸。
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-slate-400">
          接觸金屬（功函數來源）
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => setMetalId(event.target.value)}
            value={metalId}
          >
            <option value="">尚未選擇</option>
            {contactMetals.map((item) => (
              <option key={item.id} value={item.id}>
                {item.displayName}
              </option>
            ))}
          </select>
        </label>
        <PinningField
          label="pinning factor S（選填）"
          onChange={setPinningFactor}
          value={pinningFactor}
        />
        <PinningField
          label="電荷中性能階 Φ_CNL（選填）"
          onChange={setChargeNeutralityLevel_eV}
          value={chargeNeutralityLevel_eV}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <BandCard
          label={metal ? `金屬：${metal.displayName}` : '金屬接觸'}
          value={
            metalWorkFunction === null
              ? '功函數缺少資料'
              : `Φm: ${formatValue(metalWorkFunction)} eV`
          }
        />
        <BandCard
          label={getMaterialLabel(scenario.channelMaterialId)}
          value={`χ: ${formatValue(electronAffinity)} eV · Eg: ${formatValue(bandGap)} eV`}
        />
        <BandCard
          label={getMaterialLabel(scenario.gateDielectricMaterialId)}
          value={`k: ${formatValue(dielectricConstant)}`}
        />
      </div>

      {barrier.electronBarrier_eV !== null ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <BandCard
            label={`電子障礙 φBn（${barrier.pinningApplied ? '含 pinning' : 'Schottky–Mott'}）`}
            value={`${formatValue(barrier.electronBarrier_eV)} eV`}
          />
          <BandCard
            label="電洞障礙 φBp = Eg − φBn"
            value={`${formatValue(barrier.holeBarrier_eV)} eV`}
          />
        </div>
      ) : (
        <p className="mt-3 rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs leading-5 text-slate-500">
          選擇接觸金屬並確認通道材料的 χ / Eg 有數值後，會在此顯示估算的 φBn / φBp。
        </p>
      )}

      <svg
        className="mt-4 h-44 w-full rounded-md border border-slate-800 bg-slate-950/70"
        role="img"
        viewBox="0 0 520 180"
      >
        <rect fill="#0f172a" height="180" width="520" />
        <line stroke="#facc15" strokeDasharray="6 4" strokeWidth="2" x1="50" x2="170" y1="82" y2="82" />
        <path d="M 210 55 L 330 55 L 330 125 L 210 125 Z" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <line stroke="#38bdf8" strokeWidth="2" x1="210" x2="330" y1="55" y2="55" />
        <line stroke="#38bdf8" strokeWidth="2" x1="210" x2="330" y1="125" y2="125" />
        <rect fill="#fb923c33" height="90" stroke="#fb923c" strokeWidth="2" width="110" x="370" y="45" />
        <text fill="#facc15" fontSize="12" x="74" y="105">金屬</text>
        <text fill="#38bdf8" fontSize="12" x="232" y="148">通道</text>
        <text fill="#fdba74" fontSize="12" x="390" y="148">介電層</text>
      </svg>

      <div className="mt-3 space-y-2 text-xs leading-5 text-amber-100/85">
        {barrier.warnings_zh.map((warning) => (
          <p
            className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2"
            key={warning}
          >
            {warning}
          </p>
        ))}
        <p className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2">
          此能帶圖為理想化示意，不是 Schottky 輸運、穿隧或低溫輸運求解器。參考：Sze &amp; Ng (2007)；Allain et al. (2015)；Das et al. (2013)；Kim et al. (2017)。
        </p>
      </div>
    </section>
  )
}

function PinningField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (value: number | null) => void
}) {
  return (
    <label className="block text-xs text-slate-400">
      {label}
      <input
        className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
        onChange={(event) =>
          onChange(event.target.value === '' ? null : Number(event.target.value))
        }
        type="number"
        step="0.01"
        value={value ?? ''}
      />
    </label>
  )
}

function BandCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-100">{value}</div>
    </div>
  )
}

function formatValue(value: number | null) {
  if (value === null || !Number.isFinite(value)) {
    return '—'
  }

  return value.toFixed(2)
}
