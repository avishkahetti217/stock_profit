import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'stock-profit-tracker::portfolio';

const PortfolioContext = createContext(null);

const initialState = {
  holdings: [],
  sales: [],
};

const sanitizeState = (state) => {
  if (!state || typeof state !== 'object') {
    return initialState;
  }

  const holdings = Array.isArray(state.holdings) ? state.holdings : [];
  const sales = Array.isArray(state.sales) ? state.sales : [];
  return {
    holdings: holdings.map((holding) => ({
      id: holding.id ?? nanoid(),
      symbol: holding.symbol,
      quantity: Number.parseFloat(holding.quantity) || 0,
      averageCost: Number.parseFloat(holding.averageCost) || 0,
      purchaseDate: holding.purchaseDate ?? null,
    })),
    sales: sales.map((sale) => ({
      id: sale.id ?? nanoid(),
      holdingId: sale.holdingId ?? null,
      symbol: sale.symbol,
      quantity: Number.parseFloat(sale.quantity) || 0,
      salePrice: Number.parseFloat(sale.salePrice) || 0,
      proceeds: Number.parseFloat(sale.proceeds) || 0,
      profit: Number.parseFloat(sale.profit) || 0,
      purchaseDate: sale.purchaseDate ?? null,
      saleDate: sale.saleDate ?? null,
    })),
  };
};

const loadState = () => {
  if (typeof window === 'undefined') {
    return initialState;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialState;
    const parsed = JSON.parse(stored);
    return sanitizeState(parsed);
  } catch (error) {
    console.error('Failed to read portfolio from storage', error);
    return initialState;
  }
};

const portfolioReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PURCHASE': {
      const { symbol, quantity, averageCost, purchaseDate } = action.payload;
      const existing = state.holdings.find(
        (holding) => holding.symbol.toUpperCase() === symbol.toUpperCase(),
      );

      if (existing) {
        const totalQuantity = existing.quantity + quantity;
        const totalCost = existing.averageCost * existing.quantity + averageCost * quantity;
        const average = totalQuantity === 0 ? 0 : totalCost / totalQuantity;

        const updatedHoldings = state.holdings.map((holding) =>
          holding.id === existing.id
            ? {
                ...holding,
                quantity: totalQuantity,
                averageCost: Number.parseFloat(average.toFixed(2)),
                purchaseDate:
                  holding.purchaseDate && purchaseDate
                    ? [holding.purchaseDate, purchaseDate].sort()[0]
                    : purchaseDate ?? holding.purchaseDate,
              }
            : holding,
        );

        return {
          ...state,
          holdings: updatedHoldings,
        };
      }

      const nextHolding = {
        id: nanoid(),
        symbol,
        quantity,
        averageCost,
        purchaseDate: purchaseDate ?? null,
      };

      return {
        ...state,
        holdings: [...state.holdings, nextHolding],
      };
    }

    case 'SELL_HOLDING': {
      const { holdingId, quantity, salePrice, saleDate } = action.payload;
      const holding = state.holdings.find((item) => item.id === holdingId);
      if (!holding) {
        return state;
      }

      const quantityToSell = Math.max(0, Math.min(quantity, holding.quantity));
      if (quantityToSell === 0) {
        return state;
      }

      const proceeds = quantityToSell * salePrice;
      const costBasis = quantityToSell * holding.averageCost;
      const profit = proceeds - costBasis;

      const remainingQuantity = holding.quantity - quantityToSell;
      const updatedHoldings =
        remainingQuantity > 0
          ? state.holdings.map((item) =>
              item.id === holdingId
                ? {
                    ...item,
                    quantity: Number.parseFloat(remainingQuantity.toFixed(4)),
                  }
                : item,
            )
          : state.holdings.filter((item) => item.id !== holdingId);

      const saleRecord = {
        id: nanoid(),
        holdingId,
        symbol: holding.symbol,
        quantity: quantityToSell,
        salePrice,
        proceeds: Number.parseFloat(proceeds.toFixed(2)),
        profit: Number.parseFloat(profit.toFixed(2)),
        purchaseDate: holding.purchaseDate ?? null,
        saleDate,
      };

      return {
        holdings: updatedHoldings,
        sales: [saleRecord, ...state.sales],
      };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
};

export function PortfolioProvider({ children }) {
  const [state, dispatch] = useReducer(portfolioReducer, initialState, loadState);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.stringify(state);
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (error) {
      console.error('Failed to persist portfolio to storage', error);
    }
  }, [state]);

  const addPurchase = useCallback(
    (payload) => {
      dispatch({
        type: 'ADD_PURCHASE',
        payload: {
          symbol: payload.symbol,
          quantity: payload.quantity,
          averageCost: payload.averageCost,
          purchaseDate: payload.purchaseDate,
        },
      });
    },
    [dispatch],
  );

  const sellHolding = useCallback(
    (payload) => {
      dispatch({
        type: 'SELL_HOLDING',
        payload: {
          holdingId: payload.holdingId,
          quantity: payload.quantity,
          salePrice: payload.salePrice,
          saleDate: payload.saleDate,
        },
      });
    },
    [dispatch],
  );

  const totalProfit = useMemo(
    () => state.sales.reduce((sum, sale) => sum + sale.profit, 0),
    [state.sales],
  );

  const value = useMemo(
    () => ({
      holdings: state.holdings,
      sales: state.sales,
      totalProfit,
      addPurchase,
      sellHolding,
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state.holdings, state.sales, totalProfit, addPurchase, sellHolding],
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


