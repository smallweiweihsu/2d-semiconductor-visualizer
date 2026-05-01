import { materials } from '../../data/materials'
import type { ElectricalScenario } from '../../types/electrical'
import { getMaterialLabel, parseNumericMaterialValue } from './electricalFormatting'

interface BandAlignmentPreviewProps {
  scenario: ElectricalScenario
}

export function BandAlignmentPreview({ scenario }: BandAlignmentPreviewProps) {
  const channel = materials.find((item) => item.id === scenario.channelMaterialId)
  const dielectric = materials.find(
    (item) => item.id === scenario.gateDielectricMaterialId,
  )
  const electronAffinity = parseNumericMaterialValue(
    channel?.parameters.electronAffinity_eV.value ?? null,
  )
  const bandGap = parseNumericMaterialValue(channel?.parameters.bandGap_eV.value ?? null)
  const dielectricConstant = parseNumericMaterialValue(
    dielectric?.parameters.dielectricConstant.value ?? null,
  )

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">能帶 / 接觸定性預覽</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          這是理想化能帶排列草圖；功函數本身不能決定真實二維材料接觸。
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <BandCard label="金屬接觸" value="功函數待由接觸層判讀" />
        <BandCard
          label={getMaterialLabel(scenario.channelMaterialId)}
          value={`χ: ${formatValue(electronAffinity)} eV · Eg: ${formatValue(bandGap)} eV`}
        />
        <BandCard
          label={getMaterialLabel(scenario.gateDielectricMaterialId)}
          value={`k: ${formatValue(dielectricConstant)}`}
        />
      </div>

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
        <text fill="#38bdf8" fontSize="12" x="232" y="148">WSe₂ / 通道</text>
        <text fill="#fdba74" fontSize="12" x="390" y="148">介電層</text>
      </svg>

      <div className="mt-3 space-y-2 text-xs leading-5 text-amber-100/85">
        <p className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2">
          功函數本身不能決定真實二維材料接觸；Fermi-level pinning、界面態與金屬誘發能隙態可能主導。
        </p>
        <p className="rounded-md border border-amber-900/40 bg-amber-950/20 px-3 py-2">
          此能帶圖為理想化示意，不是 Schottky 輸運、穿隧或低溫輸運求解器。
        </p>
      </div>
    </section>
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
  return value === null ? '未知' : new Intl.NumberFormat('zh-TW', { maximumFractionDigits: 2 }).format(value)
}
