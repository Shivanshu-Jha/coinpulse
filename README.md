# CoinPulse 📈

A cryptocurrency tracking web app built with **Next.js** that shows market data, trending coins, categories, price charts and a coin converter, powered by the **CoinGecko API**.

**🌐 Live Demo:** [coinpulse](https://coinpulse-kappa-six.vercel.app/)
---

## ✨ Features

- 🏠 **Market overview** on the home page: coin overview, trending coins and top categories
- 🪙 **Coins list** with a data table and pagination
- 🔍 **Search modal** to quickly find any coin
- 📄 **Coin detail pages** (`/coins/[id]`) with market data for each coin
- 🕯️ **Candlestick price chart** for price history
- 💱 **Coin converter** to convert between a coin and currencies
- ⏳ **Loading fallbacks** while data is being fetched
- 📱 **Responsive UI** with Tailwind CSS and Shadcn UI

---

## 🛠️ Tech Stack

| Technology | Usage |
| --- | --- |
| Next.js (App Router) | Framework: routing, server rendering and data fetching |
| TypeScript | Type safety |
| CoinGecko API | Cryptocurrency market data |
| Tailwind CSS | Styling and responsive design |
| Shadcn UI | UI components (dialog, command, table, pagination, input) |

---

## 🏗️ Architecture

```
 Browser
   │
   ▼
 Next.js App Router (server components + client components)
   │
   ├── app/page.tsx            → Home: CoinOverview, TrendingCoins, Categories
   ├── app/coins/page.tsx      → Coins table with pagination
   └── app/coins/[id]/page.tsx → Coin details, candlestick chart, converter
   │
   ▼
 lib/coingecko.actions.ts      → Server-side functions that call the CoinGecko API
   │
   ▼
 CoinGecko API
```

**Data flow:** pages and components call the functions in `lib/coingecko.actions.ts` on the server, so the API key and base URL stay out of the browser. The data is passed to UI components (`DataTable`, `CandleStickChart`, `CoinConverter`), while interactive parts like search and the converter run as client components.

---

## 📁 Project Structure

```
coinpulse/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Home page
│   ├── globals.css
│   └── coins/
│       ├── page.tsx             # All coins list
│       └── [id]/page.tsx        # Single coin page
├── components/
│   ├── home/                    # CoinOverview, TrendingCoins, Categories, fallback
│   ├── CandleStickChart.tsx     # Price chart
│   ├── CoinConverter.tsx        # Currency converter
│   ├── CoinsPagination.tsx      # Pagination controls
│   ├── DataTable.tsx            # Reusable table
│   ├── Header.tsx
│   ├── SearchModal.tsx          # Command-palette style search
│   └── ui/                      # Shadcn UI primitives
├── lib/
│   ├── coingecko.actions.ts     # CoinGecko API calls
│   └── utils.ts
├── constants.ts                 # App constants
├── type.d.ts                    # Shared TypeScript types
└── next.config.ts
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A [CoinGecko API key](https://www.coingecko.com/en/api) (a free demo key works)

### 1. Clone the repo

```bash
git clone https://github.com/Shivanshu-Jha/CoinPulse.git
cd CoinPulse
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create `.env.local` in the root:

```env
# Names below are examples; make sure they match the ones used in your code
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_coingecko_api_key
```


### 4. Run the dev server

```bash
npm run dev
```




---

## 📸 Screenshots
### Home dashboard with candlestick chart
![Home](public/home-coinpulse.jpg)


