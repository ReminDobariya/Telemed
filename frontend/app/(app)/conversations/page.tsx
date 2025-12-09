"use client"

import { useEffect, useState } from "react"
import { ConversationsAPI } from "@/lib/api"
import { Button } from "@/components/ui/button"

type Conversation = { id: string; createdAt: string; updatedAt: string; messageCount: number }

export default function ConversationsPage() {
  const [items, setItems] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await ConversationsAPI.list()
        if (ignore) return
        const mapped: Conversation[] = res.conversations.map((c: any) => ({
          id: c._id,
          createdAt: new Date(c.createdAt).toLocaleString(),
          updatedAt: new Date(c.updatedAt).toLocaleString(),
          messageCount: (c.messages?.length ?? 0),
        }))
        setItems(mapped)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { ignore = true }
  }, [])

  async function createConversation() {
    const res = await ConversationsAPI.create()
    const c = res.conversation
    setItems(prev => [{
      id: c._id,
      createdAt: new Date(c.createdAt).toLocaleString(),
      updatedAt: new Date(c.updatedAt).toLocaleString(),
      messageCount: (c.messages?.length ?? 0),
    }, ...prev])
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-pretty text-xl font-semibold">Conversations</h1>
          <p className="text-sm text-muted-foreground">Your recent AI chats</p>
        </div>
        <Button onClick={createConversation}>New conversation</Button>
      </div>

      <div className="grid gap-2">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Conversation {c.id.slice(0,8)}...</p>
                  <p className="text-xs text-muted-foreground">Updated {c.updatedAt} • {c.messageCount} messages</p>
                </div>
                <a className="text-sm underline" href={`/app/real-chat?conversationId=${encodeURIComponent(c.id)}`}>Open</a>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}


