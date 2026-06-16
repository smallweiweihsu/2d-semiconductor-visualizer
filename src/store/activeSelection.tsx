import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface ActiveSelection {
  type: 'reference' | 'material'
  id: string
  label: string
}

interface ActiveSelectionValue {
  active: ActiveSelection | null
  setActive: (selection: ActiveSelection | null) => void
}

const Ctx = createContext<ActiveSelectionValue | null>(null)

export function ActiveSelectionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveSelection | null>(null)
  const value = useMemo(() => ({ active, setActive }), [active])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useActiveSelection(): ActiveSelectionValue {
  const ctx = useContext(Ctx)
  if (!ctx) return { active: null, setActive: () => {} }
  return ctx
}
