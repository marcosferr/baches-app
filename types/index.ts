// Base entity with audit fields
export interface BaseEntity {
  id: string
  created_by: string
  updated_by: string
  date_created: string
  date_modified: string
}

// User entity
export interface User extends BaseEntity {
  name: string
  email: string
  role: "citizen" | "admin"
  avatar?: string
}

// Report entity
export interface Report extends BaseEntity {
  picture: string
  description: string
  severity: "low" | "medium" | "high"
  status: "pending" | "in_progress" | "resolved" | "rejected"
  location: {
    lat: number
    lng: number
    address?: string
  }
  comments?: Comment[]
}

// Comment entity
export interface Comment extends BaseEntity {
  report_id: string
  text: string
  user: User
}

// Notification entity
export interface Notification extends BaseEntity {
  user_id: string
  title: string
  message: string
  type: "report_status" | "comment" | "approval" | "priority"
  read: boolean
  related_id?: string // ID of the related entity (report, comment, etc.)
}

// Report creation DTO
export interface CreateReportDTO {
  picture: string
  description: string
  severity: "low" | "medium" | "high"
  location: {
    lat: number
    lng: number
  }
}

// Comment creation DTO
export interface CreateCommentDTO {
  report_id: string
  text: string
}

// Report filter options
export interface ReportFilterOptions {
  status?: ("pending" | "in_progress" | "resolved" | "rejected")[]
  severity?: ("low" | "medium" | "high")[]
  userId?: string
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
}

