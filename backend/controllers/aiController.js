const { GoogleGenerativeAI } = require("@google/generative-ai");
const User = require('../models/user'); 

// ✅ SECURE: Uses .env key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// ✅ MODEL: Uses the Flash model (Fast & Free)
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const chatWithAI = async (req, res) => {
  const { message, portfolioContext } = req.body;
  const userId = req.user ? req.user._id : null; 

  try {
    let walletInfo = "Unknown";
    
    // 1. Fetch User Balance
    if (userId) {
        try {
            const user = await User.findById(userId);
            if (user) {
                walletInfo = `$${user.walletBalance.toFixed(2)}`;
            }
        } catch (dbError) {
            console.error("Database Error:", dbError.message);
        }
    }

    const contextData = portfolioContext || [];
    
    // 2. The "Clean Format" Prompt
    const prompt = `
      ROLE: You are a Wall Street Trading Analyst for TradeX.
      
      --- USER DATA ---
      Cash: ${walletInfo}
      Portfolio: ${JSON.stringify(contextData)}
      -----------------

      STRICT FORMATTING RULES (CRITICAL):
      1. **NO MARKDOWN TABLES:** Never use pipes (|) or grids.
      2. **NO HEADERS:** Do not use ### or ##.
      3. **USE BULLETS:** Use simple dots (•) or numbers (1.) for lists.
      4. **SHORT & CLEAN:** Keep responses under 3-4 sentences unless asked for a detailed list.

      INSTRUCTIONS:
      1. **Specific Advice:** Suggest 3 specific stocks (e.g., "Buy **MSFT** for growth").
      2. **Diversify:** If they own Tech, suggest Finance or Healthcare.
      3. **Disclaimer:** Always end with: "Check real-time prices on the dashboard."
      
      USER QUERY: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("❌ AI ERROR:", error); 
    res.status(500).json({ reply: "I'm having trouble connecting. Please try again." });
  }
};

module.exports = { chatWithAI };