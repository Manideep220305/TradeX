const express = require('express');
const router = express.Router();
const { mockPaymentSuccess } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/mock-success', protect, mockPaymentSuccess);

module.exports = router;