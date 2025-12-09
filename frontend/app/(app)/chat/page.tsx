"use client"

import { useEffect, useState, useRef } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import type { ChatMessage } from "@/lib/ai"
import { ConversationsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Search, Edit, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type ConversationListItem = {
  id: string
  title: string
  updatedAt: string
  messageCount: number
}

// Generate title from first message
function generateTitle(firstMessage: string): string {
  if (!firstMessage) return "New chat"
  // Take first 50 chars and clean up
  const cleaned = firstMessage.trim().slice(0, 50).replace(/\n/g, ' ')
  return cleaned || "New chat"
}

export default function ChatPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [items, setItems] = useState<ConversationListItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [initialMsgs, setInitialMsgs] = useState<ChatMessage[] | undefined>(undefined)
  const [loadingChat, setLoadingChat] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

  // Filter conversations by search query
  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Load conversations
  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        setLoadingList(true)
        const res = await ConversationsAPI.list()
        if (ignore) return
        const mapped = (res.conversations || []).map((c: any) => {
          // Use stored title, or generate from first message, or use default
          let title = c.title || ""
          if (!title && c.messages && c.messages.length > 0) {
            const firstUserMsg = c.messages.find((m: any) => m.role === 'user')
            if (firstUserMsg) {
              title = generateTitle(firstUserMsg.content)
            }
          }
          if (!title) {
            title = `Conversation ${String(c._id).slice(0,4)}`
          }
          return {
            id: c._id,
            title,
            updatedAt: new Date(c.updatedAt).toLocaleString(),
            messageCount: c.messages?.length || 0,
          }
        }) as ConversationListItem[]
        setItems(mapped)
        // Don't auto-create on first load - let user click "New chat"
      } finally {
        setLoadingList(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  // Load selected conversation messages
  useEffect(() => {
    let ignore = false
    async function loadConv() {
      if (!currentId) {
        setInitialMsgs([])
        setLoadingChat(false)
        return
      }
      try {
        setLoadingChat(true)
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/conversations/${currentId}`, {
          headers: { 'Authorization': typeof window !== 'undefined' ? `Bearer ${window.localStorage.getItem('tm_auth_token') || ''}` : '' }
        })
        if (!res.ok) throw new Error('Failed to load conversation')
        const data = await res.json()
        if (ignore) return
        const msgs: ChatMessage[] = (data.conversation?.messages || []).map((m: any, idx: number) => ({
          id: m._id || idx,
          message: m.content,
          sender: m.role === 'assistant' ? 'ai' : 'patient',
          timestamp: m.timestamp,
        }))
        setInitialMsgs(msgs.length > 0 ? msgs : [])
        
        // Auto-generate title from first message if no title exists
        if (msgs.length > 0 && !data.conversation.title) {
          const firstUserMsg = msgs.find(m => m.sender === 'patient')
          if (firstUserMsg) {
            const newTitle = generateTitle(firstUserMsg.message)
            await ConversationsAPI.update(currentId, { title: newTitle })
            // Update in local state
            setItems(prev => prev.map(item => 
              item.id === currentId ? { ...item, title: newTitle } : item
            ))
          }
        }
      } catch {
        if (!ignore) setInitialMsgs([])
      } finally {
        if (!ignore) setLoadingChat(false)
      }
    }
    loadConv()
    return () => { ignore = true }
  }, [currentId])

  const onNewChat = async () => {
    // Check if current chat is empty and still titled "New chat"
    // If so, don't create a duplicate - just keep using the existing empty chat
    const currentItem = items.find(item => item.id === currentId)
    const hasMessages = initialMsgs && initialMsgs.length > 0
    const isNewEmptyChat = currentId && !hasMessages && currentItem?.title === "New chat"
    
    if (isNewEmptyChat) {
      // Already have an empty "New chat" - don't create another one
      return
    }
    
    // If no chat is selected, check if there's already an empty "New chat" in the list
    if (!currentId) {
      const existingEmptyChat = items.find(item => item.title === "New chat" && item.messageCount === 0)
      if (existingEmptyChat) {
        // Select the existing empty chat instead of creating a new one
        setCurrentId(existingEmptyChat.id)
        setInitialMsgs([])
        return
      }
    }
    
    try {
      // Create a new conversation
      setInitialMsgs([])
      const res = await ConversationsAPI.create()
      const conv = res.conversation
      // Add to list
      const newItem = { 
        id: conv._id, 
        title: "New chat", 
        updatedAt: new Date(conv.updatedAt).toLocaleString(),
        messageCount: 0,
      }
      setItems(prev => [newItem, ...prev])
      // Set as current
      setCurrentId(conv._id)
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create new chat", 
        variant: "destructive" 
      })
    }
  }
  
  const handleSelectConversation = (id: string) => {
    // Clear messages before loading new conversation
    setInitialMsgs([])
    setCurrentId(id)
    setEditingId(null)
  }

  const handleRename = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast({ title: "Error", description: "Title cannot be empty", variant: "destructive" })
      return
    }
    try {
      await ConversationsAPI.update(id, { title: newTitle.trim() })
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, title: newTitle.trim() } : item
      ))
      setEditingId(null)
      toast({ title: "Success", description: "Chat renamed" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to rename chat", variant: "destructive" })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chat?")) return
    try {
      await ConversationsAPI.delete(id)
      setItems(prev => prev.filter(item => item.id !== id))
      if (currentId === id) {
        setCurrentId(null)
        setInitialMsgs([])
      }
      toast({ title: "Success", description: "Chat deleted" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete chat", variant: "destructive" })
    }
  }

  const startEdit = (item: ConversationListItem) => {
    setEditingId(item.id)
    setEditingTitle(item.title)
    setTimeout(() => editInputRef.current?.focus(), 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle("")
  }

  const saveEdit = (id: string) => {
    handleRename(id, editingTitle)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_18rem] gap-4 min-h-[70svh]">
      {/* Chat area - now on left with more space */}
      <div className="h-full order-2 md:order-1">
        <ChatInterface 
          initial={initialMsgs} 
          conversationId={currentId} 
          userId={user?.id || undefined}
          onMessageSent={(msg) => {
            // Update title when first message is sent
            // Note: Backend also auto-generates title, but we update UI immediately
            if (currentId) {
              const newTitle = generateTitle(msg)
              ConversationsAPI.update(currentId, { title: newTitle }).then(() => {
                setItems(prev => prev.map(item => 
                  item.id === currentId ? { ...item, title: newTitle } : item
                ))
              }).catch(() => {
                // Backend will generate title anyway, so we can ignore errors
              })
            }
          }}
          onConversationAssigned={(id) => {
            // Sync page-level currentId when backend assigns a new id
            setCurrentId(id)
            // Also reflect in list if not present
            setItems(prev => {
              const exists = prev.some(i => i.id === id)
              return exists ? prev : [{ id, title: "New chat", updatedAt: new Date().toLocaleString(), messageCount: 1 }, ...prev]
            })
          }}
        />
      </div>

      {/* Sidebar - now on right */}
      <aside className="rounded-xl border bg-card p-3 sm:p-4 h-full order-1 md:order-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium">Chats</h2>
          <Button size="sm" onClick={onNewChat} className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            New chat
          </Button>
        </div>
        
        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>

        {/* Chat list */}
        <div className="space-y-1 max-h-[calc(70vh-8rem)] overflow-y-auto">
          {loadingList ? (
            <p className="text-xs text-muted-foreground">Loading…</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "No chats found" : "No chats yet."}
            </p>
          ) : (
            filteredItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  currentId === item.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
              >
                {editingId === item.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      ref={editInputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => saveEdit(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(item.id)
                        } else if (e.key === 'Escape') {
                          cancelEdit()
                        }
                      }}
                      className="flex-1 bg-background border rounded px-2 py-1 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleSelectConversation(item.id)}
                      className="flex-1 text-left min-w-0"
                    >
                      <div className="truncate font-medium">{item.title}</div>
                      <div className="text-[10px] text-muted-foreground">{item.updatedAt}</div>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEdit(item)}>
                          <Edit className="h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          variant="destructive" 
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  )
}
