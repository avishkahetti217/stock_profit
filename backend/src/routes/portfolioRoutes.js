import express from 'express';
import {
  getPortfolio,
  addPurchase,
  sellHolding,
  resetPortfolio,
} from '../controllers/portfolioController.js';

const router = express.Router();

router.get('/', getPortfolio);
router.post('/purchases', addPurchase);
router.post('/sales', sellHolding);
router.delete('/reset', resetPortfolio);

export default router;

