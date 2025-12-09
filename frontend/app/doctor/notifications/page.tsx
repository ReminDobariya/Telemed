"use client"

import { useEffect, useState } from "react"
import { NotificationsAPI } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, Check, CheckCheck } from "lucide-react"

export default function DoctorNotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    async function load() {
      try {
        const res = await NotificationsAPI.list()
        if (!ignore) {
          setNotifications(res.notifications || [])
          setUnreadCount(res.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to load notifications:', error)
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 30000) // Refresh every 30 seconds
    return () => {
      ignore = true
      clearInterval(interval)
    }
  }, [])

  async function markAsRead(id: string) {
    try {
      await NotificationsAPI.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      await NotificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      toast({ title: "Success", description: "All notifications marked as read" })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  return (
    <section className="space-y-4 w-full max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-pretty text-xl sm:text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="w-full sm:w-auto">
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No notifications</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-4 hover:bg-muted/50 transition-colors ${
                    !notif.isRead ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Bell className={`h-4 w-4 shrink-0 ${notif.isRead ? 'text-muted-foreground' : 'text-primary'}`} />
                        <h3 className="font-medium break-words">{notif.title}</h3>
                        {!notif.isRead && <Badge variant="secondary" className="text-xs shrink-0">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground break-words">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notif._id)}
                        className="shrink-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}


