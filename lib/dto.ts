import type { User, Report, Comment, Notification } from "@/types";

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
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar || null,
    role: user.role?.toLowerCase() as "admin" | "citizen",
    createdAt: user.createdAt,
  };
}

/**
 * Transforms a user object into a minimal DTO with only basic identification
 * Used when including user references in other DTOs
 */
export function toMinimalUserDTO(user: any): { id: string; name: string; avatar: string | null } {
  return {
    id: user.id,
    name: user.name,
    avatar: user.avatar || null,
  };
}

/**
 * Transforms a report object into a safe DTO
 */
export function toReportDTO(report: any): Omit<Report, "userId"> & { author?: ReturnType<typeof toMinimalUserDTO> } {
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

  return result;
}

/**
 * Transforms a comment object into a safe DTO
 */
export function toCommentDTO(comment: any): Omit<Comment, "userId"> & { user?: ReturnType<typeof toMinimalUserDTO> } {
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
 * Transforms an array of any entity type using the appropriate DTO transformer
 */
export function toArrayDTO<T>(items: any[], transformer: (item: any) => T): T[] {
  return items.map(transformer);
}
