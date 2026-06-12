export function formatTick(value: number) {
  if (!Number.isFinite(value)) return ''
  if (Object.is(value, -0) || Math.abs(value) < 1e-9) return '0'
  return Number(value.toFixed(1)).toString()
}

export function formatEnergy(value: number) {
  if (!Number.isFinite(value)) return 'missing'
  if (Object.is(value, -0) || Math.abs(value) < 1e-9) return '0'
  return Number(value.toFixed(2)).toString()
}

export function formatPosition(value: number) {
  return formatTick(value)
}
