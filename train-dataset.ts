import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function callOpenRouterFallback(prompt: string) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "Lumiu App",
        },
        body: JSON.stringify({
            model: "google/gemini-flash-lite-latest",
            messages: [{ role: "user", content: prompt }]
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

async function trainOnDataset() {
    console.log("Loading ADHD Dataset...");
    const filePath = path.join(process.cwd(), "src", "dataset", "adhd_data.csv");
    
    if (!fs.existsSync(filePath)) {
        console.error("Dataset not found at:", filePath);
        return;
    }

    const csvData = fs.readFileSync(filePath, "utf-8");
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true, dynamicTyping: true });
    
    // Take a small sample to prevent massive API usage and keep execution fast
    const sampleData = parsed.data.slice(0, 5); 
    
    console.log(`Processing ${sampleData.length} rows for AI training/analysis...`);
    
    const results = [];

    for (let i = 0; i < sampleData.length; i++) {
        const row = sampleData[i];
        console.log(`\nAnalyzing row ${i + 1}...`);
        
        const prompt = `Analyze this user profile from an ADHD dataset to generate educational adaptation rules for an AI tutor.
        Profile Data: ${JSON.stringify(row)}
        
        Output format should be a brief JSON containing:
        - "user_persona" (string describing the learner)
        - "teaching_strategy" (string describing best learning approach)
        Return ONLY valid JSON.`;

        let responseText = "";

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
            const result = await model.generateContent(prompt);
            responseText = await result.response.text();
            console.log("  Successfully used Gemini.");
        } catch (geminiError) {
            console.warn("  Gemini failed, trying OpenRouter fallback...");
            try {
                responseText = await callOpenRouterFallback(prompt);
                console.log("  Successfully used OpenRouter.");
            } catch (openRouterError: any) {
                console.error("  Both APIs failed.", openRouterError.message);
                continue;
            }
        }
        
        // Basic cleanup of response
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        
        results.push({
            original_data: row,
            ai_analysis: cleanJson
        });
        
        // Delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const outputPath = path.join(process.cwd(), "training_results.json");
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\nTraining analysis complete! Results saved to ${outputPath}`);
}

trainOnDataset();
