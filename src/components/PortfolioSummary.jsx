import { formatCurrency } from '../utils/format.js';

export function PortfolioSummary({ totalProfit, holdingsCount, openShares }) {
  const profitClass = totalProfit >= 0 ? 'positive' : 'negative';

  return (
    <section className="summary-card">
      <div>
        <p>Total Realized Profit</p>
        <div className={`summary-value ${profitClass}`}>{formatCurrency(totalProfit)}</div>
      </div>
      <div className="stack">
        <span className="muted">Open Positions · {holdingsCount}</span>
        <span className="muted">Shares Held · {openShares}</span>
      </div>
    </section>
  );
}



