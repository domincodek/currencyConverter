import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { CurrencyConverter } from '../src/components/CurrencyConverter.tsx'

const currencies = [
  { short_code: 'EUR', name: 'Euro' },
  { short_code: 'GBP', name: 'British Pound Sterling' },
  { short_code: 'PLN', name: 'Polish Zloty' },
  { short_code: 'USD', name: 'United States Dollar' },
]

function mockFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes('/currencies')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ meta: { code: 200 }, response: currencies }),
        }
      }
      if (url.includes('/convert')) {
        const parsed = new URL(url, 'http://localhost')
        const amount = Number(parsed.searchParams.get('amount'))
        return {
          ok: true,
          status: 200,
          json: async () => ({
            meta: { code: 200 },
            response: {
              from: parsed.searchParams.get('from'),
              to: parsed.searchParams.get('to'),
              amount,
              value: amount * 0.92,
            },
          }),
        }
      }
      return { ok: false, status: 404, json: async () => ({}) }
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CurrencyConverter', () => {
  it('loads currencies into both selects', async () => {
    mockFetch()
    render(<CurrencyConverter />)

    const from = await screen.findByLabelText('From currency')
    const to = screen.getByLabelText('To currency')

    expect(from).toHaveValue('PLN')
    expect(to).toHaveValue('EUR')
    expect(screen.getAllByRole('option', { name: 'Euro (EUR)' })).toHaveLength(2)
  })

  it('shows the converted amount from the API', async () => {
    mockFetch()
    render(<CurrencyConverter />)

    await waitFor(() => {
      expect(screen.getByLabelText('To')).toHaveValue('0.92')
    })
  })

  it('swaps the selected currencies', async () => {
    mockFetch()
    const user = userEvent.setup()
    render(<CurrencyConverter />)

    await screen.findByLabelText('From currency')
    await user.click(screen.getByRole('button', { name: 'Swap currencies' }))

    expect(screen.getByLabelText('From currency')).toHaveValue('EUR')
    expect(screen.getByLabelText('To currency')).toHaveValue('PLN')
  })
})
