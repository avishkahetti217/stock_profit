# Stock Profit Tracker

A lightweight React app for tracking share market trades, capturing both open positions and realised profits.

## Features

- Record equity purchases with symbol, date, share count, and average cost.
- Record sales against open positions, including sale price, sale date, and share quantity.
- Automatic profit calculation for each sale and an aggregate total of realised gains.
- Persistent state in `localStorage` so your trades remain after a refresh.
- Clean UI summarising open positions, realised trades, and total profit.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open the provided URL (default: [http://localhost:5173](http://localhost:5173)) in your browser.

## Usage

1. **Record a Purchase** — Enter the stock ticker, shares, average cost, and purchase date. Submitting adds/merges with an existing holding for the same symbol, keeping the weighted average cost.
2. **Record a Sale** — Choose an existing holding, set the number of shares to sell, sale price, and date. The app removes or reduces the holding, records the sale, and updates your total realised profit.
3. **Review** — Open positions and realised trades are shown in tables. The summary card highlights cumulative profit and live holdings.

> All data lives in your browser storage. Clearing site data resets the app.

## Tech Stack

- React 18 with Vite
- `date-fns` for date formatting
- `nanoid` for stable client-side IDs

## Next Ideas

- Import/export trades as CSV
- Support multiple portfolios or broker accounts
- Visualise performance over time with charts



