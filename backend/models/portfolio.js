const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    stockSymbol: { 
        type: String, 
        required: true, 
        uppercase: true 
    },
    quantity: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    averagePrice: { 
        type: Number, 
        required: true, 
        default: 0 
    }
});

// Prevent duplicate entries for the same stock
portfolioSchema.index({ user: 1, stockSymbol: 1 }, { unique: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);