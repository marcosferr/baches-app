"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notification-service";
import { sendReportNotificationEmail } from "@/lib/email-service";
import { createTimelineEntry } from "@/lib/report-timeline-service";
import { createReportSchema, updateReportSchema } from "@/lib/validations";
import { RateLimiter } from "@/lib/rate-limiter";
import { toReportDTO, toArrayDTO } from "@/lib/dto";
import { checkAndAwardBadges } from "@/lib/badge-service";
import { updateLeaderboardScores } from "@/lib/leaderboard-service";
import { updateReportCountRanking } from "@/lib/actions/leaderboard-actions";
import type { z } from "zod";
import { Severity, Status } from "@prisma/client";

// Rate limiter: max 5 report creations per hour
const createReportLimiter = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
});

export async function getReports(filters?: {
  status?: ("PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED")[];
  severity?: ("LOW" | "MEDIUM" | "HIGH")[];
  userId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  page?: number;
  limit?: number;
}) {
  try {
    // Build query filters
    const where: any = {};

    if (filters?.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters?.severity?.length) {
      where.severity = { in: filters.severity };
    }

    if (filters?.userId) {
      where.authorId = filters.userId;
    }

    // Geographic query if lat, lng and radius are provided
    if (
      filters?.latitude !== undefined &&
      filters?.longitude !== undefined &&
      filters?.radius !== undefined
    ) {
      // This is a simplified approach - in a real app, use geospatial queries
      where.AND = [
        { latitude: { gte: filters.latitude - filters.radius } },
        { latitude: { lte: filters.latitude + filters.radius } },
        { longitude: { gte: filters.longitude - filters.radius } },
        { longitude: { lte: filters.longitude + filters.radius } },
      ];
    }

    // Query with pagination
    const page = filters?.page || 1;
    // Use a reasonable default limit to prevent memory issues
    // Special case: if limit is -1, use a higher but still safe limit (100)
    const limit = filters?.limit === -1 ? 100 : filters?.limit || 20;
    const skip = (page - 1) * limit;

    // Build query options with optimized data selection
    const queryOptions: any = {
      where,
      select: {
        id: true,
        status: true,
        severity: true,
        latitude: true,
        longitude: true,
        address: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        // Only include a thumbnail URL for the picture, not the full data
        picture: true,
        authorId: true,
        // Select minimal author information
        author: {
          select: {
            id: true,
            name: true,
            // Exclude email to reduce data size
            avatar: true,
          },
        },
        // Just get the count of comments, not the comments themselves
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    };

    // Add pagination parameters if limit is defined
    if (skip > 0) {
      queryOptions.skip = skip;
    }

    if (limit !== undefined) {
      queryOptions.take = limit;
    }

    const reports = await prisma.report.findMany(queryOptions);

    // Get total count for pagination
    const total = await prisma.report.count({ where });

    // Transform reports to DTOs to remove sensitive information
    const reportDTOs = toArrayDTO(reports, toReportDTO);

    return {
      reports: reportDTOs,
      pagination: {
        page,
        limit: limit || total, // If no limit was set, use total count
        total,
        pages: limit ? Math.ceil(total / limit) : 1, // If no limit, just one page
      },
    };
  } catch (error) {
    console.error("Error getting reports:", error);
    throw new Error("Failed to fetch reports");
  }
}

export async function getReportById(id: string) {
  try {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        comments: {
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
        },
      },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    // Transform report to DTO to remove sensitive information
    return toReportDTO(report);
  } catch (error) {
    console.error("Error getting report:", error);
    throw new Error("Failed to fetch report");
  }
}

interface CreateReportData {
  picture: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  latitude: number;
  longitude: number;
  address?: string;
}

export async function createReport(data: CreateReportData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        picture: data.picture,
        description: data.description,
        severity: data.severity as Severity,
        status: Status.SUBMITTED,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        author: {
          connect: { id: session.user.id },
        },
      },
    });

    // Create initial timeline entry
    await createTimelineEntry({
      reportId: report.id,
      newStatus: Status.SUBMITTED,
      changedById: session.user.id,
      notes: "Report created",
    });

    // Check and award badges
    await checkAndAwardBadges(session.user.id);

    // Update leaderboard scores
    await updateLeaderboardScores(session.user.id);

    // Update specific ranking for report count
    await updateReportCountRanking();

    // Notify admins about new report
    const admins = await prisma.user.findMany({
      where: {
        role: "ADMIN",
      },
      select: {
        id: true,
      },
    });

    // Create notifications for all admins
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "Nuevo reporte recibido",
        message: `${session.user.name} ha enviado un nuevo reporte que requiere revisión.`,
        type: "REPORT_STATUS",
        relatedId: report.id,
      });
    }

    // Send email notification
    try {
      await sendReportNotificationEmail({
        id: report.id,
        description: report.description,
        severity: report.severity,
        status: report.status,
        latitude: report.latitude,
        longitude: report.longitude,
        address: report.address || undefined,
        authorName: session.user.name || "Usuario",
      });
    } catch (emailError) {
      // Log error but don't fail the report creation
      console.error("Error sending email notification:", emailError);
    }

    revalidatePath("/my-reports");
    return report;
  } catch (error) {
    console.error("[CREATE_REPORT]", error);
    throw new Error("Failed to create report");
  }
}

export async function getUserReports(page = 1, limit = 20) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Query with pagination
    const reports = await prisma.report.findMany({
      where: {
        authorId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
      skip: skip,
      take: limit,
    });

    // Get total count for pagination
    const total = await prisma.report.count({
      where: {
        authorId: session.user.id,
      },
    });

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[GET_USER_REPORTS]", error);
    throw new Error("Failed to get user reports");
  }
}

export async function updateReport(
  id: string,
  data: z.infer<typeof updateReportSchema>
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to update a report");
    }

    // Check if report exists
    const existingReport = await prisma.report.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingReport) {
      throw new Error("Report not found");
    }

    // Check permissions - only author can update description/severity, only admin can update status
    const isAuthor = existingReport.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new Error("You don't have permission to update this report");
    }
    // Validate input
    const validationResult = updateReportSchema.safeParse(data);
    if (!validationResult.success) {
      throw new Error(
        Object.values(validationResult.error.flatten().fieldErrors)
          .flat()
          .join(", ")
      );
    }

    const { status, description, severity, address } = validationResult.data;

    // Build update data
    const updateData: any = {};

    if (description && isAuthor) {
      updateData.description = description;
    }

    if (severity && isAuthor) {
      updateData.severity = severity;
    }

    if (address && isAuthor) {
      updateData.address = address;
    }

    if (status && isAdmin) {
      updateData.status = status;
    }

    // Update the report
    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData,
    });

    // Create timeline entry if status changed
    if (status && isAdmin && status !== existingReport.status) {
      // Create timeline entry
      await createTimelineEntry({
        reportId: id,
        previousStatus: existingReport.status as Status,
        newStatus: status as Status,
        changedById: session.user.id,
      });

      // Create notification for status change
      let statusMessage = "";

      switch (status) {
        case "SUBMITTED":
          statusMessage = "ha sido enviado y está en espera de aprobación";
          break;
        case "PENDING":
          statusMessage = "ha sido aprobado y está pendiente de revisión";
          break;
        case "IN_PROGRESS":
          statusMessage = "está en proceso de atención";
          break;
        case "RESOLVED":
          statusMessage = "ha sido resuelto";
          break;
        case "REJECTED":
          statusMessage = "ha sido rechazado";
          break;
      }

      // Notify the report author about the status change
      await createNotification({
        userId: existingReport.authorId,
        title: "Estado del reporte actualizado",
        message: `Tu reporte en ${
          existingReport.address || "la ubicación indicada"
        } ${statusMessage}.`,
        type: "REPORT_STATUS",
        relatedId: id,
      });

      // Send email notification about status change
      try {
        // Get updated report with author information
        const reportWithAuthor = await prisma.report.findUnique({
          where: { id },
          include: {
            author: {
              select: {
                name: true,
              },
            },
          },
        });

        if (reportWithAuthor) {
          await sendReportNotificationEmail({
            id: reportWithAuthor.id,
            description: reportWithAuthor.description,
            severity: reportWithAuthor.severity,
            status: reportWithAuthor.status,
            latitude: reportWithAuthor.latitude,
            longitude: reportWithAuthor.longitude,
            address: reportWithAuthor.address || undefined,
            authorName: reportWithAuthor.author?.name || "Usuario",
          });
        }
      } catch (emailError) {
        // Log error but don't fail the update
        console.error(
          "Error sending status change email notification:",
          emailError
        );
      }
    }

    // Revalidate report pages
    revalidatePath(`/reports/${id}`);
    revalidatePath("/map");
    revalidatePath("/my-reports");
    revalidatePath("/admin/reports");

    return { success: true, report: updatedReport };
  } catch (error) {
    console.error("Error updating report:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update report");
  }
}

export async function deleteReport(id: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("You must be logged in to delete a report");
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      throw new Error("Report not found");
    }

    // Check permissions - only author or admin can delete
    const isAuthor = report.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      throw new Error("You don't have permission to delete this report");
    }

    // Delete related comments first (to avoid foreign key constraints)
    await prisma.comment.deleteMany({
      where: { reportId: id },
    });

    // Delete related notifications
    await prisma.notification.deleteMany({
      where: { relatedId: id },
    });

    // Delete the report
    await prisma.report.delete({
      where: { id },
    });

    // Revalidate report pages
    revalidatePath("/map");
    revalidatePath("/my-reports");
    revalidatePath("/admin/reports");

    return { success: true };
  } catch (error) {
    console.error("Error deleting report:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to delete report");
  }
}
