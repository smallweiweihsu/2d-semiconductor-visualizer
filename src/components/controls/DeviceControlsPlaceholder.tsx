export function DeviceControlsPlaceholder() {
  return (
    <div className="flex h-full min-h-48 flex-col justify-between gap-6">
      <div>
        <h2 className="text-sm font-medium text-slate-500">元件控制</h2>
        <p className="mt-4 text-lg font-semibold text-slate-100">
          元件控制會顯示在這裡
        </p>
      </div>

      <div className="rounded-md border border-dashed border-slate-700 p-3 text-sm text-slate-500">
        層狀結構編輯器、材料選擇器與元件設定會在後續批次加入。
      </div>
    </div>
  )
}
