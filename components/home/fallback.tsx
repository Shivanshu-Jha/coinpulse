import DataTable from '@/components/DataTable'

const coinRows = Array.from({ length: 6 }, (_, id) => ({ id }))

const coinColumns: DataTableColumn<{ id: number }>[] = [
  {
    header: 'Name',
    cell: () => (
      <div className="name-link">
        <div className="skeleton name-image" />
        <div className="skeleton name-line" />
      </div>
    ),
  },
  {
    header: '24h Change',
    cell: () => (
      <div className="flex items-center gap-1">
        <div className="skeleton change-icon" />
        <div className="skeleton change-line" />
      </div>
    ),
  },
  {
    header: 'Price',
    cell: () => <div className="skeleton price-line" />,
  },
]

export const CoinOverviewFallback = () => (
  <div id="coin-overview-fallback" role="status" aria-label="Loading coin overview">
    <div className="header pt-3">
      <div className="skeleton header-image" />
      <div className="info">
        <div className="skeleton header-line-sm" />
        <div className="skeleton header-line-lg" />
      </div>
    </div>

    <div className="flex gap-2 py-3" aria-hidden="true">
      <div className="skeleton period-button-skeleton" />
      <div className="skeleton period-button-skeleton" />
      <div className="skeleton period-button-skeleton" />
    </div>

    <div className="chart" aria-hidden="true">
      <div className="skeleton chart-skeleton" />
    </div>
  </div>
)

export const TrendingCoinsFallback = () => (
  <div id="trending-coins-fallback" role="status" aria-label="Loading trending coins">
    <h4>Trending Coins</h4>
    <DataTable
      data={coinRows}
      columns={coinColumns}
      rowKey={(row) => row.id}
      tableClassName="trending-coins-table"
    />
  </div>
)