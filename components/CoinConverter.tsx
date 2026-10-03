'use client'

import { ArrowLeftRight } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'

interface CoinConverterProps {
  symbol: string
  price: number
}

const formatCoinAmount = (value: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(value)

const CoinConverter = ({ symbol, price }: CoinConverterProps) => {
  const [amount, setAmount] = useState('')
  const [isCoinToUsd, setIsCoinToUsd] = useState(true)
  const parsedAmount = amount.trim() === '' ? Number.NaN : Number(amount)
  const isValid = Number.isFinite(parsedAmount) && parsedAmount >= 0 && price > 0
  const convertedAmount = isValid
    ? isCoinToUsd
      ? parsedAmount * price
      : parsedAmount / price
    : Number.NaN
  const result = Number.isFinite(convertedAmount)
    ? isCoinToUsd
      ? formatCurrency(convertedAmount)
      : `${formatCoinAmount(convertedAmount)} ${symbol.toUpperCase()}`
    : '-'

  return (
    <section className="rounded-lg bg-dark-500 p-5">
      <h4 className="mb-4 text-xl font-semibold">Converter</h4>
      <div className="flex flex-wrap items-end gap-3">
        <label htmlFor="coin-converter-amount" className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-sm text-purple-100">Amount ({isCoinToUsd ? symbol.toUpperCase() : 'USD'})</span>
          <input
            id="coin-converter-amount"
            type="number"
            min={0}
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-11 min-w-0 rounded-md border border-dark-400 bg-dark-700 px-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          />
        </label>
        <button
          type="button"
          onClick={() => setIsCoinToUsd((current) => !current)}
          aria-label="Switch conversion direction"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-dark-400 px-3 text-sm font-medium text-purple-100 hover:text-white"
        >
          <ArrowLeftRight size={16} aria-hidden="true" />
          {isCoinToUsd ? `${symbol.toUpperCase()} to USD` : `USD to ${symbol.toUpperCase()}`}
        </button>
      </div>
      <p className="mt-4 text-lg font-semibold text-white" aria-live="polite">
        {result}
      </p>
    </section>
  )
}

export default CoinConverter