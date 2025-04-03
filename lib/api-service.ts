import { v4 as uuidv4 } from "uuid"
import type {
  Report,
  Comment,
  Notification,
  User,
  CreateReportDTO,
  CreateCommentDTO,
  ReportFilterOptions,
} from "@/types"

// Mock current user
const CURRENT_USER: User = {
  id: "user-1",
  name: "Juan Pérez",
  email: "juan@example.com",
  role: "citizen",
  created_by: "system",
  updated_by: "system",
  date_created: new Date().toISOString(),
  date_modified: new Date().toISOString(),
}

// Mock users data
const mockUsers: User[] = [
  CURRENT_USER,
  {
    id: "user-2",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    created_by: "system",
    updated_by: "system",
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  },
  {
    id: "user-3",
    name: "María González",
    email: "maria@example.com",
    role: "citizen",
    created_by: "system",
    updated_by: "system",
    date_created: new Date().toISOString(),
    date_modified: new Date().toISOString(),
  },
]

// Mock reports data
const mockReports: Report[] = [
  {
    id: "report-1",
    picture: "/placeholder.svg?height=300&width=400",
    description: "Bache profundo en la avenida principal, peligroso para motocicletas",
    severity: "high",
    status: "pending",
    location: {
      lat: -27.3364,
      lng: -55.8675,
      address: "Av. Independencia 1234",
    },
    created_by: "user-1",
    updated_by: "user-1",
    date_created: "2023-10-15T14:30:00Z",
    date_modified: "2023-10-15T14:30:00Z",
  },
  {
    id: "report-2",
    picture: "/placeholder.svg?height=300&width=400",
    description: "Bache de tamaño mediano cerca del semáforo, afecta el tráfico",
    severity: "medium",
    status: "in_progress",
    location: {
      lat: -27.33,
      lng: -55.87,
      address: "Calle San Martín 567",
    },
    created_by: "user-3",
    updated_by: "user-2",
    date_created: "2023-10-10T09:15:00Z",
    date_modified: "2023-10-12T11:20:00Z",
  },
  {
    id: "report-3",
    picture: "/placeholder.svg?height=300&width=400",
    description: "Pequeño bache en la esquina, no muy profundo pero en crecimiento",
    severity: "low",
    status: "resolved",
    location: {
      lat: -27.34,
      lng: -55.86,
      address: "Ruta 1 km 23",
    },
    created_by: "user-3",
    updated_by: "user-2",
    date_created: "2023-09-28T16:45:00Z",
    date_modified: "2023-10-05T10:30:00Z",
  },
]

// Mock comments data
const mockComments: Comment[] = [
  {
    id: "comment-1",
    report_id: "report-1",
    text: "Este bache es muy peligroso, casi tuve un accidente.",
    user: mockUsers[2], // María
    created_by: "user-3",
    updated_by: "user-3",
    date_created: "2023-10-16T08:20:00Z",
    date_modified: "2023-10-16T08:20:00Z",
  },
  {
    id: "comment-2",
    report_id: "report-2",
    text: "Ya veo equipos trabajando en la reparación.",
    user: mockUsers[0], // Juan
    created_by: "user-1",
    updated_by: "user-1",
    date_created: "2023-10-13T14:10:00Z",
    date_modified: "2023-10-13T14:10:00Z",
  },
]

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "notification-1",
    user_id: "user-1",
    title: "Reporte aprobado",
    message: "Tu reporte en Av. Independencia 1234 ha sido aprobado y está pendiente de reparación.",
    type: "report_status",
    read: false,
    related_id: "report-1",
    created_by: "system",
    updated_by: "system",
    date_created: "2023-10-15T15:00:00Z",
    date_modified: "2023-10-15T15:00:00Z",
  },
  {
    id: "notification-2",
    user_id: "user-3",
    title: "Reporte en proceso",
    message: 'Tu reporte en Calle San Martín 567 ha sido marcado como "En Proceso". La reparación comenzará pronto.',
    type: "report_status",
    read: true,
    related_id: "report-2",
    created_by: "system",
    updated_by: "system",
    date_created: "2023-10-12T11:25:00Z",
    date_modified: "2023-10-12T11:25:00Z",
  },
  {
    id: "notification-3",
    user_id: "user-3",
    title: "Reporte resuelto",
    message: "¡Buenas noticias! Tu reporte en Ruta 1 km 23 ha sido reparado. Gracias por tu colaboración.",
    type: "report_status",
    read: true,
    related_id: "report-3",
    created_by: "system",
    updated_by: "system",
    date_created: "2023-10-05T10:35:00Z",
    date_modified: "2023-10-05T10:35:00Z",
  },
  {
    id: "notification-4",
    user_id: "user-1",
    title: "Comentario nuevo",
    message: 'María González ha comentado en tu reporte: "Este bache es muy peligroso, casi tuve un accidente."',
    type: "comment",
    read: false,
    related_id: "comment-1",
    created_by: "system",
    updated_by: "system",
    date_created: "2023-10-16T08:25:00Z",
    date_modified: "2023-10-16T08:25:00Z",
  },
]

// In-memory data store
let reports = [...mockReports]
let comments = [...mockComments]
let notifications = [...mockNotifications]
const users = [...mockUsers]

// Helper function to get current timestamp
const getCurrentTimestamp = (): string => {
  return new Date().toISOString()
}

// Helper function to get user by ID
const getUserById = (userId: string): User | undefined => {
  return users.find((user) => user.id === userId)
}

// API Service
export const ApiService = {
  // Current user
  getCurrentUser: (): User => {
    return CURRENT_USER
  },

  // Reports
  getReports: async (filters?: ReportFilterOptions): Promise<Report[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    if (!filters) return reports

    return reports.filter((report) => {
      // Filter by status
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(report.status)) return false
      }

      // Filter by severity
      if (filters.severity && filters.severity.length > 0) {
        if (!filters.severity.includes(report.severity)) return false
      }

      // Filter by user
      if (filters.userId) {
        if (report.created_by !== filters.userId) return false
      }

      // Filter by geographic bounds
      if (filters.bounds) {
        const { lat, lng } = report.location
        const { north, south, east, west } = filters.bounds

        if (lat > north || lat < south || lng > east || lng < west) return false
      }

      return true
    })
  },

  getReportById: async (id: string): Promise<Report | undefined> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const report = reports.find((r) => r.id === id)

    if (report) {
      // Get comments for this report
      const reportComments = comments.filter((c) => c.report_id === id)
      return { ...report, comments: reportComments }
    }

    return undefined
  },

  createReport: async (reportData: CreateReportDTO): Promise<Report> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const timestamp = getCurrentTimestamp()
    const newReport: Report = {
      id: `report-${uuidv4()}`,
      ...reportData,
      status: "pending",
      created_by: CURRENT_USER.id,
      updated_by: CURRENT_USER.id,
      date_created: timestamp,
      date_modified: timestamp,
    }

    reports = [...reports, newReport]

    // Create notification for admin
    const adminUser = users.find((u) => u.role === "admin")
    if (adminUser) {
      const notification: Notification = {
        id: `notification-${uuidv4()}`,
        user_id: adminUser.id,
        title: "Nuevo reporte recibido",
        message: `Un nuevo reporte ha sido enviado por ${CURRENT_USER.name} y está pendiente de revisión.`,
        type: "report_status",
        read: false,
        related_id: newReport.id,
        created_by: "system",
        updated_by: "system",
        date_created: timestamp,
        date_modified: timestamp,
      }

      notifications = [...notifications, notification]
    }

    return newReport
  },

  updateReportStatus: async (id: string, status: Report["status"]): Promise<Report | undefined> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    const reportIndex = reports.findIndex((r) => r.id === id)

    if (reportIndex === -1) return undefined

    const timestamp = getCurrentTimestamp()
    const updatedReport = {
      ...reports[reportIndex],
      status,
      updated_by: CURRENT_USER.id,
      date_modified: timestamp,
    }

    reports = [...reports.slice(0, reportIndex), updatedReport, ...reports.slice(reportIndex + 1)]

    // Create notification for report creator
    const reportCreator = updatedReport.created_by
    if (reportCreator !== CURRENT_USER.id) {
      let statusMessage = ""

      switch (status) {
        case "pending":
          statusMessage = "está pendiente de revisión"
          break
        case "in_progress":
          statusMessage = 'ha sido marcado como "En Proceso". La reparación comenzará pronto'
          break
        case "resolved":
          statusMessage = "ha sido reparado. Gracias por tu colaboración"
          break
        case "rejected":
          statusMessage = "ha sido rechazado. Por favor, contacta con soporte para más información"
          break
      }

      const notification: Notification = {
        id: `notification-${uuidv4()}`,
        user_id: reportCreator,
        title: `Actualización de reporte`,
        message: `Tu reporte en ${updatedReport.location.address || "la ubicación seleccionada"} ${statusMessage}.`,
        type: "report_status",
        read: false,
        related_id: updatedReport.id,
        created_by: "system",
        updated_by: "system",
        date_created: timestamp,
        date_modified: timestamp,
      }

      notifications = [...notifications, notification]
    }

    return updatedReport
  },

  // Comments
  getCommentsByReportId: async (reportId: string): Promise<Comment[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return comments.filter((c) => c.report_id === reportId)
  },

  createComment: async (commentData: CreateCommentDTO): Promise<Comment> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const timestamp = getCurrentTimestamp()
    const newComment: Comment = {
      id: `comment-${uuidv4()}`,
      ...commentData,
      user: CURRENT_USER,
      created_by: CURRENT_USER.id,
      updated_by: CURRENT_USER.id,
      date_created: timestamp,
      date_modified: timestamp,
    }

    comments = [...comments, newComment]

    // Get the report
    const report = reports.find((r) => r.id === commentData.report_id)

    // Create notification for report creator if the commenter is not the creator
    if (report && report.created_by !== CURRENT_USER.id) {
      const notification: Notification = {
        id: `notification-${uuidv4()}`,
        user_id: report.created_by,
        title: "Comentario nuevo",
        message: `${CURRENT_USER.name} ha comentado en tu reporte: "${commentData.text.substring(0, 50)}${commentData.text.length > 50 ? "..." : ""}"`,
        type: "comment",
        read: false,
        related_id: newComment.id,
        created_by: "system",
        updated_by: "system",
        date_created: timestamp,
        date_modified: timestamp,
      }

      notifications = [...notifications, notification]
    }

    return newComment
  },

  // Notifications
  getNotificationsByUserId: async (userId: string): Promise<Notification[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    return notifications.filter((n) => n.user_id === userId)
  },

  markNotificationAsRead: async (id: string): Promise<Notification | undefined> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const notificationIndex = notifications.findIndex((n) => n.id === id)

    if (notificationIndex === -1) return undefined

    const timestamp = getCurrentTimestamp()
    const updatedNotification = {
      ...notifications[notificationIndex],
      read: true,
      updated_by: CURRENT_USER.id,
      date_modified: timestamp,
    }

    notifications = [
      ...notifications.slice(0, notificationIndex),
      updatedNotification,
      ...notifications.slice(notificationIndex + 1),
    ]

    return updatedNotification
  },

  markAllNotificationsAsRead: async (userId: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400))

    const timestamp = getCurrentTimestamp()

    notifications = notifications.map((notification) => {
      if (notification.user_id === userId && !notification.read) {
        return {
          ...notification,
          read: true,
          updated_by: CURRENT_USER.id,
          date_modified: timestamp,
        }
      }
      return notification
    })
  },

  deleteNotification: async (id: string): Promise<void> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    notifications = notifications.filter((n) => n.id !== id)
  },
}

