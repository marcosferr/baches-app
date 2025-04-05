// Base entity with audit fields
export interface BaseEntity {
  id: string;
  created_by?: string;
  updated_by?: string;
  date_created?: string;
  date_modified?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// User entity
export interface User extends BaseEntity {
  name: string;
  email: string;
  role: "citizen" | "admin" | "ADMIN" | "CITIZEN";
  avatar?: string;
}

// Report entity
export interface Report extends BaseEntity {
  picture: string;
  description: string;
  severity: "low" | "medium" | "high" | "LOW" | "MEDIUM" | "HIGH";
  status:
    | "pending"
    | "in_progress"
    | "resolved"
    | "rejected"
    | "PENDING"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "REJECTED";
  // Support both old and new data structures
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  // Direct properties from database schema
  latitude?: number;
  longitude?: number;
  address?: string;
  comments?: Comment[];
  // Author information
  author?: User;
  authorId?: string;
  // Comment count
  _count?: {
    comments: number;
  };
}

// Comment entity
export interface Comment extends BaseEntity {
  report_id?: string;
  reportId?: string;
  text: string;
  user: User;
  userId?: string;
}

// Notification entity
export interface Notification extends BaseEntity {
  user_id?: string;
  userId?: string;
  title: string;
  message: string;
  type:
    | "report_status"
    | "comment"
    | "approval"
    | "priority"
    | "REPORT_STATUS"
    | "COMMENT"
    | "APPROVAL"
    | "PRIORITY";
  read: boolean;
  related_id?: string;
  relatedId?: string;
}

// Report creation DTO
export interface CreateReportDTO {
  picture: string;
  description: string;
  severity: "low" | "medium" | "high" | "LOW" | "MEDIUM" | "HIGH";
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
}

// Comment creation DTO
export interface CreateCommentDTO {
  report_id: string;
  text: string;
}

// Report filter options
export interface ReportFilterOptions {
  status?: ("pending" | "in_progress" | "resolved" | "rejected")[];
  severity?: ("low" | "medium" | "high")[];
  userId?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}
