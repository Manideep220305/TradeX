const mongoose = require('mongoose');

const tradeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    stockSymbol: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    priceAtTrade: { 
      type: Number,
      required: true,
    },
    totalAmount: { // quantity * price
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['BUY', 'SELL'], // Essential for calculating holdings
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trade', tradeSchema);