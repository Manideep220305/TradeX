const express = require('express');
const router = express.Router();
const {
    registerUser,
    authUser,
    getUserProfile,
    addStockToWatchlist,
    removeFromWatchlist
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

// Watchlist Routes
router.post('/watchlist', protect, addStockToWatchlist);
router.delete('/watchlist/:symbol', protect, removeFromWatchlist);

module.exports = router;