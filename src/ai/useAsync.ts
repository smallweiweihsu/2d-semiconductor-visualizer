import { useCallback, useState } from 'react'

export function useAsync<T>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(async (promise: Promise<T>): Promise<T | null> => {
    setLoading(true)
    setError(null)
    try {
      return await promise
    } catch (err) {
      setError((err as Error).message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])
  return { loading, error, run, setError }
}
