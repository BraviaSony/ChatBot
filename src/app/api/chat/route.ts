import { NextRequest, NextResponse } from 'next/server';

interface ChatRequest {
  message: string;
  mode?: 'online' | 'offline';
  model?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'online', model = 'google/gemini-2.0-flash-exp:free' }: ChatRequest = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    let response: string = '';

    if (mode === 'offline') {
      // ... (handle your offline Ollama or local code here, if used)
    } else {
      // Use OpenRouter Gemini REST API
      try {
        const apiKey = process.env.GEMINI_API_KEY; // Set this in Render ENV
        const openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';

        const apiResponse = await fetch(openRouterUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
            // Optionally set HTTP-Referer and X-Title headers here if desired
          },
          body: JSON.stringify({
            model: model, // e.g., "google/gemini-2.0-flash-exp:free"
            messages: [
              {
                role: 'user',
                content: [{ type: 'text', text: message }]
              }
            ]
          })
        });

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          // Return actual error detail for troubleshooting
          return NextResponse.json(
            {
              error:
                typeof errorData.error === 'string'
                  ? errorData.error
                  : JSON.stringify(errorData.error || errorData || 'OpenRouter API error')
            },
            { status: apiResponse.status }
          );
        }

        const data = await apiResponse.json();
        response =
          data.choices?.[0]?.message?.content?.[0]?.text ||
          data.choices?.[0]?.message?.content ||
          'Sorry, I could not generate a response.';
      } catch (error: any) {
        console.error('Gemini/OpenRouter Error:', error);
        return NextResponse.json(
          {
            error:
              error?.message ||
              String(error) ||
              'Online service not available. Please check your Gemini API key, OpenRouter plan, or network connection.'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({ response, mode });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error?.message || String(error) || 'Internal server error' },
      { status: 500 }
    );
  }
}
