/**
 * Example of how to update your reports API route to use PostGIS
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// Get all reports (with optional filters)
export async function GET(request: Request) {
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

    // Query with pagination
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") || "10"),
      50
    ); // Max 50 items per page
    const skip = (page - 1) * limit;

    // Geographic query if lat, lng and radius are provided
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      // Use PostGIS for accurate radius search
      // This uses a raw query with ST_DWithin for better performance and accuracy
      const reports = await prisma.$queryRaw`
        SELECT 
          r.id, 
          r.picture, 
          r.description, 
          r.severity, 
          r.status, 
          r.latitude, 
          r.longitude, 
          r.address,
          r."authorId",
          r."createdAt",
          r."updatedAt",
          u.id as "userId",
          u.name as "userName",
          u.email as "userEmail",
          u.avatar as "userAvatar",
          (SELECT COUNT(*) FROM "Comment" c WHERE c."reportId" = r.id) as "commentCount",
          ST_Distance(
            r.location, 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)
          ) as distance
        FROM "Report" r
        JOIN "User" u ON r."authorId" = u.id
        WHERE ST_DWithin(
          r.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${radius}
        )
        ${status?.length ? 
          `AND r.status IN (${status.map(s => `'${s}'`).join(',')})` : ''}
        ${severity?.length ? 
          `AND r.severity IN (${severity.map(s => `'${s}'`).join(',')})` : ''}
        ${userId ? 
          `AND r."authorId" = '${userId}'` : ''}
        ORDER BY r."createdAt" DESC
        LIMIT ${limit} OFFSET ${skip}
      `;

      // Format the results to match the expected structure
      const formattedReports = reports.map((r: any) => ({
        id: r.id,
        picture: r.picture,
        description: r.description,
        severity: r.severity,
        status: r.status,
        latitude: r.latitude,
        longitude: r.longitude,
        address: r.address,
        authorId: r.authorId,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        distance: r.distance, // This is a new field that shows distance in meters
        author: {
          id: r.userId,
          name: r.userName,
          email: r.userEmail,
          avatar: r.userAvatar,
        },
        _count: {
          comments: parseInt(r.commentCount),
        },
      }));

      // Get total count for pagination using PostGIS
      const totalResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM "Report" r
        WHERE ST_DWithin(
          r.location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${radius}
        )
        ${status?.length ? 
          `AND r.status IN (${status.map(s => `'${s}'`).join(',')})` : ''}
        ${severity?.length ? 
          `AND r.severity IN (${severity.map(s => `'${s}'`).join(',')})` : ''}
        ${userId ? 
          `AND r."authorId" = '${userId}'` : ''}
      `;
      
      const total = parseInt((totalResult as any)[0].total);

      return NextResponse.json({
        reports: formattedReports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } else {
      // Build query filters for non-geographic queries
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

      // Regular query without geographic filtering
      const reports = await prisma.report.findMany({
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
        skip,
        take: limit,
      });

      // Get total count for pagination
      const total = await prisma.report.count({ where });

      return NextResponse.json({
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (error) {
    console.error("[REPORTS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// The rest of the file remains the same
