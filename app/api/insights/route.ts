import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { model, prompt } = await req.json();
        const apiKey = process.env.VITE_GEMINI_API_KEY; // Using same name as .env or new one

        if (!apiKey) {
            return NextResponse.json({ error: 'Gemini API Key is not configured on the server.' }, { status: 500 });
        }

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error?.message || 'Failed to generate AI insights.');
        }

        const raw = await res.json();
        let text = raw.candidates[0].content.parts[0].text;

        // Robust JSON parsing: remove markdown formatting if present
        if (text.includes('```')) {
            text = text.replace(/```json|```/g, '').trim();
        }

        try {
            const parsed = JSON.parse(text);
            return NextResponse.json({
                alerts: parsed.alerts || [],
                opportunities: parsed.opportunities || [],
                suggestions: parsed.suggestions || []
            });
        } catch (parseError) {
            console.error("Failed to parse Gemini JSON:", text);
            throw new Error('AI returned an invalid format. Please try again.');
        }

    } catch (err: any) {
        console.error("AI Insight Error:", err);
        return NextResponse.json({ error: err.message || 'Internal AI service error.' }, { status: 500 });
    }
}
