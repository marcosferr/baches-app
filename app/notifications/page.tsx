"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  Trash,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiService } from "@/lib/api-service";
import { format } from "date-fns";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notifications = await ApiService.getNotificationsByUserId();
      setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await ApiService.markNotificationAsRead(id);
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await ApiService.deleteNotification(id);
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "REPORT_STATUS":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "APPROVAL":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case "COMMENT":
        return <Bell className="h-5 w-5 text-purple-500" />;
      case "PRIORITY":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-muted-foreground">
            Mantente informado sobre el estado de tus reportes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
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
          {unreadCount > 0 && (
            <Badge variant="secondary">{unreadCount} sin leer</Badge>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">
                Cargando notificaciones...
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={`flex items-start gap-4 p-3 transition-colors hover:bg-muted/50 ${
                        !notification.read
                          ? "bg-orange-50 dark:bg-orange-950/20"
                          : ""
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-transparent">
                          {getNotificationIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`font-medium ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
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
                  <h3 className="mb-1 text-lg font-medium">
                    No hay notificaciones
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    No tienes notificaciones que coincidan con tu búsqueda.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
