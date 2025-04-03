"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "@/lib/notification-service"
import { notificationPreferencesSchema } from "@/lib/validations"
import type { z } from "zod"

export async function getNotifications({
  unreadOnly = false,
  page = 1,
  limit = 20,
}: {
  unreadOnly?: boolean
  page?: number
  limit?: number
}) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("You must be logged in to get notifications")
    }

    // Cap limit at 50
    limit = Math.min(limit, 50)
    const skip = (page - 1) * limit

    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    })

    // Get total count for pagination
    const total = await prisma.notification.count({
      where: {
        userId: session.user.id,
        ...(unreadOnly ? { read: false } : {}),
      },
    })

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId: session.user.id,
        read: false,
      },
    })

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    }
  } catch (error) {
    console.error("Error getting notifications:", error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Failed to fetch notifications")
  }
}

export async function markAsRead(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("You must be logged in to mark notifications as read")
    }

    await markNotificationAsRead(id, session.user.id)

    revalidatePath("/notifications")

    return { success: true }
  } catch (error) {
    console.error("Error marking notification as read:", error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Failed to mark notification as read")
  }
}

export async function markAllAsRead() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("You must be logged in to mark notifications as read")
    }

    await markAllNotificationsAsRead(session.user.id)

    revalidatePath("/notifications")

    return { success: true }
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Failed to mark all notifications as read")
  }
}

export async function removeNotification(id: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("You must be logged in to delete notifications")
    }

    await deleteNotification(id, session.user.id)

    revalidatePath("/notifications")

    return { success: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Failed to delete notification")
  }
}

export async function getNotificationPreferences() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("You must be logged in to get notification preferences")
    }

    // Get user preferences or create default if doesn't exist
    let preferences = await prisma.notificationPreference.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!preferences) {
      // Create default preferences
      preferences = await prisma.notificationPreference.create({
        data: {
          userId: session.user.id,
          reportUpdates: true,
          comments: true,
          email: true,
        },
      })
    }

    return preferences
  } catch (error) {
    console.error("Error getting notification preferences:", error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Failed to get notification preferences")
  }
}

export async function updateNotificationPreferences(data: z.infer<typeof notificationPreferencesSchema>) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new Error("You must be logged in to update notification preferences")
    }

    // Validate input
    const validationResult = notificationPreferencesSchema.safeParse(data)
    if (!validationResult.success) {
      throw new Error(Object.values(validationResult.error.flatten().fieldErrors).flat().join(", "))
    }

    const { reportUpdates, comments, email } = validationResult.data

    // Update preferences (upsert to create if doesn't exist)
    const preferences = await prisma.notificationPreference.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        reportUpdates,
        comments,
        email,
      },
      create: {
        userId: session.user.id,
        reportUpdates,
        comments,
        email,
      },
    })

    revalidatePath("/notifications/preferences")

    return { success: true, preferences }
  } catch (error) {
    console.error("Error updating notification preferences:", error)
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("Failed to update notification preferences")
  }
}

