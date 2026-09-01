export type Currency = {
  short_code: string
  name: string
}

export type CurrenciesResponse = {
  response: Currency[]
}

export type ConvertResponse = {
  response: {
    value: number
  }
}
