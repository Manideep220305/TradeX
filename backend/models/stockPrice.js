const mongoose = require('mongoose');

const stockPriceSchema = new mongoose.Schema({
    symbol: { type: String, required: true, unique: true, uppercase: true },
    price: { type: Number, required: true },
    change: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockPrice', stockPriceSchema);