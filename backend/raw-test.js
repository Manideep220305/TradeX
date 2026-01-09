const https = require('https');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;
// We will try the most basic, standard model endpoint
const MODEL = "gemini-1.5-flash"; 

console.log("🔑 Testing Key:", API_KEY ? "Loaded from .env" : "MISSING");

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Are you online?" }] }]
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log("\n--- SERVER RESPONSE ---");
    console.log("Status Code:", res.statusCode); // 200 = Success, 4xx = Error
    console.log("Body:", body);
  });
});

req.on('error', (error) => {
  console.error("Connection Error:", error);
});

req.write(data);
req.end();