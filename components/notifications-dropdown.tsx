"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, Trash, CheckCircle, Clock, MessageSquare } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { markAsRead, markAllAsRead, removeNotification, getNotifications } from "@/lib/actions/notification-actions"
import { useToast } from "@/hooks/use-toast"

export function NotificationsDropdown() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const result = await getNotifications({ limit: 5 })
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch notifications when dropdown is opened
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Refresh notifications every minute when dropdown is open
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 60000)

    return () => clearInterval(interval)
  }, [isOpen])

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
      toast({
        title: "Notificaciones leídas",
        description: "Todas las notificaciones han sido marcadas como leídas.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
      setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeNotification(id)
      const wasUnread = notifications.find((n) => n.id === id)?.read === false
      setNotifications(notifications.filter((n) => n.id !== id))
      if (wasUnread) {
        setUnreadCount((prevCount) => Math.max(0, prevCount - 1))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación.",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) {
      return "ahora mismo"
    } else if (diffMins < 60) {
      return `hace ${diffMins} min${diffMins === 1 ? "" : "s"}`
    } else if (diffHours < 24) {
      return `hace ${diffHours} hora${diffHours === 1 ? "" : "s"}`
    } else if (diffDays < 7) {
      return `hace ${diffDays} día${diffDays === 1 ? "" : "s"}`
    } else {
      return date.toLocaleDateString("es-PY", {
        day: "numeric",
        month: "short",
      })
    }
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "REPORT_STATUS":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "COMMENT":
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case "APPROVAL":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PRIORITY":
        return <Bell className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 p-0 text-xs text-white"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-4">
          <DropdownMenuLabel className="flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && <Badge variant="secondary">{unreadCount} sin leer</Badge>}
          </DropdownMenuLabel>

          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleMarkAllAsRead}>
              <CheckCheck className="mr-1 h-3 w-3" /> Marcar todo como leído
            </Button>
          )}
        </div>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-pulse text-muted-foreground">Cargando...</div>
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={`flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 ${
                    !notification.read ? "bg-orange-50 dark:bg-orange-950/20" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-transparent">{getNotificationIcon(notification.type)}</AvatarFallback>
                  </Avatar>
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      // Mark as read if not already
                      if (!notification.read) {
                        handleMarkAsRead(notification.id)
                      }

                      // Navigate to relevant page if relatedId exists
                      if (notification.relatedId) {
                        // Simplified navigation - in a real app, check notification type and navigate accordingly
                        if (notification.type === "REPORT_STATUS") {
                          router.push(`/reports/${notification.relatedId}`)
                        } else if (notification.type === "COMMENT") {
                          router.push(`/comments/${notification.relatedId}`)
                        }
                      }

                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${!notification.read ? "font-semibold" : ""}`}>{notification.title}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(notification.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="h-6 w-6"
                      >
                        <CheckCheck className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(notification.id)}
                      className="h-6 w-6 text-destructive"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
              <h3 className="mb-1 text-sm font-medium">No hay notificaciones</h3>
              <p className="text-xs text-muted-foreground">No tienes notificaciones en este momento</p>
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="justify-center text-sm">
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              router.push("/notifications")
              setIsOpen(false)
            }}
          >
            Ver todas las notificaciones
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

