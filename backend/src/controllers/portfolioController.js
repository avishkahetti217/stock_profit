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

    // Ensure all values are properly parsed as numbers
    const salePriceNum = parseFloat(salePrice);
    const averageCostNum = parseFloat(holding.averageCost);
    const quantityNum = parseFloat(quantityToSell);
    const holdingQuantityNum = parseFloat(holding.quantity);
    
    // Calculate proceeds and profit
    const proceeds = quantityNum * salePriceNum;
    const costBasis = quantityNum * averageCostNum;
    const profit = proceeds - costBasis;
    
    const remainingQuantity = holdingQuantityNum - quantityNum;
    
    console.log('Sale calculation:', {
      holdingId,
      quantityToSell: quantityNum,
      salePrice: salePriceNum,
      averageCost: averageCostNum,
      proceeds: proceeds.toFixed(2),
      costBasis: costBasis.toFixed(2),
      profit: profit.toFixed(2),
      remainingQuantity: remainingQuantity.toFixed(4),
    });

    // Update or delete holding
    if (remainingQuantity > 0) {
      await Holding.updateQuantity(holdingId, remainingQuantity);
    } else {
      await Holding.delete(holdingId);
    }

    // Create sale record with properly rounded values
    const saleData = {
      holdingId: remainingQuantity > 0 ? holdingId : null, // Set to null if holding deleted
      symbol: holding.symbol,
      quantity: quantityNum,
      salePrice: salePriceNum,
      proceeds: parseFloat(proceeds.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      purchaseDate: holding.purchaseDate,
      saleDate,
    };
    
    console.log('Creating sale with data:', saleData);
    const sale = await Sale.create(saleData);
    console.log('Sale created successfully:', sale);

    // Return updated portfolio data immediately
    const [updatedHoldings, updatedSales] = await Promise.all([
      Holding.findAll(),
      Sale.findAll(),
    ]);

    const updatedTotalProfit = await Sale.getTotalProfit();
    
    console.log('Returning updated portfolio:', {
      holdingsCount: updatedHoldings.length,
      salesCount: updatedSales.length,
      totalProfit: updatedTotalProfit,
    });

    res.status(201).json({
      sale,
      portfolio: {
        holdings: updatedHoldings,
        sales: updatedSales,
        totalProfit: updatedTotalProfit,
      },
    });
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

