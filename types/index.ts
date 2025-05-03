// User related types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "citizen";
  createdAt: Date;
  badges?: UserBadge[];
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

// Badge related types
export interface UserBadge {
  id: string;
  userId: string;
  badgeType: keyof typeof LEADERBOARD_CATEGORIES;
  earnedAt: Date;
  user?: User;
}

export interface UserBadgeDTO {
  id: string;
  badgeType: keyof typeof LEADERBOARD_CATEGORIES;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

// Leaderboard related types
export interface LeaderboardEntry {
  id: string;
  userId: string;
  category: keyof typeof LEADERBOARD_CATEGORIES;
  score: number;
  rank: number;
  updatedAt: Date;
  user?: User;
}

export interface LeaderboardEntryDTO {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  category: keyof typeof LEADERBOARD_CATEGORIES;
  categoryName: string;
  categoryIcon: string;
  score: number;
  rank: number;
}

export interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const LEADERBOARD_CATEGORIES = {
  REPORTERO_TOP: {
    name: "Reportero Top",
    description: "Mayor número de reportes",
    icon: "🏆",
  },
  CAZADOR_DE_CRATERES: {
    name: "Cazador de Cráteres",
    description: "Mayor número de reportes de baches profundos",
    icon: "🕵️‍♂️",
  },
  GUARDIAN_DEL_ASFALTO: {
    name: "Guardián del Asfalto",
    description: "Mayor número de reportes verificados como precisos",
    icon: "🛡️",
  },
  FOTOGRAFO_URBANO: {
    name: "Fotógrafo Urbano",
    description: "Mejores fotos de reportes según votos",
    icon: "📸",
  },
  DETECTIVE_NOCTURNO: {
    name: "Detective Nocturno",
    description: "Más reportes realizados entre 8PM y 6AM",
    icon: "🌙",
  },
  HEROE_DEL_BARRIO: {
    name: "Héroe del Barrio",
    description: "Más reportes resueltos en una misma zona",
    icon: "🦸‍♂️",
  },
  REPORTERO_VELOZ: {
    name: "Reportero Veloz",
    description: "Primero en reportar baches que luego fueron confirmados",
    icon: "⚡",
  },
  CARTOGRAFO_URBANO: {
    name: "Cartógrafo Urbano",
    description: "Mayor cobertura de área en sus reportes",
    icon: "🗺️",
  },
  MAESTRO_DEL_DETALLE: {
    name: "Maestro del Detalle",
    description: "Reportes con descripciones más completas",
    icon: "🔍",
  },
} as const;

// Postal related types
export interface CreatePostalDTO {
  name: string;
  points: [number, number][];
}

export interface Postal {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  polygon: [number, number][];
  reports?: Report[];
}
