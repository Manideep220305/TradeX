const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio, resetAccount , getTransactions } = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/buy', protect, buyStock);
router.post('/sell', protect, sellStock);
router.get('/portfolio', protect, getPortfolio);

// NEW: Reset Route
router.delete('/reset', protect, resetAccount);

router.get('/history',protect,getTransactions);

module.exports = router;