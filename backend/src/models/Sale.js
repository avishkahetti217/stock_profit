import pool from '../db/connection.js';

export class Sale {
  static async findAll() {
    const result = await pool.query(
      `SELECT 
        id, 
        holding_id as "holdingId",
        symbol, 
        quantity, 
        sale_price as "salePrice", 
        proceeds, 
        profit, 
        purchase_date as "purchaseDate", 
        sale_date as "saleDate"
      FROM sales 
      ORDER BY sale_date DESC, created_at DESC`
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT 
        id, 
        holding_id as "holdingId",
        symbol, 
        quantity, 
        sale_price as "salePrice", 
        proceeds, 
        profit, 
        purchase_date as "purchaseDate", 
        sale_date as "saleDate"
      FROM sales 
      WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ holdingId, symbol, quantity, salePrice, proceeds, profit, purchaseDate, saleDate }) {
    const result = await pool.query(
      `INSERT INTO sales (holding_id, symbol, quantity, sale_price, proceeds, profit, purchase_date, sale_date) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, holding_id as "holdingId", symbol, quantity, sale_price as "salePrice", proceeds, profit, purchase_date as "purchaseDate", sale_date as "saleDate"`,
      [holdingId, symbol.toUpperCase(), quantity, salePrice, proceeds, profit, purchaseDate, saleDate]
    );
    return result.rows[0];
  }

  static async getTotalProfit() {
    const result = await pool.query('SELECT COALESCE(SUM(profit), 0) as total FROM sales');
    return parseFloat(result.rows[0].total);
  }
}

