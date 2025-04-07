"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";
import { createCommentSchema, updateCommentSchema } from "@/lib/validations";
import { RateLimiter } from "@/lib/rate-limiter";
import { toCommentDTO, toArrayDTO } from "@/lib/dto";
import type { z } from "zod";

// Rate limiter: max 10 comments per 5 minutes
const commentLimiter = new RateLimiter({
  interval: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10,
});

export async function getComments(reportId: string) {
  try {
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
    return toArrayDTO(comments, toCommentDTO);
  } catch (error) {
    console.error("Error getting comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export async function createComment(data: z.infer<typeof createCommentSchema>) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to comment");
    }

    // Rate limiting
    const rateLimited = await commentLimiter.check(session.user.id);
    if (rateLimited) {
      throw new Error("Too many comments posted. Please try again later.");
    }

    // Validate input
    const validationResult = createCommentSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        Object.values(validationResult.error.flatten().fieldErrors)
          .flat()
          .join(", ")
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
      throw new Error("Report not found");
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

    // Revalidate the report page
    revalidatePath(`/reports/${reportId}`);

    // Transform comment to DTO to remove sensitive information
    const commentDTO = toCommentDTO(comment);

    return { success: true, comment: commentDTO };
  } catch (error) {
    console.error("Error creating comment:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to create comment");
  }
}

export async function updateComment(id: string, data: { text: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to update a comment");
    }

    // Validate input
    const validationResult = updateCommentSchema.safeParse({ id, ...data });
    if (!validationResult.success) {
      throw new Error(
        Object.values(validationResult.error.flatten().fieldErrors)
          .flat()
          .join(", ")
      );
    }

    const { text } = validationResult.data;

    // Check if comment exists and belongs to the user
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        report: true,
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Only the comment author or an admin can edit the comment
    if (comment.userId !== session.user.id && session.user.role !== "admin") {
      throw new Error("You don't have permission to update this comment");
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
    });

    // Revalidate the report page
    revalidatePath(`/reports/${comment.reportId}`);

    // Transform comment to DTO to remove sensitive information
    const commentDTO = toCommentDTO(updatedComment);

    return { success: true, comment: commentDTO };
  } catch (error) {
    console.error("Error updating comment:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update comment");
  }
}

export async function deleteComment(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to delete a comment");
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        report: {
          select: {
            id: true,
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check permissions - only comment author, report author, or admin can delete
    const isCommentAuthor = comment.userId === session.user.id;
    const isReportAuthor = comment.report.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isCommentAuthor && !isReportAuthor && !isAdmin) {
      throw new Error("You don't have permission to delete this comment");
    }

    // Delete related notifications
    await prisma.notification.deleteMany({
      where: { relatedId: id },
    });

    // Delete the comment
    await prisma.comment.delete({
      where: { id },
    });

    // Revalidate the report page
    revalidatePath(`/reports/${comment.reportId}`);

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete comment");
  }
}
