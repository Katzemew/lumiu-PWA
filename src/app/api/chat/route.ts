import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY");

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const messages = body.messages || [];

        if (messages.length === 0) {
            return NextResponse.json({ error: "Empty message history." }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

        // Transform previous messages into Gemini API format
        let rawHistory = messages.slice(0, -1);
        if (rawHistory.length > 0 && rawHistory[0].role === "assistant") {
            rawHistory = rawHistory.slice(1);
        }

        const history = rawHistory.map((msg: any) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history });
        const lastMessage = messages[messages.length - 1].content;

        // Use streaming for instant perceived speed
        const result = await chat.sendMessageStream(lastMessage);

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                for await (const chunk of result.stream) {
                    const chunkText = chunk.text();
                    controller.enqueue(encoder.encode(chunkText));
                }
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                "Content-Type": "text/plain; charset=utf-8",
            },
        });

    } catch (error: any) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate AI response from Gemini." }, { status: 500 });
    }
}
