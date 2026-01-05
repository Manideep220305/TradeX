const User = require('../models/user');
const jwt = require('jsonwebtoken');

// helper function to generate a jwt token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '500d' // token valid for 500 days
    });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // 1. check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists ' });
        }

        // 2. create user (password hashing happens automatically in the model)
        const user = await User.create({
            name,
            email,
            password
        });

        // 3. send response with token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const user = await User.findOne({ email });

        // 2. check password using the method we used in the model
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };



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