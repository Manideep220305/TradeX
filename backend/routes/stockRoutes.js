const express = require('express');
const router = express.Router();
const { getStockPrice } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

// Public or Protected? Protected is safer for rate limits.
router.get('/:symbol', protect, getStockPrice);
module.exports = router;