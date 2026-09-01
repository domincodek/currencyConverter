import { afterEach, describe, expect, it, vi } from 'vitest'
import { convertCurrency, fetchCurrencies } from '../src/api/client.ts'

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchCurrencies', () => {
  it('maps response.short_code and name, then sorts by name', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          meta: { code: 200 },
          response: [
            { short_code: 'USD', name: 'United States Dollar' },
            { short_code: 'EUR', name: 'Euro' },
          ],
        }),
      ),
    )

    const currencies = await fetchCurrencies()

    expect(currencies.map((c) => c.short_code)).toEqual(['EUR', 'USD'])
    expect(fetch).toHaveBeenCalledTimes(1)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('/api/v1/currencies')
    expect(url).toContain('api_key=test-key')
  })

  it('throws when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false, 401)))

    await expect(fetchCurrencies()).rejects.toThrow('Request failed (401)')
  })
})

describe('convertCurrency', () => {
  it('returns response.value', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse({
          meta: { code: 200 },
          response: {
            from: 'USD',
            to: 'EUR',
            amount: 100,
            value: 91.85,
          },
        }),
      ),
    )

    await expect(convertCurrency('USD', 'EUR', 100)).resolves.toBe(91.85)

    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('/api/v1/convert')
    expect(url).toContain('from=USD')
    expect(url).toContain('to=EUR')
    expect(url).toContain('amount=100')
  })
})
