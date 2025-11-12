import { format, parseISO } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
});

export const formatCurrency = (value) => currencyFormatter.format(value || 0);

export const formatDate = (value) => {
  if (!value) return '—';
  try {
    return format(parseISO(value), 'dd MMM yyyy');
  } catch (error) {
    return value;
  }
};

