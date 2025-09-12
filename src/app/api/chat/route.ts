import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface ChatRequest {
  message: string
  mode?: 'online' | 'offline'
  model?: string
}

export async function POST(request: NextRequest) {
  try {
    const { message, mode = 'online', model = 'gemini-pro' }: ChatRequest = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    let response: string

    if (mode === 'offline') {
      // ... (your offline Ollama code stays here)
    } else {
      // Use Gemini
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const modelInstance = genAI.getGenerativeModel({ model: model || 'gemini-pro' })
        const result = await modelInstance.generateContent([message])
        response = result.response.text() || 'Sorry, I could not generate a response.'
      } catch (error) {
        console.error('Gemini Error:', error)
        return NextResponse.json(
          { error: 'Online service not available. Please check your Gemini API key or connection.' },
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
