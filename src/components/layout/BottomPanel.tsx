import { PlotPlaceholder } from '../plots/PlotPlaceholder'

export function BottomPanel() {
  return (
    <section className="border-t border-slate-800/80 bg-slate-950/85 px-4 pb-4 pt-0">
      <div className="mx-auto max-w-7xl rounded-lg border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/30">
        <PlotPlaceholder />
      </div>
    </section>
  )
}
