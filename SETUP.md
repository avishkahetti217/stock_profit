# Stock Profit Tracker - Full Setup Guide

Complete guide to set up the Stock Profit Tracker with PostgreSQL backend.

## Prerequisites

- Node.js installed
- PostgreSQL installed and running
- npm or yarn

## Step 1: Database Setup

1. **Create the database:**
   ```bash
   createdb stock_tracker
   ```
   Or using psql:
   ```bash
   psql postgres
   CREATE DATABASE stock_tracker;
   \q
   ```

2. **Grant permissions (if needed):**
   ```bash
   psql -U postgres -d stock_tracker
   ```
   Then:
   ```sql
   ALTER DATABASE stock_tracker OWNER TO your_username;
   \q
   ```

## Step 2: Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your PostgreSQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stock_tracker
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   PORT=3001
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Run database migration:**
   ```bash
   npm run db:migrate
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

## Step 3: Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## Step 4: Verify Setup

1. **Check backend is running:**
   - Visit `http://localhost:3001/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check database:**
   ```bash
   psql -U your_username -d stock_tracker -c "SELECT COUNT(*) FROM holdings; SELECT COUNT(*) FROM sales;"
   ```

3. **Test the app:**
   - Open `http://localhost:5173`
   - Add a purchase
   - Check database to verify data is stored

## API Endpoints

- `GET /api/portfolio` - Get all holdings and sales
- `POST /api/portfolio/purchases` - Add a new purchase
- `POST /api/portfolio/sales` - Record a sale
- `DELETE /api/portfolio/reset` - Reset all data

## Troubleshooting

### Database Connection Issues

- **Error: "password must be a string"**
  - Make sure `.env` file exists in `backend/` directory
  - If no password needed, leave `DB_PASSWORD=` empty

- **Error: "permission denied for schema public"**
  - Grant permissions: `ALTER DATABASE stock_tracker OWNER TO your_username;`
  - Or run: `psql -U postgres -d stock_tracker -c "GRANT ALL ON SCHEMA public TO your_username;"`

### Backend Not Starting

- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep stock_tracker`
- Check `.env` file has correct credentials

### Frontend Can't Connect to Backend

- Verify backend is running on port 3001
- Check CORS_ORIGIN in backend `.env` matches frontend URL
- Check browser console for CORS errors

## Project Structure

```
stock-profit-tracker/
├── backend/
│   ├── src/
│   │   ├── db/          # Database connection & migrations
│   │   ├── models/      # Database models
│   │   ├── controllers/ # API controllers
│   │   ├── routes/      # API routes
│   │   └── server.js    # Express server
│   ├── .env             # Environment variables
│   └── package.json
├── src/
│   ├── services/        # API service layer
│   ├── hooks/           # React hooks
│   └── ...
└── package.json
```

## Next Steps

- Add authentication (optional)
- Add data validation
- Add error handling UI
- Deploy to production

