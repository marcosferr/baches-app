import {
  createReport,
  getReports,
  getReportById,
  updateReport,
  deleteReport,
} from "@/lib/actions/report-actions";

import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from "@/lib/actions/comment-actions";

import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  removeNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/actions/notification-actions";

import {
  getProfile,
  updateProfile,
  getUserStats,
  getUserActivities,
} from "@/lib/actions/profile-actions";

import type {
  ReportFilterOptions,
  CreateReportDTO,
  CreateCommentDTO,
  User,
  ReportTimeline,
  ReportTimeMetrics,
  UserBadgeDTO,
  LeaderboardEntryDTO,
  LEADERBOARD_CATEGORIES,
} from "@/types";

// API Service
export const ApiService = {
  // Reports
  getReports: async (filters?: ReportFilterOptions) => {
    try {
      // Updated the center calculation and radius for geographic filtering
      let centerLat, centerLng, radius;

      if (filters?.bounds) {
        centerLat = (filters.bounds.north + filters.bounds.south) / 2;
        centerLng = (filters.bounds.east + filters.bounds.west) / 2;

        // Calculate radius as half the maximum dimension
        radius =
          Math.max(
            Math.abs(filters.bounds.north - filters.bounds.south),
            Math.abs(filters.bounds.east - filters.bounds.west)
          ) / 2;
      }

      // Use a reasonable page size to prevent memory issues
      const response = await getReports({
        status: filters?.status?.map((s) => s.toUpperCase()) as any,
        severity: filters?.severity?.map((s) => s.toUpperCase()) as any,
        userId: filters?.userId,
        latitude: centerLat,
        longitude: centerLng,
        radius: radius,
        page: 1,
        limit: 100, // Use a reasonable limit instead of unlimited
      });

      return response.reports;
    } catch (error) {
      console.error("Error getting reports:", error);
      throw error;
    }
  },

  // Get reports with pagination information
  getReportsWithPagination: async (
    filters?: ReportFilterOptions & { page?: number; limit?: number }
  ) => {
    try {
      // Updated the center calculation and radius for geographic filtering
      let centerLat, centerLng, radius;

      if (filters?.bounds) {
        centerLat = (filters.bounds.north + filters.bounds.south) / 2;
        centerLng = (filters.bounds.east + filters.bounds.west) / 2;

        // Calculate radius as half the maximum dimension
        radius =
          Math.max(
            Math.abs(filters.bounds.north - filters.bounds.south),
            Math.abs(filters.bounds.east - filters.bounds.west)
          ) / 2;
      }

      const response = await getReports({
        status: filters?.status?.map((s) => s.toUpperCase()) as any,
        severity: filters?.severity?.map((s) => s.toUpperCase()) as any,
        userId: filters?.userId,
        latitude: centerLat,
        longitude: centerLng,
        radius: radius,
        page: filters?.page || 1,
        limit: filters?.limit || 20, // Default to 20 items per page
      });

      return response; // Return full response with pagination info
    } catch (error) {
      console.error("Error getting paginated reports:", error);
      throw error;
    }
  },

  getReportById: async (id: string) => {
    try {
      return await getReportById(id);
    } catch (error) {
      console.error("Error getting report by ID:", error);
      throw error;
    }
  },

  createReport: async (reportData: CreateReportDTO) => {
    try {
      return await createReport({
        picture: reportData.picture,
        description: reportData.description,
        severity: reportData.severity,
        latitude: reportData.location.lat,
        longitude: reportData.location.lng,
        address: reportData.location.address,
      });
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  },

  updateReportStatus: async (id: string, status: string) => {
    try {
      const { report } = await updateReport(id, { status });
      return report;
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  },

  deleteReport: async (id: string) => {
    try {
      return await deleteReport(id);
    } catch (error) {
      console.error("Error deleting report:", error);
      throw error;
    }
  },

  // Comments
  getCommentsByReportId: async (reportId: string) => {
    try {
      return await getComments(reportId);
    } catch (error) {
      console.error("Error getting comments:", error);
      throw error;
    }
  },

  createComment: async (commentData: CreateCommentDTO) => {
    try {
      const { comment } = await createComment({
        reportId: commentData.report_id,
        text: commentData.text,
      });
      return comment;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  },

  updateComment: async (id: string, text: string) => {
    try {
      const { comment } = await updateComment(id, { text });
      return comment;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  },

  deleteComment: async (id: string) => {
    try {
      return await deleteComment(id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  },

  // Notifications
  getNotificationsByUserId: async () => {
    try {
      const { notifications } = await getNotifications({
        unreadOnly: false,
        page: 1,
        limit: 50,
      });
      return notifications;
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await removeNotification(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  // Profile
  getUserProfile: async () => {
    try {
      const { user } = await getProfile();
      return user;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  },

  updateUserProfile: async (data: { name?: string; avatar?: string }) => {
    try {
      const { user } = await updateProfile(data);
      return user;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const { stats } = await getUserStats();
      return stats;
    } catch (error) {
      console.error("Error getting user stats:", error);
      throw error;
    }
  },

  getUserActivities: async (limit = 3) => {
    try {
      const { activities } = await getUserActivities(limit);
      return activities;
    } catch (error) {
      console.error("Error getting user activities:", error);
      throw error;
    }
  },

  // Notification Preferences
  getNotificationPreferences: async () => {
    try {
      return await getNotificationPreferences();
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      throw error;
    }
  },

  updateNotificationPreferences: async (preferences: {
    reportUpdates: boolean;
    comments: boolean;
    email: boolean;
  }) => {
    try {
      const { preferences: updatedPreferences } =
        await updateNotificationPreferences(preferences);
      return updatedPreferences;
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  },

  // Report Timeline
  getReportTimeline: async (reportId: string): Promise<ReportTimeline[]> => {
    try {
      const response = await fetch(`/api/reports/${reportId}/timeline`);
      if (!response.ok) {
        throw new Error(`Error fetching timeline: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting report timeline:", error);
      throw error;
    }
  },

  // Report Analytics
  getReportAnalytics: async (): Promise<ReportTimeMetrics> => {
    try {
      const response = await fetch("/api/reports/analytics");
      if (!response.ok) {
        throw new Error(`Error fetching analytics: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting report analytics:", error);
      throw error;
    }
  },

  // Badges
  getUserBadges: async (): Promise<UserBadgeDTO[]> => {
    try {
      const response = await fetch("/api/user/badges");
      if (!response.ok) {
        throw new Error(`Error fetching badges: ${response.statusText}`);
      }
      const data = await response.json();
      return data.badges;
    } catch (error) {
      console.error("Error getting user badges:", error);
      throw error;
    }
  },

  // Leaderboard
  getAllLeaderboards: async (limit = 5) => {
    try {
      const response = await fetch(`/api/leaderboard?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Error fetching leaderboards: ${response.statusText}`);
      }
      const data = await response.json();
      return data.leaderboards;
    } catch (error) {
      console.error("Error getting leaderboards:", error);
      throw error;
    }
  },

  getCategoryLeaderboard: async (
    category: keyof typeof LEADERBOARD_CATEGORIES,
    limit = 10
  ) => {
    try {
      const response = await fetch(
        `/api/leaderboard/${category}?limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching leaderboard: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error getting category leaderboard:", error);
      throw error;
    }
  },

  getUserLeaderboardRanks: async () => {
    try {
      const response = await fetch("/api/user/leaderboard");
      if (!response.ok) {
        throw new Error(
          `Error fetching user leaderboard ranks: ${response.statusText}`
        );
      }
      const data = await response.json();
      return data.entries;
    } catch (error) {
      console.error("Error getting user leaderboard ranks:", error);
      throw error;
    }
  },
};
