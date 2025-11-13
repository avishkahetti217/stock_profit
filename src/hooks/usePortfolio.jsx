import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { portfolioAPI } from '../services/api.js';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [holdings, setHoldings] = useState([]);
  const [sales, setSales] = useState([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPortfolio = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await portfolioAPI.getPortfolio();
      setHoldings(data.holdings || []);
      setSales(data.sales || []);
      setTotalProfit(data.totalProfit || 0);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load portfolio data on mount
  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  const addPurchase = useCallback(async (payload) => {
    try {
      setError(null);
      await portfolioAPI.addPurchase({
        symbol: payload.symbol,
        quantity: payload.quantity,
        averageCost: payload.averageCost,
        purchaseDate: payload.purchaseDate,
      });
      // Reload portfolio to get updated data
      await loadPortfolio();
    } catch (err) {
      console.error('Failed to add purchase:', err);
      setError(err.message);
      throw err;
    }
  }, [loadPortfolio]);

  const sellHolding = useCallback(async (payload) => {
    try {
      setError(null);
      await portfolioAPI.sellHolding({
        holdingId: payload.holdingId,
        quantity: payload.quantity,
        salePrice: payload.salePrice,
        saleDate: payload.saleDate,
      });
      // Reload portfolio to get updated data
      await loadPortfolio();
    } catch (err) {
      console.error('Failed to sell holding:', err);
      setError(err.message);
      throw err;
    }
  }, [loadPortfolio]);

  const reset = useCallback(async () => {
    try {
      setError(null);
      await portfolioAPI.resetPortfolio();
      await loadPortfolio();
    } catch (err) {
      console.error('Failed to reset portfolio:', err);
      setError(err.message);
      throw err;
    }
  }, [loadPortfolio]);

  const value = useMemo(
    () => ({
      holdings,
      sales,
      totalProfit,
      loading,
      error,
      addPurchase,
      sellHolding,
      reset,
      refresh: loadPortfolio,
    }),
    [holdings, sales, totalProfit, loading, error, addPurchase, sellHolding, reset, loadPortfolio],
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}


