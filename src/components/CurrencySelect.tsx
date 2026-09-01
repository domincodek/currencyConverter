import type { Currency } from '../api/types.ts'

type CurrencySelectProps = {
  id: string
  label: string
  value: string
  currencies: Currency[]
  disabled?: boolean
  onChange: (value: string) => void
}

export function CurrencySelect({
  id,
  label,
  value,
  currencies,
  disabled,
  onChange,
}: CurrencySelectProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {currencies.map((currency) => (
          <option key={currency.short_code} value={currency.short_code}>
            {currency.name} ({currency.short_code})
          </option>
        ))}
      </select>
    </div>
  )
}
