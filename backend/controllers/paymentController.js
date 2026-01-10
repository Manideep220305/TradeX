const User = require('../models/User');

// @desc    Mock Payment Success
// @route   POST /api/payment/mock-success
const mockPaymentSuccess = async (req, res) => {
  try {
    // 1. Find the logged-in user
    const user = await User.findById(req.user._id);

    if (user) {
      // 2. Upgrade them to Pro
      user.isPro = true;
      await user.save();
      
      // 3. Send back the new user data (so frontend updates instantly)
      res.status(200).json({
        success: true,
        message: "Payment Successful! Plan upgraded to Pro.",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            walletBalance: user.walletBalance,
            isPro: user.isPro, 
            token: req.headers.authorization.split(' ')[1] 
        }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { mockPaymentSuccess };