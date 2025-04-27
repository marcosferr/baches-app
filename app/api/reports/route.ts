import { NextResponse } from "next/server";
import { withCors } from "@/lib/apply-cors";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createReportSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notification-service";
import { sendReportNotificationEmail } from "@/lib/email-service";
import { RateLimiter } from "@/lib/rate-limiter";
import { toReportDTO, toArrayDTO } from "@/lib/dto";

// Rate limiter: max 5 report creations per hour
const createReportLimiter = new RateLimiter({
  interval: 60 * 60 * 1000, // 1 hour
  maxRequests: 20,
});

// Get all reports (with optional filters)
async function getReports(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse filters
    const status = searchParams.get("status")?.split(",") as
      | ("PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED")[]
      | undefined;
    const severity = searchParams.get("severity")?.split(",") as
      | ("LOW" | "MEDIUM" | "HIGH")[]
      | undefined;
    const userId = searchParams.get("userId");
    const lat = searchParams.get("lat")
      ? Number.parseFloat(searchParams.get("lat")!)
      : undefined;
    const lng = searchParams.get("lng")
      ? Number.parseFloat(searchParams.get("lng")!)
      : undefined;
    const radius = searchParams.get("radius")
      ? Number.parseFloat(searchParams.get("radius")!)
      : undefined;

    // Build query filters
    const where: any = {};

    if (status?.length) {
      where.status = { in: status };
    }

    if (severity?.length) {
      where.severity = { in: severity };
    }

    if (userId) {
      where.authorId = userId;
    }

    // Geographic query if lat, lng and radius are provided
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      // This is a simplified approach - in a real app, use geospatial queries
      // or calculate distance in the database if supported
      where.AND = [
        { latitude: { gte: lat - radius } },
        { latitude: { lte: lat + radius } },
        { longitude: { gte: lng - radius } },
        { longitude: { lte: lng + radius } },
      ];
    }

    // Query with pagination
    const page = Number.parseInt(searchParams.get("page") || "1");

    // Parse limit parameter - special value "-1" means no limit
    let limit: number | undefined;
    const limitParam = searchParams.get("limit");
    if (limitParam === "-1") {
      limit = undefined; // No limit
    } else {
      limit = Number.parseInt(limitParam || "10");
    }

    const skip = (page - 1) * (limit || 0);

    // Build query options
    const queryOptions: any = {
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
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

    // Add pagination parameters if needed
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

    return NextResponse.json({
      reports: reportDTOs,
      pagination: {
        page,
        limit: limit || total, // If no limit was set, use total count
        total,
        pages: limit ? Math.ceil(total / limit) : 1, // If no limit, just one page
      },
    });
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new report
async function createReport(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const rateLimited = await createReportLimiter.check(session.user.id);
    if (rateLimited) {
      return NextResponse.json(
        { error: "Too many reports created. Please try again later." },
        { status: 429 }
      );
    }

    const json = await request.json();

    // Validate input
    const validationResult = createReportSchema.safeParse(json);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { picture, description, severity, latitude, longitude, address } =
      validationResult.data;

    // Create the report
    const report = await prisma.report.create({
      data: {
        picture,
        description,
        severity,
        status: "SUBMITTED",
        latitude,
        longitude,
        address,
        author: {
          connect: { id: session.user.id },
        },
      },
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

    // Transform report to DTO to remove sensitive information
    const reportDTO = toReportDTO(report);

    return NextResponse.json(reportDTO, { status: 201 });
  } catch (error) {
    console.error("[REPORTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the handler functions with CORS support
export const GET = withCors(getReports);
export const POST = withCors(createReport);
