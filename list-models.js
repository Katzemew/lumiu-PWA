const https = require('https');

const key = "AIzaSyDdKqsvMKkXWcR_D0zy-uOCM9TBlpegqjw";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const models = JSON.parse(data);
      console.log("Available Gemini Models:");
      models.models.forEach(m => {
        console.log(`- ${m.name}`);
      });
    } catch (e) {
      console.error("Parse error:", e.message);
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error("Fetch error:", err.message);
});
