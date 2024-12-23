/** @deprecated use StableToken and Token */
export enum CURRENCY_ENUM {
  PLANQ = 'Planq',
  DOLLAR = 'Planq Dollar',
  EURO = 'Planq Euro',
}

export enum StableToken {
  pUSD = 'pUSD',
  pEUR = 'pEUR',
  pREAL = 'pREAL',
}

export enum Token {
  PLQ = 'PLQ',
}

export type PlanqTokenType = StableToken | Token

interface Currency {
  symbol: string
  code: string
  displayDecimals: number
}

type CurrencyObject = { [key in CURRENCY_ENUM]: Currency }

/** @deprecated */
export const CURRENCIES: CurrencyObject = {
  [CURRENCY_ENUM.PLANQ]: {
    symbol: '',
    code: 'cGLD',
    displayDecimals: 3,
  },
  [CURRENCY_ENUM.DOLLAR]: {
    symbol: '$',
    code: 'pUSD',
    displayDecimals: 2,
  },
  [CURRENCY_ENUM.EURO]: {
    symbol: '€',
    code: 'pEUR',
    displayDecimals: 2,
  },
}

export const resolveCurrency = (label: string): CURRENCY_ENUM => {
  if (label && label.toLowerCase().includes('dollar')) {
    return CURRENCY_ENUM.DOLLAR
  } else if (label && label.toLowerCase().includes('euro')) {
    return CURRENCY_ENUM.EURO
  } else if (label && label.toLowerCase().includes('planq')) {
    return CURRENCY_ENUM.PLANQ
  } else {
    console.info('Unable to resolve currency from label: ' + label)
    return CURRENCY_ENUM.DOLLAR
  }
}

/** @deprecated use StableToken and Token */
export enum SHORT_CURRENCIES {
  DOLLAR = 'dollar',
  PLANQ = 'planq',
  EURO = 'euro',
}

/** @deprecated use StableToken and Token */
export const currencyToShortMap = {
  [CURRENCY_ENUM.DOLLAR]: SHORT_CURRENCIES.DOLLAR,
  [CURRENCY_ENUM.PLANQ]: SHORT_CURRENCIES.PLANQ,
  [CURRENCY_ENUM.EURO]: SHORT_CURRENCIES.EURO,
}
