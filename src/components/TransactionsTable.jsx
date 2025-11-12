import { formatCurrency, formatDate } from '../utils/format.js';

export function TransactionsTable({ sales }) {
  if (sales.length === 0) {
    return <div className="empty-state">No realized profits yet. Record a sale to get started.</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Symbol</th>
          <th>Shares</th>
          <th>Sale Price</th>
          <th>Proceeds</th>
          <th>Profit</th>
          <th>Bought</th>
          <th>Sold</th>
        </tr>
      </thead>
      <tbody>
        {sales.map((sale) => (
          <tr key={sale.id}>
            <td>
              <span className="tag sell">{sale.symbol}</span>
            </td>
            <td>{sale.quantity}</td>
            <td>{formatCurrency(sale.salePrice)}</td>
            <td>{formatCurrency(sale.proceeds)}</td>
            <td className={`profit ${sale.profit >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(sale.profit)}
            </td>
            <td>{formatDate(sale.purchaseDate)}</td>
            <td>{formatDate(sale.saleDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}



