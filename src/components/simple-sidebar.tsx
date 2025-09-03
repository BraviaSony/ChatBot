'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Plus, MessageSquare, Trash2, Bot, X } from 'lucide-react'

interface Conversation {
  id: string
  sessionId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: any[]
}

interface SimpleSidebarProps {
  currentSessionId: string
  onConversationSelect: (sessionId: string) => void
  onNewConversation: () => void
  onConversationDelete: (sessionId: string) => void
  isOpen: boolean
  onClose: () => void
}

export function SimpleSidebar({ 
  currentSessionId, 
  onConversationSelect, 
  onNewConversation, 
  onConversationDelete,
  isOpen,
  onClose
}: SimpleSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteConversation = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await fetch(`/api/conversations?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      setConversations(prev => prev.filter(conv => conv.sessionId !== sessionId))
      if (sessionId === currentSessionId) {
        onConversationSelect('')
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const formatTitle = (title: string, messages: any[]) => {
    if (title !== 'New Conversation') return title
    
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    if (firstUserMessage) {
      const truncated = firstUserMessage.content.length > 30 
        ? firstUserMessage.content.substring(0, 30) + '...' 
        : firstUserMessage.content
      return truncated
    }
    return 'New Conversation'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="relative w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-400" />
            <span className="font-semibold text-white">Conversations</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/70 hover:text-white h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            onClick={onNewConversation}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          <div className="px-4 pb-2">
            <h3 className="text-xs font-medium text-white/70 uppercase tracking-wider">
              Recent Chats
            </h3>
          </div>
          <ScrollArea className="h-[calc(100vh-200px)] px-4">
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-4 text-white/50 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.sessionId}
                    className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 ${
                      conversation.sessionId === currentSessionId ? 'bg-white/20' : 'bg-white/5'
                    }`}
                    onClick={() => {
                      onConversationSelect(conversation.sessionId)
                      onClose()
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">
                          {formatTitle(conversation.title, conversation.messages)}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {formatDate(conversation.updatedAt)}
                        </div>
                      </div>
                      {conversation.messages.length > 0 && (
                        <Badge variant="secondary" className="bg-white/10 text-white/80 text-xs">
                          {conversation.messages.length}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteConversation(conversation.sessionId, e)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-white/50 text-center">
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}