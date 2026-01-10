const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    walletBalance: {
        type: Number,
        default: 50000 // Free ₹50k demo money
    },
    // --- NEW PRO FEATURES ---
    isPro: {
        type: Boolean,
        default: false // Everyone starts as Free
    },
    subscriptionExpiry: {
        type: Date,
        default: null
    },
    razorpayCustomerId: {
        type: String, // We will store the Razorpay ID here later
        default: null
    },
    watchlist: [{
        symbol: { type: String, required: true },
        name: { type: String } // Storing name so we don't have to fetch it every time
    }]
}, { timestamps: true });

// Password Encryption Hook
// Password Encryption Hook (Modern Async Version)
userSchema.pre('save', async function() {
    // If password is not modified, simply return (exit function)
    if (!this.isModified('password')) {
        return;
    }
    
    // Otherwise, encrypt the new password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
// Password Verification Method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);