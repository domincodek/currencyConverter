import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useConversion } from '../src/lib/useConversion.ts'

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useConversion', () => {
  it('does not call the API for an empty amount', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderHook(() => useConversion('USD', 'EUR', ''))
    await act(async () => {})

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not call the API for zero or negative amounts', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { rerender } = renderHook(({ amount }) => useConversion('USD', 'EUR', amount), {
      initialProps: { amount: '0' },
    })
    rerender({ amount: '-5' })
    await act(async () => {})

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('skips the API when both currencies are the same', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useConversion('USD', 'USD', '25'))

    expect(fetchMock).not.toHaveBeenCalled()
    expect(result.current.value).toBe(25)
  })

  it('debounces and only sends the last amount', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        meta: { code: 200 },
        response: { from: 'USD', to: 'EUR', amount: 123, value: 113 },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const { rerender, result } = renderHook(({ amount }) => useConversion('USD', 'EUR', amount), {
      initialProps: { amount: '1' },
    })

    rerender({ amount: '12' })
    rerender({ amount: '123' })

    expect(fetchMock).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = String(fetchMock.mock.calls[0][0])
    expect(url).toContain('amount=123')
    expect(result.current.value).toBe(113)
  })
})
