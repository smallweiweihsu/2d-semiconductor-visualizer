import { oxidationPresets } from '../../data/oxidationPresets'
import type { OxidationScenario } from '../../types/oxidation'

interface OxidationScenarioSelectorProps {
  scenario: OxidationScenario
  onSelectPreset: (preset: OxidationScenario) => void
  onUpdateScenario: (updates: Partial<OxidationScenario>) => void
}

const quickPresetIds = [
  'wse2_to_wox_o2_rie',
  'wse2_to_wox_uv_ozone',
  'wse2_to_wox_thermal',
  'sb_to_sb2o3_ambient',
  'sb_to_sb2o3_thermal',
]

export function OxidationScenarioSelector({
  scenario,
  onSelectPreset,
  onUpdateScenario,
}: OxidationScenarioSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">氧化情境</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          選擇 WSe₂ → WOx、Sb → Sb₂O₃ 或通用氧化情境；氧化速率未填入時只提供定性判讀。
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <label className="block text-xs text-slate-400">
          預設情境
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => {
              const preset = oxidationPresets.find(
                (item) => item.id === event.target.value,
              )

              if (preset) {
                onSelectPreset(preset)
              }
            }}
            value={scenario.id}
          >
            {oxidationPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name_zh}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs text-slate-400">
          情境名稱
          <input
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => onUpdateScenario({ name_zh: event.target.value })}
            value={scenario.name_zh}
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickPresetIds.map((presetId) => {
          const preset = oxidationPresets.find((item) => item.id === presetId)

          if (!preset) {
            return null
          }

          return (
            <button
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                scenario.id === preset.id
                  ? 'border-cyan-500 bg-cyan-950/50 text-cyan-100'
                  : 'border-slate-700 bg-slate-950/50 text-slate-300 hover:border-slate-500'
              }`}
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              type="button"
            >
              {preset.name_zh}
            </button>
          )
        })}
      </div>

      {scenario.notes_zh ? (
        <p className="mt-3 rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs leading-5 text-slate-400">
          {scenario.notes_zh}
        </p>
      ) : null}
    </section>
  )
}
