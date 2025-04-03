import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to view your profile" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
        // We don't select the password for security
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[USER_PROFILE_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "You must be logged in to update your profile" }, { status: 401 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const avatarFile = formData.get("avatar") as File | null

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Handle avatar upload if present
    let avatarUrl = undefined
    if (avatarFile) {
      // In a real app, you'd upload this to a storage service like AWS S3 or Vercel Blob
      // For this example, we'll just pretend we did
      avatarUrl = `/avatars/${session.user.id}.jpg` // This is a placeholder
    }

    // Update the user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error("[USER_PROFILE_PUT]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

