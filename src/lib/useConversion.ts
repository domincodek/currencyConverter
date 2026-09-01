import { useEffect, useState } from 'react'
import { convertCurrency } from '../api/client.ts'

const DEBOUNCE_MS = 400

function parseAmount(amount: string) {
  const value = Number(amount)
  if (amount.trim() === '' || Number.isNaN(value) || value <= 0) {
    return null
  }
  return value
}

export function useConversion(from: string, to: string, amount: string) {
  const [value, setValue] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const parsed = parseAmount(amount)

    if (parsed === null || !from || !to) {
      setValue(null)
      setError(null)
      setLoading(false)
      return
    }

    if (from === to) {
      setValue(parsed)
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    const timer = window.setTimeout(() => {
      convertCurrency(from, to, parsed, controller.signal)
        .then((result) => {
          setValue(result)
          setError(null)
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === 'AbortError') {
            return
          }
          setValue(null)
          setError('Could not convert currencies.')
        })
        .finally(() => {
          setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [from, to, amount])

  return { value, loading, error }
}
