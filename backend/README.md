# Stock Profit Tracker - Backend API

Backend API for the Stock Profit Tracker application using Node.js, Express, and PostgreSQL.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stock_tracker
   DB_USER=postgres
   DB_PASSWORD=your_password
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

3. **Create the database:**
   ```bash
   createdb stock_tracker
   ```
   Or using psql:
   ```sql
   CREATE DATABASE stock_tracker;
   ```

4. **Grant permissions (if needed):**
   ```bash
   psql -U postgres -d stock_tracker
   ```
   Then:
   ```sql
   ALTER DATABASE stock_tracker OWNER TO your_username;
   \q
   ```

5. **Run migrations:**
   ```bash
   npm run db:migrate
   ```

6. **Start the server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

### GET `/api/portfolio`
Get all holdings and sales with total profit.

**Response:**
```json
{
  "holdings": [...],
  "sales": [...],
  "totalProfit": 1234.56
}
```

### POST `/api/portfolio/purchases`
Add a new purchase/holding.

**Body:**
```json
{
  "symbol": "AAPL",
  "quantity": 10,
  "averageCost": 150.50,
  "purchaseDate": "2024-01-15"
}
```

### POST `/api/portfolio/sales`
Record a sale.

**Body:**
```json
{
  "holdingId": 1,
  "quantity": 5,
  "salePrice": 160.00,
  "saleDate": "2024-02-20"
}
```

### DELETE `/api/portfolio/reset`
Reset all portfolio data (deletes all holdings and sales).

## Database Schema

- **holdings**: Stores open positions
- **sales**: Stores completed sales with profit calculations

