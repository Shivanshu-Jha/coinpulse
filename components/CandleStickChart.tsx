'use client'

import { getCandlestickConfig, getChartConfig, PERIOD_BUTTONS, PERIOD_CONFIG } from '@/constants'
import { fetcher } from '@/lib/coingecko.actions'
import { convertOHLCData } from '@/lib/utils'
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts'
import { useEffect, useRef, useState } from 'react'

const CandleStickChart = ({
    children,
    data,
    coinId,
    height = 360,
    initialPeriod = 'daily'
}: CandlestickChartProps) => {

    const chartContainerRef = useRef<HTMLDivElement | null>(null)
    const chartRef = useRef<IChartApi | null>(null)
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)

    const [period, setPeriod] = useState(initialPeriod)
    const [ohlcData, setOhlcData] = useState<OHLCData[]>(data ?? [])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchOHLCData = async (selectedPeriod: Period): Promise<boolean> => {
        try {
            const { days } = PERIOD_CONFIG[selectedPeriod]

            const newData = await fetcher<OHLCData[]>(`/coins/${coinId}/ohlc`, {
                vs_currency: 'usd',
                days,
                precision: 'full',
            })

            setOhlcData(newData ?? [])
            setError(null)
            return true
        } catch (e) {
            console.error('Failed to get OHLCData', e)
            setError('Could not load data for that period. Please try again.')
            return false
        }
    }

    const handlePeriodChange = async (newPeriod: Period) => {
        if (newPeriod === period || isLoading) return

        setIsLoading(true)
        const ok = await fetchOHLCData(newPeriod)
        if (ok) setPeriod(newPeriod) // only switch the active button if data loaded
        setIsLoading(false)
    }

    // 1. Create the chart (rebuild only if height changes)
    useEffect(() => {
        const container = chartContainerRef.current
        if (!container) return

        const chart = createChart(container, {
            ...getChartConfig(height, true),
            width: container.clientWidth,
        })
        const series = chart.addSeries(CandlestickSeries, getCandlestickConfig())

        chartRef.current = chart
        candleSeriesRef.current = series

        const observer = new ResizeObserver((entries) => {
            chart.applyOptions({ width: entries[0].contentRect.width })
        })
        observer.observe(container)

        return () => {
            observer.disconnect()
            chart.remove()
            chartRef.current = null
            candleSeriesRef.current = null
        }
    }, [height])

    // 2. Push data into the existing chart when data/period changes
    useEffect(() => {
        if (!candleSeriesRef.current || !chartRef.current) return

        const showTime = ['daily', 'weekly', 'monthly'].includes(period)
        chartRef.current.applyOptions({ timeScale: { timeVisible: showTime } })

        const convertedToSeconds = ohlcData.map((item) =>
            [
                Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]
            ] as OHLCData
        )

        candleSeriesRef.current.setData(convertOHLCData(convertedToSeconds))
        chartRef.current.timeScale().fitContent()
    }, [ohlcData, period, height])

    return (
        <div id='candlestick-chart'>
            <div className='chart-header'>
                <div className="flex-1">{children}</div>
                <div className="button-group">
                    <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
                    {PERIOD_BUTTONS.map(({ value, label }) => (
                        <button
                            key={value}
                            className={period === value ? 'config-button-active' : 'config-button'}
                            onClick={() => handlePeriodChange(value)}
                            disabled={isLoading}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            {error && (
                <p className="text-sm text-red-400 px-2 pb-2" role="alert">{error}</p>
            )}
            <div ref={chartContainerRef} className="chart" style={{ height }} />
        </div>
    )
}

export default CandleStickChart