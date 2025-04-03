"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCheck, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { ApiService } from "@/lib/api-service"
import type { Notification } from "@/types"

export function NotificationList() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const currentUser = ApiService.getCurrentUser()
        const fetchedNotifications = await ApiService.getNotificationsByUserId(currentUser.id)
        setNotifications(fetchedNotifications)
      } catch (error) {
        toast({
          title: "Error al cargar notificaciones",
          description: "No se pudieron cargar las notificaciones. Por favor intenta nuevamente.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [toast])

  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await ApiService.markNotificationAsRead(id)
      setNotifications(
        notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída.",
        variant: "destructive",
      })
    }
  }

  // Delete notification
  const handleDelete = async (id: string) => {
    try {
      await ApiService.deleteNotification(id)
      setNotifications(notifications.filter((notification) => notification.id !== id))
      toast({
        title: "Notificación eliminada",
        description: "La notificación ha sido eliminada exitosamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación.",
        variant: "destructive",
      })
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const currentUser = ApiService.getCurrentUser()
      await ApiService.markAllNotificationsAsRead(currentUser.id)
      setNotifications(notifications.map((notification) => ({ ...notification, read: true })))
      toast({
        title: "Notificaciones leídas",
        description: "Todas las notificaciones han sido marcadas como leídas.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron marcar todas las notificaciones como leídas.",
        variant: "destructive",
      })
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-PY", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "report_status":
        return "RS"
      case "comment":
        return "CM"
      case "approval":
        return "AP"
      case "priority":
        return "PR"
      default:
        return "NT"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Notificaciones</h3>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Cargando notificaciones...</div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-1 rounded-lg border">
          {notifications.map((notification, index) => (
            <div key={notification.id}>
              <div
                className={`flex items-start gap-4 p-3 transition-colors hover:bg-muted/50 ${
                  !notification.read ? "bg-orange-50 dark:bg-orange-950/20" : ""
                }`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getNotificationIcon(notification.type)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>{notification.title}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(notification.date_created)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                <div className="flex gap-1">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="h-8 w-8"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(notification.id)}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {index < notifications.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border py-8 text-center">
          <Bell className="mb-2 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No hay notificaciones</h3>
          <p className="text-sm text-muted-foreground">No tienes notificaciones en este momento.</p>
        </div>
      )}
    </div>
  )
}

