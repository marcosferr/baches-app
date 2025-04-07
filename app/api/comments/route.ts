import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notification-service";
import { RateLimiter } from "@/lib/rate-limiter";
import { toCommentDTO, toArrayDTO } from "@/lib/dto";

// Rate limiter: max 10 comments per 5 minutes
const commentLimiter = new RateLimiter({
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
});

// Get comments for a report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID is required" },
        { status: 400 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: {
        reportId,
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform comments to DTOs to remove sensitive information
    const commentDTOs = toArrayDTO(comments, toCommentDTO);

    return NextResponse.json(commentDTOs);
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new comment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimited = await commentLimiter.check(session.user.id);
    if (rateLimited) {
      return NextResponse.json(
        { error: "Too many comments posted. Please try again later." },
        { status: 429 }
      );
    }

    const json = await request.json();

    // Validate input
    const validationResult = createCommentSchema.safeParse(json);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { reportId, text } = validationResult.data;

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Create the comment
    const comment = await prisma.comment.create({
      data: {
        text,
        report: {
          connect: { id: reportId },
        },
        user: {
          connect: { id: session.user.id },
        },
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
      },
    });

    // Notify the report author if it's not their own comment
    if (report.authorId !== session.user.id) {
      await createNotification({
        userId: report.authorId,
        title: "Nuevo comentario en tu reporte",
        message: `${session.user.name} comentó en tu reporte: "${
          text.length > 50 ? text.substring(0, 50) + "..." : text
        }"`,
        type: "COMMENT",
        relatedId: comment.id,
      });
    }

    // Transform comment to DTO to remove sensitive information
    const commentDTO = toCommentDTO(comment);

    return NextResponse.json(commentDTO, { status: 201 });
  } catch (error) {
    console.error("[COMMENTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
