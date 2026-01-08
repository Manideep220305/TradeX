const axios = require('axios');
const StockPrice = require('../models/stockPrice');

// @desc    Get Stock Price (Cached)
// @route   GET /api/stocks/:symbol
const getStockPrice = async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    const API_KEY = process.env.FINNHUB_API_KEY; // Make sure this is in your backend .env

    try {
        // 1. Check DB for fresh data (< 5 mins old)
        let stock = await StockPrice.findOne({ symbol });
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

        if (stock && stock.lastUpdated > fiveMinutesAgo) {
            // Cache Hit: Return DB data
            return res.json({ 
                price: stock.price, 
                change: stock.change, 
                source: 'cache' 
            });
        }

        // 2. Cache Miss: Fetch from Finnhub
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY}`);
        
        const price = response.data.c;
        const change = response.data.dp;

        // If API fails or limit reached (returns 0), return old data if we have it
        if (!price && stock) {
             return res.json({ price: stock.price, change: stock.change, source: 'stale_cache' });
        }

        // 3. Save/Update DB
        if (stock) {
            stock.price = price;
            stock.change = change;
            stock.lastUpdated = Date.now();
            await stock.save();
        } else {
            stock = await StockPrice.create({ symbol, price, change });
        }

        res.json({ price, change, source: 'api' });

    } catch (error) {
        // If everything fails, try to return whatever old data we have
        const stock = await StockPrice.findOne({ symbol });
        if (stock) {
            return res.json({ price: stock.price, change: stock.change, source: 'emergency_cache' });
        }
        res.status(500).json({ message: 'Price unavailable' });
    }
};

module.exports = { getStockPrice };