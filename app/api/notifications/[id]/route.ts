import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateNotificationSchema } from "@/lib/validations"
import { markNotificationAsRead, deleteNotification } from "@/lib/notification-service"

// Get a specific notification
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get notification and verify it belongs to the user
    const notification = await prisma.notification.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error("[NOTIFICATION_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a notification (mark as read)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    json.id = params.id // Ensure ID is set from path parameter

    // Validate input
    const validationResult = updateNotificationSchema.safeParse(json)
    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.flatten().fieldErrors }, { status: 400 })
    }

    const { id, read } = validationResult.data

    // Mark notification as read
    try {
      const updatedNotification = await markNotificationAsRead(id, session.user.id)
      return NextResponse.json(updatedNotification)
    } catch (error) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[NOTIFICATION_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a notification
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
      await deleteNotification(params.id, session.user.id)
      return NextResponse.json({ success: true })
    } catch (error) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("[NOTIFICATION_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

