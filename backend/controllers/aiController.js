const { GoogleGenerativeAI } = require("@google/generative-ai");
const Portfolio = require('../models/portfolio');

// @desc    Analyze Portfolio
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
    const { message } = req.body; 
    const userId = req.user._id;

    try {
        // --- FIX: Initialize Gemini INSIDE the function ---
        // This ensures .env is fully loaded before we check for the key
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            console.error("❌ ERROR: API Key is missing in Server!");
            return res.status(500).json({ message: "Server Error: API Key missing." });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        // --------------------------------------------------

        // 1. Fetch User's Real Portfolio
        const portfolio = await Portfolio.find({ user: userId });
        
        // 2. Format it into a string
        let context = "User Portfolio:\n";
        if (portfolio.length === 0) {
            context += "Empty (User owns nothing yet).\n";
        } else {
            portfolio.forEach(p => {
                context += `- ${p.stockSymbol}: ${p.quantity} shares @ avg price $${p.averagePrice.toFixed(2)}\n`;
            });
        }

        // 3. Construct the Prompt
        const prompt = `
        You are a strict, smart financial advisor for a trading app called TradeX.
        
        ${context}
        
        User Query: "${message || "Analyze my portfolio risks."}"
        
        Rules:
        1. Be concise (max 3 sentences).
        2. If portfolio is empty, tell them to buy "AAPL" or "TSLA" to start.
        3. If they ask about specific stocks, use your knowledge.
        `;

        // 4. Call Gemini
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ reply: text });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "AI is sleeping. Try again." });
    }
};

module.exports = { chatWithAI };