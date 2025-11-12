import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { usePortfolio } from '../hooks/usePortfolio.jsx';
import { formatCurrency } from '../utils/format.js';
import { HoldingsTable } from '../components/HoldingsTable.jsx';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
  '#FFC658',
  '#FF7C7C',
  '#8DD1E1',
  '#D084D0',
];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function Portfolio() {
  const { holdings } = usePortfolio();

  const portfolioData = useMemo(() => {
    if (holdings.length === 0) {
      return { chartData: [], totalValue: 0 };
    }

    const chartData = holdings.map((holding) => {
      const value = holding.quantity * holding.averageCost;
      return {
        name: holding.symbol,
        value: value,
        quantity: holding.quantity,
        averageCost: holding.averageCost,
      };
    });

    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

    return {
      chartData: chartData.map((item) => ({
        ...item,
        percentage: totalValue > 0 ? (item.value / totalValue) * 100 : 0,
      })),
      totalValue,
    };
  }, [holdings]);

  if (holdings.length === 0) {
    return (
      <div className="app">
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          No holdings in your portfolio. Add some stocks to see your portfolio breakdown.
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <section className="panel">
        <h2>Portfolio Overview</h2>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Total Portfolio Value
          </div>
          <div style={{ fontSize: '2rem', color: '#0088FE' }}>
            {formatCurrency(portfolioData.totalValue)}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Holdings Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={portfolioData.chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioData.chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  formatCurrency(value),
                  'Value',
                ]}
                labelFormatter={(label) => `Symbol: ${label}`}
              />
              <Legend
                formatter={(value, entry) => {
                  const data = portfolioData.chartData.find((d) => d.name === value);
                  return `${value} (${data?.percentage.toFixed(1)}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="panel" style={{ marginTop: '1.75rem' }}>
        <h2>Holdings Details</h2>
        <HoldingsTable holdings={holdings} />
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Value</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.chartData.map((item, index) => (
                <tr key={item.name}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>{formatCurrency(item.value)}</td>
                  <td>{item.percentage.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


