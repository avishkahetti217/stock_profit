import pool from '../db/connection.js';

export class Holding {
  static async findAll() {
    const result = await pool.query(
      'SELECT id, symbol, quantity, average_cost as "averageCost", purchase_date as "purchaseDate" FROM holdings ORDER BY symbol'
    );
    return result.rows;
  }

  static async findBySymbol(symbol) {
    const result = await pool.query(
      'SELECT id, symbol, quantity, average_cost as "averageCost", purchase_date as "purchaseDate" FROM holdings WHERE UPPER(symbol) = UPPER($1)',
      [symbol]
    );
    return result.rows[0] || null;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT id, symbol, quantity, average_cost as "averageCost", purchase_date as "purchaseDate" FROM holdings WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create({ symbol, quantity, averageCost, purchaseDate }) {
    const result = await pool.query(
      'INSERT INTO holdings (symbol, quantity, average_cost, purchase_date) VALUES ($1, $2, $3, $4) RETURNING id, symbol, quantity, average_cost as "averageCost", purchase_date as "purchaseDate"',
      [symbol.toUpperCase(), quantity, averageCost, purchaseDate]
    );
    return result.rows[0];
  }

  static async update(id, { quantity, averageCost, purchaseDate }) {
    const result = await pool.query(
      'UPDATE holdings SET quantity = $1, average_cost = $2, purchase_date = $3 WHERE id = $4 RETURNING id, symbol, quantity, average_cost as "averageCost", purchase_date as "purchaseDate"',
      [quantity, averageCost, purchaseDate, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM holdings WHERE id = $1', [id]);
  }

  static async updateQuantity(id, newQuantity) {
    const result = await pool.query(
      'UPDATE holdings SET quantity = $1 WHERE id = $2 RETURNING id, symbol, quantity, average_cost as "averageCost", purchase_date as "purchaseDate"',
      [newQuantity, id]
    );
    return result.rows[0];
  }
}

