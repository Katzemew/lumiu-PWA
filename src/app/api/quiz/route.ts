import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";

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
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        throw new Error(`OpenRouter API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

export async function POST(req: Request) {
    try {
        const { topic, difficulty, context, performanceMetrics } = await req.json();

        if (!topic) {
            return NextResponse.json({ error: "Topic is required" }, { status: 400 });
        }

        let cognitiveAdaptation = "";
        if (performanceMetrics) {
            const { focus, organization } = performanceMetrics;
            cognitiveAdaptation = `
            Cognitive Profile Adaptation (CRITICAL - APPLY THESE RULES):
            - Focus Score is ${focus}/10. ${focus < 6 ? "Keep questions extremely concise and eliminate any unnecessary fluff to prevent cognitive overload." : "User has a good focus threshold, but prioritize overall clarity."}
            - Organizing Difficulty is ${organization}/1. ${organization > 0.5 ? "Provide highly structured, straightforward questions. Avoid complex multi-part logic or tangled scenario descriptions without clear segmentation." : "Standard structural complexity is acceptable."}
            `;
        }

        const prompt = `
            Generate an educational quiz on: "${topic}".
            
            Difficulty Level: ${difficulty} (Gentle = Basic/Foundational, Normal = Balanced, Challenge = Deep Synthesis).
            Context/Uploaded Notes: ${context || "No extra context provided. Rely on general conceptual knowledge."}
            
            ${cognitiveAdaptation}
            
            Guidelines:
            - ALL questions must be relevant to the provided Context/Notes if they exist.
            - Format: Return ONLY valid JSON. A JSON array of exactly 5 objects:
            [
                {
                    "question": "string",
                    "options": ["A", "B", "C", "D"],
                    "correctIndex": number (0-3),
                    "explanation": "string"
                }
            ]
        `;

        let responseText = "";

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        } catch (geminiError: any) {
            console.warn("Gemini API failed, falling back to OpenRouter:", geminiError.message);
            try {
                responseText = await callOpenRouterFallback(prompt);
            } catch (openRouterError: any) {
                console.error("Both Gemini and OpenRouter failed.", openRouterError);
                throw new Error("AI generation limits reached on all providers.");
            }
        }
        
        // Use a more robust regex to extract JSON if the model includes preamble
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const cleanJson = jsonMatch ? jsonMatch[0] : responseText;
        
        try {
            const quizData = JSON.parse(cleanJson);
            return NextResponse.json(quizData);
        } catch (parseError) {
            console.error("JSON Parse Error:", responseText);
            return NextResponse.json({ error: "Failed to parse AI response into valid quiz data." }, { status: 500 });
        }

    } catch (error: any) {
        console.error("Quiz API Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate quiz." }, { status: 500 });
    }
}
