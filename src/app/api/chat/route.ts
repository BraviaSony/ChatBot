import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

interface ChatRequest {
  message: string
  mode?: 'online' | 'offline'
  model?: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'online', model = 'llama3.2' }: ChatRequest = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    let response: string

    if (mode === 'offline') {
      // Use local Ollama model
      try {
        const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model,
            prompt: message,
            stream: false,
            options: {
              temperature: 0.7,
              max_tokens: 1000
            }
          }),
        })

        if (!ollamaResponse.ok) {
          throw new Error('Ollama server not available')
        }

        const data = await ollamaResponse.json()
        response = data.response || 'Sorry, I could not generate a response.'
      } catch (error) {
        console.error('Ollama Error:', error)
        return NextResponse.json(
          { error: 'Local model not available. Please start Ollama or switch to online mode.' },
          { status: 503 }
        )
      }
    } else {
      // Use online z-ai-web-dev-sdk
      try {
        const zai = await ZAI.create()

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant. Be concise, helpful, and friendly in your responses.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })

        response = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
      } catch (error) {
        console.error('ZAI Error:', error)
        return NextResponse.json(
          { error: 'Online service not available. Please check your connection or switch to offline mode.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json({ response, mode })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}