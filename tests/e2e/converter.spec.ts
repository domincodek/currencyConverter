import { expect, test, type Page } from '@playwright/test'

const currencies = [
  { short_code: 'EUR', name: 'Euro' },
  { short_code: 'GBP', name: 'British Pound Sterling' },
  { short_code: 'PLN', name: 'Polish Zloty' },
  { short_code: 'USD', name: 'United States Dollar' },
]

const rates: Record<string, number> = {
  'PLN-EUR': 0.92,
  'EUR-PLN': 1.09,
  'PLN-GBP': 0.78,
  'GBP-PLN': 1.28,
}

async function mockApis(page: Page, convertOk = true) {
  await page.route('**/api/v1/currencies**', async (route) => {
    await route.fulfill({
      json: { meta: { code: 200 }, response: currencies },
    })
  })

  await page.route('**/api/v1/convert**', async (route) => {
    if (!convertOk) {
      await route.fulfill({ status: 500, json: { meta: { code: 500 } } })
      return
    }

    const url = new URL(route.request().url())
    const from = url.searchParams.get('from') ?? ''
    const to = url.searchParams.get('to') ?? ''
    const amount = Number(url.searchParams.get('amount'))
    const rate = from === to ? 1 : (rates[`${from}-${to}`] ?? 1)

    await route.fulfill({
      json: {
        meta: { code: 200 },
        response: { from, to, amount, value: amount * rate },
      },
    })
  })
}

test('loads currencies into the selects', async ({ page }) => {
  await mockApis(page)
  await page.goto('/')

  await expect(page.getByLabel('From currency')).toHaveValue('PLN')
  await expect(page.getByLabel('To currency')).toHaveValue('EUR')
  await expect(page.getByRole('option', { name: 'British Pound Sterling (GBP)' })).toHaveCount(2)
})

test('converts the typed amount', async ({ page }) => {
  await mockApis(page)
  await page.goto('/')

  const fromAmount = page.getByRole('textbox', { name: 'From' })
  const toAmount = page.getByRole('textbox', { name: 'To' })

  await expect(toAmount).toHaveValue('0.92')
  await fromAmount.fill('100')
  await expect(toAmount).toHaveValue('92')
})

test('updates the result when the target currency changes', async ({ page }) => {
  await mockApis(page)
  await page.goto('/')

  const toAmount = page.getByRole('textbox', { name: 'To' })

  await expect(toAmount).toHaveValue('0.92')
  await page.getByLabel('To currency').selectOption('GBP')
  await expect(toAmount).toHaveValue('0.78')
})

test('swaps currencies', async ({ page }) => {
  await mockApis(page)
  await page.goto('/')

  await expect(page.getByRole('textbox', { name: 'To' })).toHaveValue('0.92')
  await page.getByRole('button', { name: 'Swap currencies' }).click()
  await expect(page.getByLabel('From currency')).toHaveValue('EUR')
  await expect(page.getByLabel('To currency')).toHaveValue('PLN')
  await expect(page.getByRole('textbox', { name: 'To' })).toHaveValue('1.09')
})

test('shows an error when conversion fails', async ({ page }) => {
  await mockApis(page, false)
  await page.goto('/')

  await expect(page.getByText('Could not convert currencies.')).toBeVisible()
})
