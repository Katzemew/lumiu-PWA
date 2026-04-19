const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyDdKqsvMKkXWcR_D0zy-uOCM9TBlpegqjw");
    // The SDK doesn't have a direct listModels but we can check the error or use the REST API
    console.log("Checking model availability...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("Success with gemini-1.5-flash");
  } catch (error) {
    console.error("Error with gemini-1.5-flash:", error.message);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-pro");
    } catch (e) {
        console.error("Error with gemini-pro:", e.message);
    }
  }
}

listModels();
