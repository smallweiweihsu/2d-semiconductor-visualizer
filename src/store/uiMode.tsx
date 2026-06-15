import { createContext, useContext, useState, type ReactNode } from 'react'

interface UiModeValue {
  simple: boolean
  toggle: () => void
}

const UiModeContext = createContext<UiModeValue>({ simple: true, toggle: () => {} })

export function UiModeProvider({ children }: { children: ReactNode }) {
  const [simple, setSimple] = useState(true)
  return <UiModeContext.Provider value={{ simple, toggle: () => setSimple((s) => !s) }}>{children}</UiModeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUiMode() {
  return useContext(UiModeContext)
}
