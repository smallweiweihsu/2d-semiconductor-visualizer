import { diffusionPresets } from '../../data/diffusionPresets'
import type { DiffusionScenario } from '../../types/diffusion'

interface DiffusionScenarioSelectorProps {
  scenario: DiffusionScenario
  onSelectPreset: (preset: DiffusionScenario) => void
  onUpdateScenario: (updates: Partial<DiffusionScenario>) => void
}

const quickPresetIds = [
  'pd_into_sb2o3',
  'in_into_sb2o3',
  'ti_into_sb2o3',
  'au_into_sb2o3',
]

export function DiffusionScenarioSelector({
  scenario,
  onSelectPreset,
  onUpdateScenario,
}: DiffusionScenarioSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">擴散情境</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            選擇金屬進入 Sb₂O₃ 或氧化相關占位情境；D0 / Ea 未填入時不會進行定量預測。
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <label className="block text-xs text-slate-400">
          預設情境
          <select
            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-600"
            onChange={(event) => {
              const preset = diffusionPresets.find(
                (item) => item.id === event.target.value,
              )

              if (preset) {
                onSelectPreset(preset)
              }
            }}
            value={scenario.id}
          >
            {diffusionPresets.map((preset) => (
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
          const preset = diffusionPresets.find((item) => item.id === presetId)

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
              {preset.diffusingSpecies} → Sb₂O₃
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
