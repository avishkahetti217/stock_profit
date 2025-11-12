import { useEffect, useMemo, useState } from 'react';
import { formatISO } from 'date-fns';
import { formatCurrency } from '../utils/format.js';

const today = () => formatISO(new Date(), { representation: 'date' });

const formDefaults = {
  holdingId: '',
  quantity: '',
  salePrice: '',
  saleDate: today(),
};

export function SellForm({ holdings, onSubmit }) {
  const [form, setForm] = useState(formDefaults);

  useEffect(() => {
    if (!form.holdingId && holdings.length > 0) {
      const first = holdings[0];
      setForm((prev) => ({
        ...prev,
        holdingId: first.id,
        quantity: String(first.quantity),
      }));
    }
  }, [holdings, form.holdingId]);

  const selectedHolding = useMemo(
    () => holdings.find((holding) => holding.id === form.holdingId),
    [holdings, form.holdingId],
  );

  const isValid = useMemo(() => {
    const quantity = Number.parseFloat(form.quantity);
    const salePrice = Number.parseFloat(form.salePrice);
    return Boolean(selectedHolding) && quantity > 0 && salePrice > 0 && Boolean(form.saleDate);
  }, [form.quantity, form.salePrice, form.saleDate, selectedHolding]);

  const potentialProceeds = useMemo(() => {
    if (!selectedHolding) return null;
    const quantity = Number.parseFloat(form.quantity);
    const salePrice = Number.parseFloat(form.salePrice);
    if (!Number.isFinite(quantity) || !Number.isFinite(salePrice)) return null;
    return salePrice * Math.min(quantity, selectedHolding.quantity);
  }, [form.quantity, form.salePrice, selectedHolding]);

  const potentialProfit = useMemo(() => {
    if (!selectedHolding || potentialProceeds === null) return null;
    const quantity = Math.min(Number.parseFloat(form.quantity), selectedHolding.quantity);
    const costBasis = quantity * selectedHolding.averageCost;
    return potentialProceeds - costBasis;
  }, [form.quantity, potentialProceeds, selectedHolding]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'holdingId') {
      const nextHolding = holdings.find((holding) => holding.id === value);
      if (nextHolding) {
        setForm((prev) => ({
          ...prev,
          quantity: String(nextHolding.quantity),
        }));
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid || !selectedHolding) return;

    onSubmit({
      holdingId: selectedHolding.id,
      quantity: Number.parseFloat(form.quantity),
      salePrice: Number.parseFloat(form.salePrice),
      saleDate: form.saleDate,
    });

    const nextDefault = holdings.find((holding) => holding.id !== selectedHolding.id);
    setForm(
      nextDefault
        ? {
            ...formDefaults,
            holdingId: nextDefault.id,
            quantity: String(nextDefault.quantity),
          }
        : formDefaults,
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid two">
        <label>
          Holding
          <select
            name="holdingId"
            value={form.holdingId}
            onChange={handleChange}
            required
            disabled={holdings.length === 0}
          >
            {holdings.length === 0 ? (
              <option value="">No holdings available</option>
            ) : null}
            {holdings.map((holding) => (
              <option key={holding.id} value={holding.id}>
                {holding.symbol} · {holding.quantity} shares @ {formatCurrency(holding.averageCost)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantity to Sell
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={handleChange}
            required
            disabled={!selectedHolding}
          />
        </label>
      </div>
      <div className="form-grid two">
        <label>
          Sale Price per Share
          <input
            name="salePrice"
            type="number"
            min="0"
            step="0.01"
            value={form.salePrice}
            onChange={handleChange}
            required
            disabled={!selectedHolding}
          />
        </label>
        <label>
          Sale Date
          <input
            name="saleDate"
            type="date"
            value={form.saleDate}
            onChange={handleChange}
            required
            disabled={!selectedHolding}
          />
        </label>
      </div>
      {selectedHolding ? (
        <div className="muted">
          {potentialProceeds !== null ? (
            <>
              Est. proceeds: <strong>{formatCurrency(potentialProceeds)}</strong> · Est. profit:{' '}
              <strong
                className={`profit ${potentialProfit >= 0 ? 'positive' : 'negative'}`}
              >
                {formatCurrency(potentialProfit)}
              </strong>
            </>
          ) : (
            <>Enter a sale price to preview proceeds.</>
          )}
        </div>
      ) : null}
      <button type="submit" disabled={!isValid}>
        Record Sale
      </button>
    </form>
  );
}



