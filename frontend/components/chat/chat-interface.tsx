"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Send, Paperclip, Mic, MicOff, Trash2, AlertCircle, Image, X, Volume2, VolumeX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { ChatMessage } from "@/lib/ai"
import { getAIResponse } from "@/lib/ai"
import { sendChatMessage, uploadImageForAnalysis, type ChatApiResult } from "@/lib/chat-api"
import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"
import { HealthAssessment } from "./health-assessment"
import { useLanguage, useTranslation } from "@/components/language/language-provider"
import { LanguageSelector } from "@/components/language/language-selector"

const STORAGE_KEY = "tm_chat_history"
const CONVERSATION_KEY = "tm_conversation_id"

// TypeScript declarations for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
  }
}

// Removed quick suggestions for a cleaner UI
const suggestions: string[] = []

export function ChatInterface({ initial, conversationId: conversationIdProp, userId, onMessageSent, onConversationAssigned }: { initial?: ChatMessage[]; conversationId?: string | null; userId?: string; onMessageSent?: (message: string) => void; onConversationAssigned?: (conversationId: string) => void }) {
  const { toast } = useToast()
  const { currentLanguage } = useLanguage()
  const t = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // When conversationId is provided, only use initial messages (from DB), don't use localStorage
    if (conversationIdProp) {
      return initial || []
    }
    // For legacy/local chats without conversationId, use localStorage
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as ChatMessage[]
      } catch {
        // ignore
      }
    }
    return initial || []
  })
  const [pending, setPending] = useState(false)
  const [input, setInput] = useState("")
  // removed per design: in-chat search
  const [conversationId, setConversationId] = useState<string | null>(conversationIdProp || null)
  
  // Sync external conversation id; avoid clearing messages when id is first assigned after sending first message
  useEffect(() => {
    if (conversationIdProp !== conversationId) {
      const prevId = conversationId
      setConversationId(conversationIdProp)
      if (conversationIdProp && typeof window !== "undefined") {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
          window.localStorage.setItem(CONVERSATION_KEY, conversationIdProp)
        } catch {}
      }
      // Only reset messages if truly switching to a different existing conversation selected by user
      // If prevId was null and we just received a new id from backend, keep current in-memory messages
      if (prevId && conversationIdProp && initial !== undefined) {
        setMessages(initial)
      }
      if (!prevId && conversationIdProp && initial && initial.length > 0) {
        // In case server returned existing history for the new id, merge with current
        setMessages((curr) => curr.length === 0 ? initial : curr)
      }
      if (conversationIdProp == null) {
        setMessages(initial !== undefined ? initial : [])
      }
    }
  }, [conversationIdProp, conversationId])
  
  // Also sync messages when initial changes (e.g., when loading conversation from DB)
  // This handles the case where initial is loaded asynchronously after conversationId is set
  useEffect(() => {
    if (conversationIdProp === conversationId && initial !== undefined) {
      setMessages(initial)
    }
  }, [initial, conversationIdProp, conversationId])
  const [error, setError] = useState<string | null>(null)
  const [useBackend] = useState(true) // Always use backend
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Only persist to localStorage if there's no conversationId (legacy mode)
  useEffect(() => {
    if (!conversationId && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } catch {
        // ignore
      }
    }
  }, [messages, conversationId])

  // Save conversation ID to localStorage
  useEffect(() => {
    if (conversationId) {
      try {
        window.localStorage.setItem(CONVERSATION_KEY, conversationId)
      } catch {
        // ignore
      }
    }
  }, [conversationId])

  useEffect(() => {
    // auto-scroll to bottom on updates
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, pending])

  const filtered = messages

  const send = async (text: string) => {
    if (!text.trim() || pending) return
    
    // If an image is selected, also send a local preview bubble so it persists
    const now = new Date().toISOString()
    const baseUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      message: text.trim(),
      sender: "patient",
      timestamp: now,
    }
    const imageBubble: ChatMessage | null = selectedImage && imagePreview
      ? { id: crypto.randomUUID(), message: imagePreview, sender: "patient", timestamp: now }
      : null
    const previousCount = messages.length
    setMessages((m) => [...m, ...(imageBubble ? [imageBubble] : []), baseUserMsg])
    setInput("")
    setPending(true)
    setError(null)
    
    // Notify parent if this is the first message
    if (previousCount === 0 && onMessageSent) {
      onMessageSent(text.trim())
    }

    if (useBackend) {
      // Use backend API
      console.log('Sending message to backend:', { message: text.trim(), conversationId, hasImage: !!selectedImage })
      
      let result: ChatApiResult

      if (selectedImage) {
        // Clear preview immediately so it doesn't linger in input area
        const imgToSend = selectedImage
        setSelectedImage(null)
        setImagePreview(null)
        // Upload image for analysis
        result = await uploadImageForAnalysis(imgToSend, text.trim(), conversationId || undefined, currentLanguage.code, userId)
      } else {
        // Send regular message
        result = await sendChatMessage(text.trim(), conversationId || undefined, currentLanguage.code, userId)
      }
      
      console.log('Backend response:', result)

      if (result.success) {
        // Update conversation ID if provided
        if (result.conversationId) {
          setConversationId(result.conversationId)
          if (onConversationAssigned) onConversationAssigned(result.conversationId)
        }

        // Add AI response to messages
        const aiMsg: ChatMessage = {
          id: crypto.randomUUID(),
          message: result.message,
          sender: "ai",
          timestamp: result.timestamp,
        }

        setMessages((m) => [...m, aiMsg])
      } else {
        // Handle error - do not use dummy responses; surface error only
        console.error('Backend error:', result.error)
        setError(result.error)
        toast({
          title: "Connection issue",
          description: result.error,
          variant: "destructive",
        })
      }
    } else {
      // Use dummy responses (original behavior)
      await new Promise((r) => setTimeout(r, 800))
      const { reply, assessment } = getAIResponse(text)
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        message: reply,
        sender: "ai",
        timestamp: new Date().toISOString(),
      }
      setMessages((m) => [...m, aiMsg, ...(assessment ? [wrapAssessment(assessment)] : [])])
    }

    setPending(false)
  }

  function wrapAssessment(a: ReturnType<typeof getAIResponse>["assessment"]): ChatMessage {
    return {
      id: crypto.randomUUID(),
      message: JSON.stringify(a), // stored for export; rendered specially
      sender: "ai",
      timestamp: new Date().toISOString(),
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        })
        return
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        })
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      
      toast({
        title: "Image selected",
        description: "Image ready for analysis. Add a description and send.",
      })
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onAttach = () => {
    fileInputRef.current?.click()
  }

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = currentLanguage.speechCode

      recognitionRef.current.onstart = () => {
        setIsRecording(true)
        toast({ title: t('chat.listening'), description: t('chat.speakNow') })
      }

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsRecording(false)
        toast({ title: t('chat.voiceReceived'), description: t('chat.textAdded') })
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        toast({ 
          title: t('chat.voiceError'), 
          description: `Error: ${event.error}`,
          variant: "destructive"
        })
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [currentLanguage.speechCode, t])

  const onVoice = () => {
    if (!recognitionRef.current) {
      toast({ 
        title: t('chat.voiceNotSupported'), 
        description: t('chat.browserNotSupported'),
        variant: "destructive"
      })
      return
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current.start()
    }
  }

  // Text-to-speech functionality
  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Stop any current speech
      if (synthesisRef.current) {
        window.speechSynthesis.cancel()
      }

      // Clean text for speech (remove markdown formatting)
      const cleanText = text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/#{1,3}\s/g, '')
        .replace(/\[.*?\]\(.*?\)/g, '')
        .replace(/---/g, '')
        .trim()

      const utterance = new SpeechSynthesisUtterance(cleanText)
      utterance.lang = currentLanguage.speechCode
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      synthesisRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const onClear = () => {
    // Clear messages (empty array, will show welcome message)
    setMessages([])
    setError(null)
    
    // Only clear localStorage if there's no conversationId
    if (!conversationId) {
      try {
        window.localStorage.removeItem(STORAGE_KEY)
        window.localStorage.removeItem(CONVERSATION_KEY)
      } catch {
        // ignore
      }
    }
    toast({ title: "Chat cleared" })
  }

  // export removed per design

  return (
    <section className="card p-0 flex min-h-[70svh] max-h-[calc(100svh-6rem)] flex-col">
      <header className="flex items-center justify-between border-b p-3 sm:p-4">
        <div>
          <h1 className="text-pretty text-lg sm:text-xl font-semibold">{t('chat.title')}</h1>
          <p className="text-[12px] sm:text-sm text-muted-foreground">
            {conversationId ? `${t('status.conversation')}: ${conversationId.slice(0, 8)}...` : t('status.newConversation')}
          </p>
          {error && useBackend && (
            <div className="flex items-center gap-1 mt-1">
              <AlertCircle className="h-3 w-3 text-destructive" />
              <span className="text-[10px] text-destructive">{t('status.backendError')}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <LanguageSelector />
          <Button variant="destructive" size="icon" onClick={onClear} aria-label={t('chat.clear')}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Suggestions removed intentionally */}

      <div
        ref={viewportRef}
        className="flex-1 overflow-y-auto px-3 sm:px-4 pb-3"
        role="list"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {/* Welcome message when chat is empty (like ChatGPT) */}
        {messages.length === 0 && !pending && (
          <div className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-semibold">What can I help with?</h2>
              <p className="text-sm text-muted-foreground">Ask anything about your health</p>
            </div>
          </div>
        )}
        
        {/* Messages list */}
        {filtered.length > 0 && (
          <>
            {filtered.map((m) => {
              // detect assessment messages encoded as JSON and render a card after AI reply
              if (m.sender === "ai") {
                try {
                  const parsed = JSON.parse(m.message)
                  if (parsed && parsed.title && parsed.suggestedSpecialty) {
                    return (
                      <div key={m.id} className="my-2">
                        <HealthAssessment data={parsed} />
                      </div>
                    )
                  }
                } catch {
                  // not an assessment, fall through
                }
              }
              return (
                <div key={m.id} className="my-2 max-w-full break-words">
                  <MessageBubble msg={m} />
                </div>
              )
            })}
            {pending ? (
              <div className="my-2 flex justify-start">
                <div className="rounded-full border bg-card/70 px-3 py-2 shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            ) : null}
          </>
        )}
        
        {/* no search results UI (search removed) */}
      </div>

      {/* Image Preview + persist as bubble when sent */}
      {imagePreview && (
        <div className="border-t bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{t('image.selectedForAnalysis')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={removeImage}
              className="ml-auto h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-2">
            <img
              src={imagePreview}
              alt="Selected for analysis"
              className="rounded-lg border object-cover max-h-44"
            />
          </div>
        </div>
      )}

      <form
        className="sticky bottom-0 flex items-center gap-1.5 sm:gap-2 border-t bg-card p-2.5 sm:p-3 pb-[env(safe-area-inset-bottom)]"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        aria-label="Send message"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        <Button 
          variant="outline" 
          size="icon" 
          type="button" 
          onClick={onAttach} 
          aria-label="Attach image"
          disabled={pending}
          className="h-10 w-10"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Input
          placeholder={selectedImage ? t('chat.imagePlaceholder') : t('chat.placeholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 text-base h-10"
          disabled={pending}
        />
        <Button 
          variant={isRecording ? "destructive" : "outline"} 
          size="icon" 
          type="button" 
          onClick={onVoice} 
          aria-label={isRecording ? t('chat.stopRecording') : t('chat.voiceInput')}
          disabled={pending}
          className="h-10 w-10"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button 
          type="submit" 
          className="bg-primary text-primary-foreground h-10" 
          aria-label={t('chat.send')}
          disabled={pending || !input.trim()}
        >
          <Send className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">{t('chat.send')}</span>
        </Button>
      </form>
    </section>
  )
}
