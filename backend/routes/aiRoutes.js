const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware'); // <--- IMPORT THIS

// ✅ Add 'protect' here so req.user works in the controller
router.post('/chat', protect, chatWithAI);

module.exports = router;