import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, maxTokens = 8192 } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API key is not configured.");
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, responseMimeType: "application/json" }
      })
    });

    const d = await r.json();
    if (d.error) {
      console.error("Gemini API Error:", d.error);
      return NextResponse.json({ error: d.error.message }, { status: 500 });
    }

    const text = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
    const parsedText = JSON.parse(text.replace(/```json|```/g, "").trim());
    
    return NextResponse.json(parsedText);
  } catch (error: any) {
    console.error("Error in generate-flashcards route:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate flashcards' }, { status: 500 });
  }
}
