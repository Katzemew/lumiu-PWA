const { GoogleGenerativeAI } = require("@google/generative-ai");

// Replace these with your actual keys if they are different
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY"; // Note: Ensure this is your full, real OpenRouter key


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function testModels() {
  const modelsToTest = [
    "gemini-2.0-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemma-3-12b-it",
    "gemini-2.0-pro-exp",
    "gemini-3.1-flash-lite-preview"
  ];
  
  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hi");
      console.log(`✅ SUCCESS with ${modelName}:`, result.response.text().trim());
      // Stop and return the first successful model
      return modelName;
    } catch (e) {
      console.log(`❌ FAILED with ${modelName}:`, e.message.split('\n')[0].substring(0, 100));
    }
  }
}

testModels();
