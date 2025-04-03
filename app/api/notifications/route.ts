import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { markAllNotificationsAsRead } from "@/lib/notification-service"

// Get user notifications
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get("unread") === "true"

    // Get notifications with pagination
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Math.min(Number.parseInt(searchParams.get("limit") || "20"), 50) // Max 50 items per page
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

    return NextResponse.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    })
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Mark all notifications as read
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await markAllNotificationsAsRead(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[NOTIFICATIONS_MARK_ALL_READ]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

