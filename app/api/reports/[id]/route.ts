import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateReportSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notification-service";
import { sendReportNotificationEmail } from "@/lib/email-service";
import { createTimelineEntry } from "@/lib/report-timeline-service";
import { toReportDTO } from "@/lib/dto";
import { Status } from "@prisma/client";

// Get a specific report
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await prisma.report.findUnique({
      where: {
        id: params.id,
      },
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
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Transform report to DTO to remove sensitive information
    const reportDTO = toReportDTO(report);

    return NextResponse.json(reportDTO);
  } catch (error) {
    console.error("[REPORT_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a report
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    json.id = params.id; // Ensure ID is set from path parameter

    // Validate input
    const validationResult = updateReportSchema.safeParse(json);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, status, description, severity, address } =
      validationResult.data;

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
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check permissions - only author can update description/severity, only admin can update status
    const isAuthor = existingReport.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
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
        await sendReportNotificationEmail({
          id: updatedReport.id,
          description: updatedReport.description,
          severity: updatedReport.severity,
          status: updatedReport.status,
          latitude: updatedReport.latitude,
          longitude: updatedReport.longitude,
          address: updatedReport.address || undefined,
          authorName: updatedReport.author?.name || "Usuario",
        });
      } catch (emailError) {
        // Log error but don't fail the update
        console.error(
          "Error sending status change email notification:",
          emailError
        );
      }
    }

    // Transform report to DTO to remove sensitive information
    const reportDTO = toReportDTO(updatedReport);

    return NextResponse.json(reportDTO);
  } catch (error) {
    console.error("[REPORT_PATCH]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a report
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if report exists
    const report = await prisma.report.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check permissions - only author or admin can delete
    const isAuthor = report.authorId === session.user.id;
    const isAdmin = session.user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete related comments first (to avoid foreign key constraints)
    await prisma.comment.deleteMany({
      where: { reportId: params.id },
    });

    // Delete related notifications
    await prisma.notification.deleteMany({
      where: { relatedId: params.id },
    });

    // Delete the report
    await prisma.report.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[REPORT_DELETE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
