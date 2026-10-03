import CandleStickChart from '@/components/CandleStickChart'
import CoinConverter from '@/components/CoinConverter'
import DataTable from '@/components/DataTable'
import { PERIOD_CONFIG } from '@/constants'
import { fetcher } from '@/lib/coingecko.actions'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface CurrencyData {
    usd?: number | null
}

interface ExchangeTicker {
    market: {
        identifier: string | null
        name: string
        logo?: string | null
    }
    base: string
    target: string
    converted_last?: CurrencyData | null
    converted_volume?: CurrencyData | null
    trade_url?: string | null
}

interface CoinDetailsResponse {
    id: string
    name: string
    symbol: string
    image: { large: string }
    market_cap_rank: number | null
    market_data: {
        current_price: CurrencyData
        market_cap: CurrencyData
        total_volume: CurrencyData
        high_24h: CurrencyData
        low_24h: CurrencyData
        price_change_percentage_24h?: number | null
        price_change_percentage_7d?: number | null
        price_change_percentage_30d?: number | null
        ath: CurrencyData
        ath_change_percentage: CurrencyData
        circulating_supply: number | null
        max_supply: number | null
    }
    description?: { en?: string | null }
    links?: {
        homepage?: string[]
        blockchain_site?: string[]
        subreddit_url?: string | null
    }
    tickers?: ExchangeTicker[]
}

const nullableCurrency = (value: number | null | undefined) =>
    value == null ? '-' : formatCurrency(value)

const nullablePercentage = (value: number | null | undefined) =>
    value == null ? '-' : formatPercentage(value)

const nullableSupply = (value: number | null | undefined) =>
    value == null ? '-' : value.toLocaleString()

export default async function CoinDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const encodedId = encodeURIComponent(id)

    const coinRequest = fetcher<CoinDetailsResponse>(`/coins/${encodedId}`, {
        localization: 'false',
        tickers: 'true',
        market_data: 'true',
        community_data: 'false',
        developer_data: 'false',
        sparkline: 'false',
        include_exchange_logo: 'true',
    }).catch((error: unknown) => {
        if (error instanceof Error && /\b404\b/.test(error.message)) {
            notFound()
        }
        throw error
    })

    const ohlcRequest = fetcher<OHLCData[]>(`/coins/${encodedId}/ohlc`, {
        vs_currency: 'usd',
        days: PERIOD_CONFIG['daily'].days,
        precision: 'full',
    }).catch((error: unknown) => {
        console.error(`Failed to fetch OHLC data for ${id}`, error)
        return [] as OHLCData[]
    })

    const [coin, ohlc] = await Promise.all([coinRequest, ohlcRequest])
    const currentPrice = coin.market_data.current_price.usd ?? 0
    const change24h = coin.market_data.price_change_percentage_24h ?? 0
    const description = (coin.description?.en ?? '').replace(/<[^>]*>/g, '').trim()
    const about = description.length > 600
        ? `${description.slice(0, 597)}...`
        : description

    const stats = [
        { label: 'Market cap', value: nullableCurrency(coin.market_data.market_cap.usd) },
        { label: 'Rank', value: coin.market_cap_rank == null ? '-' : `#${coin.market_cap_rank}` },
        { label: '24h volume', value: nullableCurrency(coin.market_data.total_volume.usd) },
        { label: '24h high', value: nullableCurrency(coin.market_data.high_24h.usd) },
        { label: '24h low', value: nullableCurrency(coin.market_data.low_24h.usd) },
        { label: '7d change', value: nullablePercentage(coin.market_data.price_change_percentage_7d) },
        { label: '30d change', value: nullablePercentage(coin.market_data.price_change_percentage_30d) },
        { label: 'All-time high', value: nullableCurrency(coin.market_data.ath.usd) },
        { label: 'Change from ATH', value: nullablePercentage(coin.market_data.ath_change_percentage.usd) },
        { label: 'Circulating supply', value: nullableSupply(coin.market_data.circulating_supply) },
        { label: 'Max supply', value: nullableSupply(coin.market_data.max_supply) },
    ]

    const links = [
        { label: 'Website', url: coin.links?.homepage?.[0] ?? '' },
        { label: 'Blockchain explorer', url: coin.links?.blockchain_site?.[0] ?? '' },
        { label: 'Subreddit', url: coin.links?.subreddit_url ?? '' },
    ].filter(({ url }) => url.length > 0)

    const tickers = [...(coin.tickers ?? [])]
        .sort((left, right) =>
            (right.converted_volume?.usd ?? 0) - (left.converted_volume?.usd ?? 0),
        )
        .slice(0, 10)

    const tickerColumns: DataTableColumn<ExchangeTicker>[] = [
        {
            header: 'Exchange',
            cellClassName: 'exchange-name',
            cell: (ticker) => (
                <div className="flex items-center gap-2">
                    {ticker.market.logo ? (
                        <Image src={ticker.market.logo} alt="" width={24} height={24} className="rounded-full" />
                    ) : (
                        <span className="size-6 rounded-full bg-dark-400" aria-hidden="true" />
                    )}
                    <span>{ticker.market.name}</span>
                </div>
            ),
        },
        {
            header: 'Pair',
            cellClassName: 'pair',
            cell: (ticker) => (
                <div className="pair">
                    <p>{ticker.base}</p>
                    <span>/</span>
                    <p>{ticker.target}</p>
                </div>
            ),
        },
        {
            header: 'Price',
            cellClassName: 'price-cell',
            cell: (ticker) => nullableCurrency(ticker.converted_last?.usd),
        },
        {
            header: '24h volume',
            cellClassName: 'price-cell',
            cell: (ticker) => nullableCurrency(ticker.converted_volume?.usd),
        },
    ]

    return (
        <main className="main-container">
            <Link href="/coins" className="inline-flex items-center gap-2 text-purple-100 hover:text-white">
                <ArrowLeft size={16} aria-hidden="true" />
                Back to all coins
            </Link>

            <div id="coin-details-page">
                <section className="primary min-w-0">
                    <CandleStickChart data={ohlc} coinId={coin.id} initialPeriod="daily">
                        <div className="header items-center">
                            <Image src={coin.image.large} alt={coin.name} width={56} height={56} className="rounded-full" />
                            <div className="info min-w-0">
                                <p className="truncate">{coin.name} / {coin.symbol.toUpperCase()}</p>
                                <h1>{formatCurrency(currentPrice)}</h1>
                                <p className={cn('text-sm', change24h > 0 ? 'text-green-500' : 'text-red-500')}>
                                    {change24h > 0 ? '+' : ''}{formatPercentage(change24h)} (24h)
                                </p>
                            </div>
                        </div>
                    </CandleStickChart>

                    <section className="xl:col-span-3 mt-28">
                        <h4 className="mb-8 text-3xl font-semibold font-mono relaxed">About {coin.name}</h4>
                        <p className="text-purple-100 leading-relaxed">
                            {about || 'No description available.'}
                        </p>
                    </section>

                </section>

                <aside className="secondary space-y-6">
                    <CoinConverter symbol={coin.symbol} price={currentPrice} />

                    <section className="details">
                        <h4>Market stats</h4>
                        <ul className="details-grid">
                            {stats.map(({ label, value }) => (
                                <li key={label}>
                                    <span className="label">{label}</span>
                                    <strong>{value}</strong>
                                </li>
                            ))}
                        </ul>
                    </section>

                </aside>



                <section className="exchange-section xl:col-span-3">
                    <h4>Top exchange listings</h4>
                    <DataTable
                        tableClassName="exchange-table coins-table"
                        columns={tickerColumns}
                        data={tickers}
                        rowKey={(ticker, index) =>
                            `${ticker.market.identifier ?? ticker.market.name}-${ticker.base}-${ticker.target}-${index}`
                        }
                    />
                </section>
            </div>

        </main>
    )
}