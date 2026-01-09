const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
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
    transactionType: { 
      type: String, 
      enum: ['BUY', 'SELL'], 
      required: true 
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    }
  },
  {
    timestamps: true, // <--- Plural "timestamps" ensures Date is saved
  }
);

module.exports = mongoose.model('Order', orderSchema);