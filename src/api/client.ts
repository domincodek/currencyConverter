import type { ConvertResponse, CurrenciesResponse, Currency } from './types.ts'

const BASE_PATH = '/api/v1'

function buildUrl(path: string, params: Record<string, string>) {
  const search = new URLSearchParams({
    api_key: import.meta.env.VITE_CURRENCYBEACON_API_KEY ?? '',
    ...params,
  })
  return `${BASE_PATH}${path}?${search}`
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return response.json() as Promise<T>
}

export async function fetchCurrencies(signal?: AbortSignal): Promise<Currency[]> {
  const data = await getJson<CurrenciesResponse>(buildUrl('/currencies', {}), signal)
  const list = data.response ?? []
  return [...list].sort((a, b) => a.name.localeCompare(b.name))
}

export async function convertCurrency(
  from: string,
  to: string,
  amount: number,
  signal?: AbortSignal,
): Promise<number> {
  const data = await getJson<ConvertResponse>(
    buildUrl('/convert', { from, to, amount: String(amount) }),
    signal,
  )
  return data.response.value
}
