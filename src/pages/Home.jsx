import { useMemo } from 'react';
import { usePortfolio } from '../hooks/usePortfolio.jsx';
import { PortfolioSummary } from '../components/PortfolioSummary.jsx';
import { PurchaseForm } from '../components/PurchaseForm.jsx';
import { SellForm } from '../components/SellForm.jsx';
import { HoldingsTable } from '../components/HoldingsTable.jsx';
import { TransactionsTable } from '../components/TransactionsTable.jsx';

export function Home() {
  const { holdings, sales, totalProfit, addPurchase, sellHolding } = usePortfolio();

  const aggregate = useMemo(() => {
    return holdings.reduce(
      (acc, holding) => {
        acc.count += 1;
        acc.shares += holding.quantity;
        return acc;
      },
      { count: 0, shares: 0 },
    );
  }, [holdings]);

  return (
    <div className="app">
      <PortfolioSummary
        totalProfit={totalProfit}
        holdingsCount={aggregate.count}
        openShares={aggregate.shares}
      />

      <div className="grid">
        <section className="panel">
          <h2>Record a Purchase</h2>
          <PurchaseForm onSubmit={addPurchase} />
        </section>

        <section className="panel">
          <h2>Record a Sale</h2>
          <SellForm holdings={holdings} onSubmit={sellHolding} />
        </section>
      </div>

      <section className="panel" style={{ marginTop: '1.75rem' }}>
        <h2>Open Positions</h2>
        <HoldingsTable holdings={holdings} />
      </section>

      <section className="panel" style={{ marginTop: '1.25rem' }}>
        <h2>Realized Trades</h2>
        <TransactionsTable sales={sales} />
      </section>
    </div>
  );
}


