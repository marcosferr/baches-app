// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "citizen";
  createdAt: Date;
}

// Report related types
export interface CreateReportDTO {
  picture: string;
  description: string;
  severity: string;
  location: {
    lat: number;
    lng: number;
    address?: string | null;
  };
}

export interface Report {
  id: string;
  userId: string;
  picture: string;
  description: string;
  status: "SUBMITTED" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  severity: "LOW" | "MEDIUM" | "HIGH";
  latitude: number;
  longitude: number;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  comments?: Comment[];
  timeline?: ReportTimeline[];
}

export interface ReportFilterOptions {
  status?: string[];
  severity?: string[];
  userId?: string;
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

// Comment related types
export interface CreateCommentDTO {
  report_id: string;
  text: string;
}

export interface Comment {
  id: string;
  reportId: string;
  userId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

// Notification related types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;
  reportUpdates: boolean;
  comments: boolean;
  email: boolean;
}

// ReportTimeline related types
export interface ReportTimeline {
  id: string;
  reportId: string;
  previousStatus?:
    | "SUBMITTED"
    | "PENDING"
    | "IN_PROGRESS"
    | "RESOLVED"
    | "REJECTED";
  newStatus: "SUBMITTED" | "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  changedById: string;
  changedBy?: User;
  notes?: string;
  createdAt: Date;
}

// Report Analytics types
export interface ReportTimeMetrics {
  averageResolutionTime: number; // in milliseconds
  averageTimeInProgress: number; // in milliseconds
  averageTimeToApprove: number; // in milliseconds (SUBMITTED -> PENDING)
  totalResolvedCount: number;
  totalInProgressCount: number;
  totalPendingCount: number;
  totalSubmittedCount: number;
  totalRejectedCount: number;
}
