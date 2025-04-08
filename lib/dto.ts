import type {
  User,
  Report,
  Comment,
  Notification,
  ReportTimeline,
  UserBadge,
  UserBadgeDTO,
  LeaderboardEntry,
  LeaderboardEntryDTO,
  LEADERBOARD_CATEGORIES,
} from "@/types";

/**
 * Data Transfer Object (DTO) utilities
 * These functions transform database entities into safe objects for frontend consumption
 * by removing sensitive information
 */

/**
 * Transforms a user object into a safe DTO by removing sensitive information
 */
export function toUserDTO(user: any): Omit<User, "email"> {
  // Return only safe user properties
  const result: any = {
    id: user.id,
    name: user.name,
    avatar: user.avatar || null,
    role: user.role?.toLowerCase() as "admin" | "citizen",
    createdAt: user.createdAt,
  };

  // Include badges if available
  if (user.badges) {
    result.badges = user.badges.map(toBadgeDTO);
  }

  return result;
}

/**
 * Transforms a user object into a minimal DTO with only basic identification
 * Used when including user references in other DTOs
 */
export function toMinimalUserDTO(user: any): {
  id: string;
  name: string;
  avatar: string | null;
} {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar || null,
  };
}

/**
 * Transforms a report object into a safe DTO
 */
export function toReportDTO(
  report: any
): Omit<Report, "userId"> & { author?: ReturnType<typeof toMinimalUserDTO> } {
  const result: any = {
    id: report.id,
    picture: report.picture,
    description: report.description,
    status: report.status,
    severity: report.severity,
    latitude: report.latitude,
    longitude: report.longitude,
    address: report.address || null,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
  };

  // Include comment count if available
  if (report._count?.comments !== undefined) {
    result._count = {
      comments: report._count.comments,
    };
  }

  // Include minimal author information if available
  if (report.author) {
    result.author = toMinimalUserDTO(report.author);
  }

  // Include comments if available
  if (report.comments) {
    result.comments = report.comments.map(toCommentDTO);
  }

  // Include timeline if available
  if (report.timeline) {
    result.timeline = report.timeline.map(toReportTimelineDTO);
  }

  return result;
}

/**
 * Transforms a comment object into a safe DTO
 */
export function toCommentDTO(
  comment: any
): Omit<Comment, "userId"> & { user?: ReturnType<typeof toMinimalUserDTO> } {
  const result: any = {
    id: comment.id,
    reportId: comment.reportId,
    text: comment.text,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };

  // Include minimal user information if available
  if (comment.user) {
    result.user = toMinimalUserDTO(comment.user);
  }

  return result;
}

/**
 * Transforms a notification object into a safe DTO
 */
export function toNotificationDTO(notification: any): Notification {
  return {
    id: notification.id,
    userId: notification.userId, // This is safe as users can only access their own notifications
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt,
  };
}

/**
 * Transforms a report timeline entry into a safe DTO
 */
export function toReportTimelineDTO(timeline: any): ReportTimeline {
  const result: any = {
    id: timeline.id,
    reportId: timeline.reportId,
    previousStatus: timeline.previousStatus,
    newStatus: timeline.newStatus,
    changedById: timeline.changedById,
    notes: timeline.notes,
    createdAt: timeline.createdAt,
  };

  // Include minimal user information if available
  if (timeline.changedBy) {
    result.changedBy = toMinimalUserDTO(timeline.changedBy);
  }

  return result;
}

/**
 * Transforms a user badge into a DTO with category information
 */
export function toBadgeDTO(badge: any): UserBadgeDTO {
  const badgeType = badge.badgeType as keyof typeof LEADERBOARD_CATEGORIES;
  const categoryInfo = LEADERBOARD_CATEGORIES[badgeType];

  return {
    id: badge.id,
    badgeType: badgeType,
    name: categoryInfo.name,
    description: categoryInfo.description,
    icon: categoryInfo.icon,
    earnedAt: badge.earnedAt,
  };
}

/**
 * Transforms a leaderboard entry into a DTO with user and category information
 */
export function toLeaderboardEntryDTO(entry: any): LeaderboardEntryDTO {
  const category = entry.category as keyof typeof LEADERBOARD_CATEGORIES;
  const categoryInfo = LEADERBOARD_CATEGORIES[category];

  return {
    id: entry.id,
    user: toMinimalUserDTO(entry.user),
    category: category,
    categoryName: categoryInfo.name,
    categoryIcon: categoryInfo.icon,
    score: entry.score,
    rank: entry.rank,
  };
}

/**
 * Transforms an array of any entity type using the appropriate DTO transformer
 */
export function toArrayDTO<T>(
  items: any[],
  transformer: (item: any) => T
): T[] {
  return items.map(transformer);
}
