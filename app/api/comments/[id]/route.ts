import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateCommentSchema } from "@/lib/validations"

// Get a specific comment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const comment = await prisma.comment.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        report: {
          select: {
            id: true,
            description: true,
            status: true,
            authorId: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error("[COMMENT_GET]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update a comment
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const json = await request.json()
    json.id = params.id // Ensure ID is set from path parameter

    // Validate input
    const validationResult = updateCommentSchema.safeParse(json)
    if (!validationResult.success) {
      return NextResponse.json({ errors: validationResult.error.flatten().fieldErrors }, { status: 400 })
    }

    const { id, text } = validationResult.data

    // Check if comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Only the comment author or an admin can edit the comment
    if (comment.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Update the comment
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { text },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error("[COMMENT_PATCH]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete a comment
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: params.id },
      include: {
        report: {
          select: {
            authorId: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    // Check permissions - only comment author, report author, or admin can delete
    const isCommentAuthor = comment.userId === session.user.id
    const isReportAuthor = comment.report.authorId === session.user.id
    const isAdmin = session.user.role === "admin"

    if (!isCommentAuthor && !isReportAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete related notifications
    await prisma.notification.deleteMany({
      where: { relatedId: params.id },
    })

    // Delete the comment
    await prisma.comment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[COMMENT_DELETE]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

