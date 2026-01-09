require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function run() {
  try {
    console.log("🤖 Testing model: gemini-2.0-flash ...");
    
    // USE THE EXACT NAME FROM YOUR LIST
// Change ONLY this line
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });    
    const result = await model.generateContent("Reply with one word: 'Success'");
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ IT WORKS! Response:", text);
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

run();