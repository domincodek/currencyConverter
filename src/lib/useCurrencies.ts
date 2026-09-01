import { useEffect, useState } from 'react'
import { fetchCurrencies } from '../api/client.ts'
import type { Currency } from '../api/types.ts'

export function useCurrencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetchCurrencies(controller.signal)
      .then((list) => {
        setCurrencies(list)
        setError(null)
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setError('Could not load currencies.')
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [])

  return { currencies, loading, error }
}
