type AmountInputProps = {
  id: string
  label: string
  value: string
  readOnly?: boolean
  onChange?: (value: string) => void
}

export function AmountInput({ id, label, value, readOnly, onChange }: AmountInputProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        readOnly={readOnly}
        onChange={onChange ? (event) => onChange(event.target.value) : undefined}
      />
    </div>
  )
}
