import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    
    // If no sessionId provided, return all conversations
    if (!sessionId) {
      const conversations = await db.conversation.findMany({
        orderBy: { updatedAt: 'desc' }
      })
      
      return NextResponse.json({ conversations })
    }

    const conversation = await db.conversation.findFirst({
      where: { sessionId }
    })

    if (!conversation) {
      return NextResponse.json({ messages: [] })
    }

    return NextResponse.json({ 
      messages: conversation.messages,
      sessionId: conversation.sessionId,
      title: conversation.title
    })
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, title } = await request.json()

    // If no sessionId provided, create a new conversation
    if (!sessionId) {
      const newConversation = await db.conversation.create({
        data: {
          sessionId: generateSessionId(),
          title: title || 'New Conversation',
          messages: messages || []
        }
      })
      return NextResponse.json(newConversation)
    }

    const existingConversation = await db.conversation.findFirst({
      where: { sessionId }
    })

    if (existingConversation) {
      const updatedConversation = await db.conversation.update({
        where: { id: existingConversation.id },
        data: { 
          messages,
          title: title || existingConversation.title,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(updatedConversation)
    } else {
      const newConversation = await db.conversation.create({
        data: {
          sessionId,
          title: title || 'New Conversation',
          messages
        }
      })
      return NextResponse.json(newConversation)
    }
  } catch (error) {
    console.error('Error saving conversation:', error)
    return NextResponse.json({ error: 'Failed to save conversation' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const conversation = await db.conversation.findFirst({
      where: { sessionId }
    })

    if (conversation) {
      await db.conversation.delete({
        where: { id: conversation.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}

// Helper function to generate unique session ID
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}