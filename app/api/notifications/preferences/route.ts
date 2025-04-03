import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { notificationPreferencesSchema } from "@/lib/validations"

// Get user notification preferences
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("[NOTIFICATION_PREFS_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update notification preferences
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()

    // Validate input
    const validationResult = notificationPreferencesSchema.safeParse(json)
    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.flatten().fieldErrors }, { status: 400 })
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

    return NextResponse.json(preferences)
  } catch (error) {
    console.error("[NOTIFICATION_PREFS_PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

