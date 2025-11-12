import { formatCurrency, formatDate } from '../utils/format.js';

export function HoldingsTable({ holdings }) {
  if (holdings.length === 0) {
    return <div className="empty-state">No open positions right now.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Shares</th>
          <th>Avg. Cost</th>
          <th>Invested</th>
          <th>Purchased</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((holding) => (
          <tr key={holding.id}>
            <td>
              <strong>{holding.symbol}</strong>
            </td>
            <td>{holding.quantity}</td>
            <td>{formatCurrency(holding.averageCost)}</td>
            <td>{formatCurrency(holding.quantity * holding.averageCost)}</td>
            <td>{formatDate(holding.purchaseDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



