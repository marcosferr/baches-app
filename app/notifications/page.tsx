"use client"

import { useState } from "react"
import { Bell, CheckCircle, Clock, AlertTriangle, Search, Filter, ChevronDown, Trash, CheckCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Datos de ejemplo
const mockNotifications = [
  {
    id: "1",
    title: "Reporte aprobado",
    message: "Tu reporte en Av. Independencia 1234 ha sido aprobado y está pendiente de reparación.",
    date: "2023-10-15",
    read: false,
    type: "approved",
  },
  {
    id: "2",
    title: "Reporte en proceso",
    message: "Tu reporte en Calle San Martín 567 ha sido marcado como 'En Proceso'. La reparación comenzará pronto.",
    date: "2023-10-10",
    read: true,
    type: "in_progress",
  },
  {
    id: "3",
    title: "Reporte resuelto",
    message: "¡Buenas noticias! Tu reporte en Ruta 1 km 23 ha sido reparado. Gracias por tu colaboración.",
    date: "2023-09-28",
    read: true,
    type: "resolved",
  },
  {
    id: "4",
    title: "Comentario nuevo",
    message: "Ana Silva ha comentado en tu reporte: 'Este bache es muy peligroso, casi tuve un accidente.'",
    date: "2023-10-16",
    read: false,
    type: "comment",
  },
  {
    id: "5",
    title: "Prioridad actualizada",
    message: "La prioridad de tu reporte en Av. Libertad 890 ha sido aumentada debido a los votos de otros ciudadanos.",
    date: "2023-10-14",
    read: false,
    type: "priority",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "approved":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "resolved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "comment":
        return <Bell className="h-5 w-5 text-purple-500" />
      case "priority":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">Mantente informado sobre el estado de tus reportes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4" />
            Marcar todo como leído
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar notificaciones..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Todas las notificaciones</CardTitle>
          {unreadCount > 0 && <Badge variant="secondary">{unreadCount} sin leer</Badge>}
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`flex items-start gap-4 p-3 transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-orange-50 dark:bg-orange-950/20" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-transparent">
                        {getNotificationIcon(notification.type)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${!notification.read ? "font-semibold" : ""}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-muted-foreground">{notification.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          className="h-8 w-8"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-8 w-8 text-red-500"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {index < filteredNotifications.length - 1 && <Separator />}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="mb-2 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-1 text-lg font-medium">No hay notificaciones</h3>
                <p className="text-sm text-muted-foreground">No tienes notificaciones que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

