import { useMemo, useState } from 'react';
import { formatISO } from 'date-fns';

const today = () => formatISO(new Date(), { representation: 'date' });

const initialState = {
  symbol: '',
  quantity: '',
  averageCost: '',
  purchaseDate: today(),
};

export function PurchaseForm({ onSubmit }) {
  const [form, setForm] = useState(initialState);
  const [isDirty, setIsDirty] = useState(false);

  const isValid = useMemo(() => {
    const { symbol, quantity, averageCost, purchaseDate } = form;
    return (
      symbol.trim().length >= 1 &&
      Number.parseFloat(quantity) > 0 &&
      Number.parseFloat(averageCost) > 0 &&
      Boolean(purchaseDate)
    );
  }, [form]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (!isDirty) {
      setIsDirty(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isValid) return;

    onSubmit({
      symbol: form.symbol.trim().toUpperCase(),
      quantity: Number.parseFloat(form.quantity),
      averageCost: Number.parseFloat(form.averageCost),
      purchaseDate: form.purchaseDate,
    });

    setForm(initialState);
    setIsDirty(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-grid two">
        <label>
          Ticker Symbol
          <input
            name="symbol"
            placeholder="AAPL"
            value={form.symbol}
            onChange={handleChange}
            required
            autoComplete="off"
          />
        </label>
        <label>
          Quantity (shares)
          <input
            name="quantity"
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div className="form-grid two">
        <label>
          Average Cost per Share
          <input
            name="averageCost"
            type="number"
            min="0"
            step="0.01"
            value={form.averageCost}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Purchase Date
          <input
            name="purchaseDate"
            type="date"
            value={form.purchaseDate}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={!isDirty || !isValid}>
        Add Purchase
      </button>
    </form>
  );
}



