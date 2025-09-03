import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('http://localhost:11434/api/tags')
    
    if (!response.ok) {
      return NextResponse.json({
        status: 'offline',
        error: 'Ollama service not available',
        models: []
      })
    }

    const data = await response.json()
    
    return NextResponse.json({
      status: 'online',
      models: data.models || []
    })
  } catch (error) {
    return NextResponse.json({
      status: 'offline',
      error: 'Failed to connect to Ollama',
      models: []
    })
  }
}