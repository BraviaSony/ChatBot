'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar'
import { Plus, MessageSquare, Trash2, Bot } from 'lucide-react'

interface Conversation {
  id: string
  sessionId: string
  title: string
  createdAt: string
  updatedAt: string
  messages: any[]
}

interface ConversationSidebarProps {
  currentSessionId: string
  onConversationSelect: (sessionId: string) => void
  onNewConversation: () => void
  onConversationDelete: (sessionId: string) => void
}

export function ConversationSidebar({ 
  currentSessionId, 
  onConversationSelect, 
  onNewConversation, 
  onConversationDelete 
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

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

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-white/10">
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-400" />
            <span className="font-semibold text-white">Conversations</span>
          </div>
          <SidebarTrigger className="text-white/70 hover:text-white" />
        </div>
        <Button 
          onClick={onNewConversation}
          className="mx-2 mb-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 text-xs font-medium">
            Recent Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center p-4 text-white/50 text-sm">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.sessionId}>
                    <SidebarMenuButton
                      isActive={conversation.sessionId === currentSessionId}
                      onClick={() => onConversationSelect(conversation.sessionId)}
                      className="w-full justify-start text-white hover:bg-white/10 data-[active=true]:bg-white/20"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {formatTitle(conversation.title, conversation.messages)}
                        </div>
                        <div className="text-xs text-white/60">
                          {formatDate(conversation.updatedAt)}
                        </div>
                      </div>
                      {conversation.messages.length > 0 && (
                        <Badge variant="secondary" className="ml-2 bg-white/10 text-white/80 text-xs">
                          {conversation.messages.length}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteConversation(conversation.sessionId, e)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-white/50 hover:text-white hover:bg-white/10 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-white/10 p-2">
        <div className="text-xs text-white/50 text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}