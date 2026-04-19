import fs from "fs";
import path from "path";

// Ensure environment load
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY";

async function runFineTuning() {
    console.log("🚀 Initializing Adaptability Engine Fine-Tuning Sequence...");
    
    // Load the dataset
    const datasetPath = "c:\\Users\\saniy\\Downloads\\finetuning_dataset (1).json";
    
    if (!fs.existsSync(datasetPath)) {
        console.error("❌ Dataset not found at:", datasetPath);
        return;
    }

    console.log("📦 Loading dataset...");
    const rawData = fs.readFileSync(datasetPath, "utf-8");
    const dataset = JSON.parse(rawData);
    
    console.log(`✅ Loaded ${dataset.length} training examples.`);
    console.log("🔄 Reformatting dataset for Gemini API format...");

    // Convert OpenAI messages format to Gemini format
    const geminiExamples = dataset.map((entry: any) => {
        const sysMsg = entry.messages.find((m: any) => m.role === "system")?.content || "";
        const userMsg = entry.messages.find((m: any) => m.role === "user")?.content || "";
        const assistantMsg = entry.messages.find((m: any) => m.role === "assistant")?.content || "";

        return {
            textInput: `System: ${sysMsg}\n\nUser: ${userMsg}`,
            output: assistantMsg
        };
    });

    console.log(`✅ Reformatting complete. Starting training configuration...`);
    
    // Using a slice of the dataset if it's too large for inline API submission
    const batchSize = Math.min(geminiExamples.length, 500); 
    const trainingBatch = geminiExamples.slice(0, batchSize);

    console.log(`🚀 Dispatching tuning job to Gemini API with ${batchSize} examples...`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/tunedModels?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                baseModel: "models/gemini-1.5-flash-001-tuning",
                displayName: "Lumiu-Adaptability-Engine-" + Date.now().toString().slice(-6),
                tuningTask: {
                    hyperparameters: {
                        batchSize: 2,
                        learningRate: 0.001,
                        epochCount: 5
                    },
                    trainingData: {
                        examples: {
                            examples: trainingBatch
                        }
                    }
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("❌ Fine-tuning API returned an error:");
            console.error(JSON.stringify(data, null, 2));
            console.log("\n⚠️ NOTE: Wait! Google's Generative AI API often requires OAuth tokens instead of API Keys for fine-tuning (tunedModels construct).");
            console.log("As a fallback, writing out the correctly formatted JSONL dataset so it can be uploaded manually to Google AI Studio or OpenAI!");
            
            // Generate JSONL fallback
            const jsonlPath = path.join(process.cwd(), "src", "dataset", "ready_for_tuning.jsonl");
            const jsonlStr = dataset.map((row: any) => JSON.stringify(row)).join("\n");
            fs.writeFileSync(jsonlPath, jsonlStr);
            console.log(`✅ Generated JSONL tuning artifact at: ${jsonlPath}`);
            return;
        }

        console.log("🎉 Fine-Tuning Job Successfully Created!");
        console.log("Model Name:", data.name);
        console.log("Status:", data.state);
        
        fs.writeFileSync("tuning_metadata.json", JSON.stringify(data, null, 2));

    } catch (err: any) {
        console.error("❌ Failed to communicate with API:", err.message);
    }
}

runFineTuning();
