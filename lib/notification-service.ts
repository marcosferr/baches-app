import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";
import { sendNotificationEmail } from "@/lib/email-service";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedId?: string;
}

/**
 * Creates a notification for a user
 */
export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedId,
}: CreateNotificationParams) {
  try {
    // Check if the user has disabled this type of notification
    const userPreferences = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    // If user has explicitly disabled this notification type, don't create notification
    if (
      userPreferences &&
      ((type === "REPORT_STATUS" && !userPreferences.reportUpdates) ||
        (type === "COMMENT" && !userPreferences.comments))
    ) {
      return null;
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        read: false,
        relatedId,
        user: {
          connect: { id: userId },
        },
      },
    });

    // If email notifications are enabled and we have email service configured
    if (userPreferences?.email) {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user?.email) {
        // Send email notification
        await sendNotificationEmail({
          to: user.email,
          title,
          message,
        });
      }
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(id: string, userId: string) {
  try {
    return await prisma.notification.update({
      where: {
        id,
        userId,
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string, userId: string) {
  try {
    await prisma.notification.delete({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}
