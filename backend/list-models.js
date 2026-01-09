const https = require('https');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
};

console.log("🔍 Scanning for available models...");

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const data = JSON.parse(body);
    if (data.models) {
        console.log("\n✅ SUCCESS! Found these models:");
        data.models.forEach(m => console.log(` - ${m.name.replace('models/', '')}`));
    } else {
        console.log("\n❌ NO MODELS FOUND.");
        console.log("Server Message:", JSON.stringify(data, null, 2));
    }
  });
});

req.on('error', (e) => console.error(e));
req.end();