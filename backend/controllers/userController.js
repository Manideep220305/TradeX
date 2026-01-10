const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/user'); // Ensure this path matches your file structure (User.js vs user.js)

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/users/register
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // ✅ FIXED: Removed manual hashing here.
    // The User model's pre('save') hook handles the hashing automatically.
    const user = await User.create({
        name,
        email,
        password, // <--- Send plain password here
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            walletBalance: user.walletBalance,
            isPro: user.isPro,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/users/login
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // The matchPassword method is defined in your User model
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            walletBalance: user.walletBalance,
            isPro: user.isPro, // Return Pro status on login
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/users/profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            walletBalance: user.walletBalance,
            watchlist: user.watchlist,
            isPro: user.isPro // Include this so frontend knows if user is Pro
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Add stock to watchlist
// @route   POST /api/users/watchlist
const addStockToWatchlist = asyncHandler(async (req, res) => {
    const { symbol, name } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        const alreadyAdded = user.watchlist.find(s => s.symbol === symbol);

        if (alreadyAdded) {
            res.status(400);
            throw new Error('Stock already in watchlist');
        }

        user.watchlist.push({ symbol, name });
        await user.save();
        
        res.status(201).json(user.watchlist);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Remove stock from watchlist
// @route   DELETE /api/users/watchlist/:symbol
const removeFromWatchlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.watchlist = user.watchlist.filter(
            (item) => item.symbol !== req.params.symbol
        );
        
        await user.save();
        res.json({ message: 'Stock removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    authUser,
    getUserProfile,
    addStockToWatchlist,
    removeFromWatchlist,
};

/*
the order
-input
-check
-logic
-side effect-generate token
-response


get email & password
find user by email
if no user → error
compare password
if match → generate token
return user data

*/