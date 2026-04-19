const { GoogleGenerativeAI } = require("@google/generative-ai");

// Replace these with your actual keys if they are different
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY"; // Note: Ensure this is your full, real OpenRouter key

async function testBothAPIsInParallel() {
  console.log("Starting parallel API requests...");

  // 1. Setup direct Gemini Promise
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const directGeminiPromise = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent("Hello, are you Gemini?");
      return `Direct Gemini Success: ${result.response.text().trim()}`;
    } catch (error) {
      return `Direct Gemini Failed: ${error.message}`;
    }
  };

  // 2. Setup OpenRouter (Grok) Promise
  const openRouterPromise = async () => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Lumiu App",
        },
        body: JSON.stringify({
          model: "x-ai/grok-2-vision-1212", // You can use x-ai/grok-2 as well
          messages: [{ role: "user", content: "Hello, are you Grok?" }]
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || response.statusText);
      return `OpenRouter (Grok) Success: ${data.choices[0].message.content.trim()}`;
    } catch (error) {
      return `OpenRouter (Grok) Failed: ${error.message}`;
    }
  };

  // 3. Run BOTH parallelly using Promise.all
  console.time("Parallel Request Time");
  const [geminiResult, grokResult] = await Promise.all([
    directGeminiPromise(),
    openRouterPromise()
  ]);
  console.timeEnd("Parallel Request Time");

  console.log("\n--- Results ---");
  console.log(geminiResult);
  console.log(grokResult);
}

testBothAPIsInParallel();
