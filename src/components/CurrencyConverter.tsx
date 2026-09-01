import { useState } from 'react'
import { useConversion } from '../lib/useConversion.ts'
import { useCurrencies } from '../lib/useCurrencies.ts'
import swapIcon from '../assets/swap.svg'
import { AmountInput } from './AmountInput.tsx'
import { CurrencySelect } from './CurrencySelect.tsx'

function formatValue(value: number) {
  return value.toLocaleString('en-US', {
    maximumFractionDigits: 6,
    useGrouping: false,
  })
}

export function CurrencyConverter() {
  const { currencies, loading: currenciesLoading, error: currenciesError } = useCurrencies()
  const [fromCode, setFromCode] = useState('PLN')
  const [toCode, setToCode] = useState('EUR')
  const [amount, setAmount] = useState('1')
  const {
    value,
    loading: converting,
    error: convertError,
  } = useConversion(fromCode, toCode, amount)

  function swap() {
    setFromCode(toCode)
    setToCode(fromCode)
  }

  const parsedAmount = Number(amount)
  const rate = value !== null && parsedAmount > 0 ? value / parsedAmount : null

  return (
    <section className="converter">
      <h1>Currency converter</h1>

      {currenciesError ? <p className="error">{currenciesError}</p> : null}

      <div className="row">
        <AmountInput id="from-amount" label="From" value={amount} onChange={setAmount} />
        <CurrencySelect
          id="from-currency"
          label="From currency"
          value={fromCode}
          currencies={currencies}
          disabled={currenciesLoading || currencies.length === 0}
          onChange={setFromCode}
        />
      </div>

      <div className="swap">
        <button type="button" aria-label="Swap currencies" onClick={swap}>
          <img src={swapIcon} alt="switch" width={20} height={20} />
        </button>
      </div>

      <div className="row">
        <AmountInput
          id="to-amount"
          label="To"
          value={value === null ? '' : formatValue(value)}
          readOnly
        />
        <CurrencySelect
          id="to-currency"
          label="To currency"
          value={toCode}
          currencies={currencies}
          disabled={currenciesLoading || currencies.length === 0}
          onChange={setToCode}
        />
      </div>

      {converting ? <p className="status">Converting…</p> : null}
      {convertError ? <p className="error">{convertError}</p> : null}
      {rate !== null && !convertError ? (
        <p className="rate">
          1 {fromCode} = {formatValue(rate)} {toCode}
        </p>
      ) : null}
    </section>
  )
}
