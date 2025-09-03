'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Bot, User, Wifi, WifiOff, Cpu, AlertCircle, CheckCircle, Sparkles, Zap, Trash2, History, Plus, Mic, MicOff, Menu } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  mode?: 'online' | 'offline'
}

interface OllamaStatus {
  status: 'online' | 'offline'
  error?: string
  models: Array<{
    name: string
    modified_at: string
    size: number
  }>
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<'online' | 'offline'>('online')
  const [selectedModel, setSelectedModel] = useState('llama3.2')
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({ status: 'offline', models: [] })
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState('')
  const [conversationsLoaded, setConversationsLoaded] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Load conversation history on component mount
  useEffect(() => {
    if (currentSessionId) {
      loadConversationHistory()
    }
  }, [currentSessionId])
  
  // Load all conversations for sidebar
  useEffect(() => {
    loadAllConversations()
  }, [])

  // Initialize with a new conversation if none exists
  useEffect(() => {
    if (!conversationsLoaded && !currentSessionId) {
      createNewConversation()
      setConversationsLoaded(true)
    }
  }, [currentSessionId, conversationsLoaded])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = false
        recognitionInstance.interimResults = false
        recognitionInstance.lang = 'en-US'
        
        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsRecording(false)
        }
        
        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          if (event.error === 'not-allowed') {
            alert('Microphone permission denied. Please allow microphone access to use voice input.')
          }
          setIsRecording(false)
        }
        
        recognitionInstance.onend = () => {
          setIsRecording(false)
        }
        
        setRecognition(recognitionInstance)
      } else {
        console.warn('Speech recognition not supported in this browser')
      }
    }
  }, [])

  // Save conversation history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversationHistory()
    }
  }, [messages])

  const loadAllConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }
  
  const loadConversationHistory = async () => {
    if (!currentSessionId) return
    
    try {
      const response = await fetch(`/api/conversations?sessionId=${currentSessionId}`)
      const data = await response.json()
      
      if (data.messages && Array.isArray(data.messages)) {
        const loadedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setMessages(loadedMessages)
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Error loading conversation history:', error)
      setMessages([])
    }
  }

  const saveConversationHistory = async () => {
    if (!currentSessionId) return
    
    try {
      await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          messages,
          title: generateConversationTitle()
        }),
      })
      // Refresh conversations list after saving
      await loadAllConversations()
    } catch (error) {
      console.error('Error saving conversation history:', error)
    }
  }

  const clearConversationHistory = async () => {
    if (!currentSessionId) return
    
    try {
      await fetch(`/api/conversations?sessionId=${currentSessionId}`, {
        method: 'DELETE',
      })
      setMessages([])
    } catch (error) {
      console.error('Error clearing conversation history:', error)
    }
  }

  const createNewConversation = async () => {
    // Save current conversation before creating new one
    if (currentSessionId && messages.length > 0) {
      await saveConversationHistory()
    }
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [],
          title: 'New Conversation'
        }),
      })
      const data = await response.json()
      setCurrentSessionId(data.sessionId)
      setMessages([])
      // Refresh conversations list
      await loadAllConversations()
    } catch (error) {
      console.error('Error creating new conversation:', error)
    }
  }

  const handleConversationSelect = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    // The conversation will be loaded by the useEffect hook
  }

  const handleConversationDelete = async (sessionId: string) => {
    try {
      await fetch(`/api/conversations?sessionId=${sessionId}`, {
        method: 'DELETE',
      })
      // Refresh conversations list
      await loadAllConversations()
      // If deleted current conversation, create new one
      if (sessionId === currentSessionId) {
        createNewConversation()
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const generateConversationTitle = () => {
    if (messages.length === 0) return 'New Conversation'
    
    const firstUserMessage = messages.find(msg => msg.role === 'user')
    if (firstUserMessage) {
      const truncated = firstUserMessage.content.length > 30 
        ? firstUserMessage.content.substring(0, 30) + '...' 
        : firstUserMessage.content
      return truncated
    }
    return 'New Conversation'
  }

  const startRecording = async () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser')
      return
    }
    
    if (!isRecording) {
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Stop the stream immediately
        
        setIsRecording(true)
        recognition.start()
      } catch (error) {
        console.error('Microphone permission denied:', error)
        alert('Microphone permission denied. Please allow microphone access to use voice input.')
        setIsRecording(false)
      }
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop()
      setIsRecording(false)
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // Check Ollama status when mode changes to offline
  useEffect(() => {
    if (mode === 'offline') {
      checkOllamaStatus()
    }
  }, [mode])

  const checkOllamaStatus = async () => {
    setIsCheckingStatus(true)
    try {
      const response = await fetch('/api/ollama/status')
      const status = await response.json()
      setOllamaStatus(status)
      
      if (status.models.length > 0 && !status.models.some(m => m.name.includes(selectedModel))) {
        const firstModel = status.models[0].name.split(':')[0]
        setSelectedModel(firstModel)
      }
    } catch (error) {
      setOllamaStatus({ status: 'offline', error: 'Failed to check status', models: [] })
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      mode
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input.trim(),
          mode,
          model: selectedModel
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        mode: data.mode
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const availableModels = ollamaStatus.models.map(model => {
    const modelName = model.name.split(':')[0]
    return {
      name: modelName,
      size: model.size
    }
  }).filter((model, index, self) => index === self.findIndex(m => m.name === model.name))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar Content */}
          <div className="relative w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Conversation History</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-white/70 hover:text-white p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <Button
                onClick={createNewConversation}
                variant="outline"
                size="sm"
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.sessionId}
                    className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-white/10 group ${
                      conversation.sessionId === currentSessionId
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      handleConversationSelect(conversation.sessionId)
                      setIsSidebarOpen(false)
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {conversation.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                        {conversation.messages && conversation.messages.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {conversation.messages.length} messages
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleConversationDelete(conversation.sessionId)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1 transition-all"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl supports-[backdrop-filter]:bg-black/30">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="text-white/70 hover:text-white p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-full">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  Shaharyar's Personal Bot
                  <Sparkles className="h-4 w-4 text-yellow-400" />
                </h1>
                <p className="text-xs text-gray-400 mt-1">AI-powered conversation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* New Chat Button */}
              <Button
                onClick={createNewConversation}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
              
              {/* Mode Selection */}
              <Select value={mode} onValueChange={(value: 'online' | 'offline') => setMode(value)}>
                <SelectTrigger className="w-24 sm:w-32 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
                  <div className="flex items-center gap-2">
                    {mode === 'online' ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-yellow-400" />}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/20 text-white">
                  <SelectItem value="online">
                    <div className="flex items-center gap-2">
                      Online
                    </div>
                  </SelectItem>
                  <SelectItem value="offline">
                    <div className="flex items-center gap-2">
                      Offline
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              {/* Clear History Button */}
              <Button
                onClick={clearConversationHistory}
                disabled={messages.length === 0}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              
              {/* Ollama Status (only for offline mode) */}
              {mode === 'offline' && (
                <div className="flex items-center gap-2">
                  {isCheckingStatus ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                  ) : ollamaStatus.status === 'online' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <Badge variant={ollamaStatus.status === 'online' ? 'default' : 'destructive'} 
                        className={`${ollamaStatus.status === 'online' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {ollamaStatus.status === 'online' ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              )}
              
              {/* Model Selection (only for offline mode) */}
              {mode === 'offline' && (
                <div className="flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={ollamaStatus.status !== 'online'}>
                    <SelectTrigger className="w-24 sm:w-32 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border-white/20 text-white max-h-60">
                      {availableModels.length > 0 ? (
                        availableModels.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-gray-400">
                                {(model.size / 1024 / 1024 / 1024).toFixed(1)}GB
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-models" disabled>
                          <span className="text-gray-400">No models</span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col container mx-auto max-w-6xl p-4 sm:p-6 gap-4 sm:gap-6">
        <Card className="flex-1 flex flex-col bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="pb-3 sm:pb-4 border-b border-white/10">
            <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Live Conversation
              <div className="flex items-center gap-2 ml-auto">
                <History className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-400">{messages.length} messages</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-280px)] sm:h-[calc(100vh-320px)] p-4 sm:p-6">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center max-w-md">
                    <div className="mb-6">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                        <Bot className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Welcome to Your Personal Bot</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">Start a conversation with AI</p>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                      <Zap className="h-3 w-3 text-yellow-400" />
                      <span>Powered by advanced AI technology</span>
                      <Zap className="h-3 w-3 text-yellow-400" />
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                      <History className="h-3 w-3 inline mr-1" />
                      Your conversations are automatically saved
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 sm:gap-4 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 sm:gap-4 max-w-[85%] sm:max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' 
                              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </div>
                        </div>
                        <div
                          className={`rounded-2xl px-4 py-3 sm:px-6 sm:py-4 transition-all hover:shadow-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30'
                              : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30'
                          }`}
                        >
                          <p className="text-sm sm:text-base whitespace-pre-wrap text-white leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                            <span>{message.timestamp.toLocaleTimeString()}</span>
                            {message.mode && (
                              <div className="flex items-center gap-1">
                                {message.mode === 'online' ? (
                                  <Wifi className="h-3 w-3 text-green-400" />
                                ) : (
                                  <WifiOff className="h-3 w-3 text-yellow-400" />
                                )}
                                <span className="capitalize">{message.mode}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3 sm:gap-4 justify-start">
                      <div className="flex gap-3 sm:gap-4 max-w-[80%]">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                            <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        </div>
                        <div className="rounded-2xl px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                            <span className="text-sm text-gray-300">Thinking...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="bg-black/20 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message or click mic to speak..."
                  disabled={isLoading}
                  className="w-full bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-purple-400 focus:ring-purple-400/20 transition-all pr-20"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <span className="text-xs">{input.length}/500</span>
                </div>
              </div>
              
              {/* Voice Recording Button */}
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
              
              <Button
                type="button"
                onClick={toggleRecording}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className={`bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all px-4 sm:px-6 ${
                  isRecording ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' : ''
                }`}
              >
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <MicOff className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                    <span className="hidden sm:inline text-xs">Stop</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline text-xs">Voice</span>
                  </div>
                )}
              </Button>
            </form>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Cloud AI</span>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2 text-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>Recording...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span>Press Enter to send</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">⏎</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}