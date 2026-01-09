const Order = require('../models/order');
const Portfolio = require('../models/portfolio'); // You already have this
const User = require('../models/user');
const StockPrice = require('../models/stockPrice'); // <--- connecting to your real cache

// @desc    Buy Stock
// @route   POST /api/trade/buy
const buyStock = async (req, res) => {
    const { stockSymbol, quantity } = req.body;
    const userId = req.user._id; 

    try {
        // 1. Get REAL Price from DB Cache (or fallback to 150)
        const stockCache = await StockPrice.findOne({ symbol: stockSymbol });
        const currentPrice = stockCache ? stockCache.price : 150.00;
        
        const totalCost = currentPrice * quantity;

        // 2. Check Wallet Balance
        const user = await User.findById(userId);
        if (user.walletBalance < totalCost) {
            return res.status(400).json({ message: `Insufficient funds. Cost: ${totalCost.toFixed(2)}, Balance: ${user.walletBalance.toFixed(2)}` });
        }

        // 3. Create Order Record (History)
        const order = await Order.create({
            user: userId,
            stockSymbol,
            transactionType: 'BUY',
            quantity,
            price: currentPrice,
            totalAmount: totalCost
        });

        // 4. Update Portfolio (Holdings)
        let portfolioItem = await Portfolio.findOne({ user: userId, stockSymbol });

        if (portfolioItem) {
            // Calculate new average price (Weighted Average)
            const newQuantity = portfolioItem.quantity + Number(quantity);
            const totalValue = (portfolioItem.quantity * portfolioItem.averagePrice) + totalCost;
            const newAvgPrice = totalValue / newQuantity;

            portfolioItem.quantity = newQuantity;
            portfolioItem.averagePrice = newAvgPrice;
            await portfolioItem.save();
        } else {
            // First time buying
            await Portfolio.create({
                user: userId,
                stockSymbol,
                quantity,
                averagePrice: currentPrice
            });
        }

        // 5. Deduct Money
        user.walletBalance -= totalCost;
        await user.save();

        res.status(200).json({ 
            message: `Bought ${quantity} shares of ${stockSymbol}`, 
            order,
            newBalance: user.walletBalance 
        });

    } catch (error) {
        console.error("Buy Error:", error);
        res.status(500).json({ message: "Server Error during purchase" });
    }
};

// @desc    Sell Stock
// @route   POST /api/trade/sell
const sellStock = async (req, res) => {
    const { stockSymbol, quantity } = req.body;
    const userId = req.user._id;

    try {
        // 1. Get Real Price
        const stockCache = await StockPrice.findOne({ symbol: stockSymbol });
        const currentPrice = stockCache ? stockCache.price : 150.00;
        const totalValue = currentPrice * quantity;

        // 2. Check Ownership
        const portfolioItem = await Portfolio.findOne({ user: userId, stockSymbol });

        if (!portfolioItem || portfolioItem.quantity < quantity) {
            return res.status(400).json({ message: 'Not enough shares to sell' });
        }

        // 3. Create Order Record
        const order = await Order.create({
            user: userId,
            stockSymbol,
            transactionType: 'SELL',
            quantity,
            price: currentPrice,
            totalAmount: totalValue
        });

        // 4. Update Portfolio
        portfolioItem.quantity -= Number(quantity);
        
        if (portfolioItem.quantity === 0) {
            await Portfolio.deleteOne({ _id: portfolioItem._id });
        } else {
            await portfolioItem.save();
        }

        // 5. Add Money
        const user = await User.findById(userId);
        user.walletBalance += totalValue;
        await user.save();

        res.status(200).json({ 
            message: `Sold ${quantity} shares of ${stockSymbol}`, 
            order, 
            newBalance: user.walletBalance 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get User Portfolio
// @route   GET /api/trade/portfolio
const getPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.find({ user: req.user._id });
        res.status(200).json(portfolio);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ... keep buyStock, sellStock, and getPortfolio exactly as they are ...

// @desc    Reset Account (Delete all data & Reset Wallet)
// @route   DELETE /api/trade/reset
const resetAccount = async (req, res) => {
    const userId = req.user._id;

    try {
        // 1. Delete all history for this user
        await Order.deleteMany({ user: userId });
        await Portfolio.deleteMany({ user: userId });

        // 2. Reset Wallet to $50k
        const user = await User.findById(userId);
        user.walletBalance = 50000;
        await user.save();

        res.status(200).json({ message: 'Account Reset Successfully', newBalance: 50000 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// ... existing imports and functions ...

// @desc    Get Transaction History
// @route   GET /api/trade/history
// @access  Private
const getTransactions = async (req, res) => {
    try {
        // Find orders for this user, sorted by Newest First (-1)
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch history" });
    }
};

// Update module.exports at the very bottom
module.exports = { 
    buyStock, 
    sellStock, 
    getPortfolio, 
    resetAccount, 
    getTransactions // <--- Add this new one
};