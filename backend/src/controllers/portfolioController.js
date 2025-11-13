import { Holding } from '../models/Holding.js';
import { Sale } from '../models/Sale.js';

export const getPortfolio = async (req, res) => {
  try {
    const [holdings, sales] = await Promise.all([
      Holding.findAll(),
      Sale.findAll(),
    ]);

    const totalProfit = await Sale.getTotalProfit();

    res.json({
      holdings,
      sales,
      totalProfit,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ error: 'Failed to fetch portfolio' });
  }
};

export const addPurchase = async (req, res) => {
  try {
    const { symbol, quantity, averageCost, purchaseDate } = req.body;

    if (!symbol || !quantity || !averageCost || !purchaseDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingHolding = await Holding.findBySymbol(symbol);

    if (existingHolding) {
      // Merge with existing holding - calculate weighted average
      const totalQuantity = parseFloat(existingHolding.quantity) + parseFloat(quantity);
      const totalCost = parseFloat(existingHolding.averageCost) * parseFloat(existingHolding.quantity) + 
                       parseFloat(averageCost) * parseFloat(quantity);
      const newAverageCost = totalQuantity === 0 ? 0 : totalCost / totalQuantity;

      // Use earliest purchase date
      const earliestDate = existingHolding.purchaseDate && purchaseDate
        ? [existingHolding.purchaseDate, purchaseDate].sort()[0]
        : purchaseDate || existingHolding.purchaseDate;

      const updated = await Holding.update(existingHolding.id, {
        quantity: totalQuantity,
        averageCost: parseFloat(newAverageCost.toFixed(2)),
        purchaseDate: earliestDate,
      });

      return res.json(updated);
    }

    const newHolding = await Holding.create({
      symbol,
      quantity: parseFloat(quantity),
      averageCost: parseFloat(averageCost),
      purchaseDate,
    });

    res.status(201).json(newHolding);
  } catch (error) {
    console.error('Error adding purchase:', error);
    res.status(500).json({ error: 'Failed to add purchase' });
  }
};

export const sellHolding = async (req, res) => {
  try {
    const { holdingId, quantity, salePrice, saleDate } = req.body;

    if (!holdingId || !quantity || !salePrice || !saleDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const holding = await Holding.findById(holdingId);
    if (!holding) {
      return res.status(404).json({ error: 'Holding not found' });
    }

    const quantityToSell = Math.max(0, Math.min(parseFloat(quantity), parseFloat(holding.quantity)));
    if (quantityToSell === 0) {
      return res.status(400).json({ error: 'Invalid quantity to sell' });
    }

    const proceeds = quantityToSell * parseFloat(salePrice);
    const costBasis = quantityToSell * parseFloat(holding.averageCost);
    const profit = proceeds - costBasis;

    const remainingQuantity = parseFloat(holding.quantity) - quantityToSell;

    // Update or delete holding
    if (remainingQuantity > 0) {
      await Holding.updateQuantity(holdingId, remainingQuantity);
    } else {
      await Holding.delete(holdingId);
    }

    // Create sale record
    const sale = await Sale.create({
      holdingId,
      symbol: holding.symbol,
      quantity: quantityToSell,
      salePrice: parseFloat(salePrice),
      proceeds: parseFloat(proceeds.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      purchaseDate: holding.purchaseDate,
      saleDate,
    });

    res.status(201).json(sale);
  } catch (error) {
    console.error('Error selling holding:', error);
    res.status(500).json({ error: 'Failed to sell holding' });
  }
};

export const resetPortfolio = async (req, res) => {
  try {
    const pool = (await import('../db/connection.js')).default;
    await pool.query('TRUNCATE TABLE sales, holdings RESTART IDENTITY CASCADE');
    res.json({ message: 'Portfolio reset successfully' });
  } catch (error) {
    console.error('Error resetting portfolio:', error);
    res.status(500).json({ error: 'Failed to reset portfolio' });
  }
};

