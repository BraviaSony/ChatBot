import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  mode?: 'online' | 'offline';
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'online', model = 'google/gemini-2.0-pro' }: ChatRequest = await request.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    let response: string = "";

    if (mode === 'offline') {
      // ... (your offline Ollama code stays here)
    } else {
      // Use OpenRouter Gemini REST API
      try {
        const apiKey = process.env.GEMINI_API_KEY; // put your OpenRouter API key in Render ENV
        const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions";

        const apiResponse = await fetch(openRouterUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            
          },
          body: JSON.stringify({
            model: model, 
            messages: [
              {
                role: "user",
                content: [{ type: "text", text: message }]
              }
            ]
          })
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          throw new Error(errorData.error || 'OpenRouter API error');
        }

        const data = await apiResponse.json();
        response =
          data.choices?.[0]?.message?.content?.[0]?.text ||
          data.choices?.[0]?.message?.content ||
          'Sorry, I could not generate a response.';

      } catch (error) {
        console.error('Gemini/OpenRouter Error:', error);
        return NextResponse.json(
          { error: 'Online service not available. Please check your Gemini API key, OpenRouter plan, or network connection.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ response, mode });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
