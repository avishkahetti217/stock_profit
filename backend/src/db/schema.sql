-- Create holdings table
CREATE TABLE IF NOT EXISTS holdings (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) NOT NULL,
  quantity DECIMAL(15, 4) NOT NULL CHECK (quantity >= 0),
  average_cost DECIMAL(15, 2) NOT NULL CHECK (average_cost >= 0),
  purchase_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  holding_id INTEGER REFERENCES holdings(id) ON DELETE SET NULL,
  symbol VARCHAR(10) NOT NULL,
  quantity DECIMAL(15, 4) NOT NULL CHECK (quantity > 0),
  sale_price DECIMAL(15, 2) NOT NULL CHECK (sale_price >= 0),
  proceeds DECIMAL(15, 2) NOT NULL CHECK (proceeds >= 0),
  profit DECIMAL(15, 2) NOT NULL,
  purchase_date DATE,
  sale_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on holdings symbol for faster lookups
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);

-- Create index on sales symbol and date for queries
CREATE INDEX IF NOT EXISTS idx_sales_symbol ON sales(symbol);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

