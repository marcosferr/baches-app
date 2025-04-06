/**
 * Example of how to update your existing report-actions.ts file
 * to use PostGIS for geographic queries
 */

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Severity, Status } from "@prisma/client";

export async function getReports(filters?: {
  status?: ("PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED")[];
  severity?: ("LOW" | "MEDIUM" | "HIGH")[];
  userId?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // radius in meters
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

    // Query with pagination
    const page = filters?.page || 1;
    const limit = Math.min(filters?.limit || 10, 50); // Max 50 items per page
    const skip = (page - 1) * limit;

    // Geographic query if lat, lng and radius are provided
    if (
      filters?.latitude !== undefined &&
      filters?.longitude !== undefined &&
      filters?.radius !== undefined
    ) {
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
            ST_SetSRID(ST_MakePoint(${filters.longitude}, ${filters.latitude}), 4326)
          ) as distance
        FROM "Report" r
        JOIN "User" u ON r."authorId" = u.id
        WHERE ST_DWithin(
          r.location,
          ST_SetSRID(ST_MakePoint(${filters.longitude}, ${filters.latitude}), 4326),
          ${filters.radius}
        )
        ${filters?.status?.length ? 
          `AND r.status IN (${filters.status.map(s => `'${s}'`).join(',')})` : ''}
        ${filters?.severity?.length ? 
          `AND r.severity IN (${filters.severity.map(s => `'${s}'`).join(',')})` : ''}
        ${filters?.userId ? 
          `AND r."authorId" = '${filters.userId}'` : ''}
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
          ST_SetSRID(ST_MakePoint(${filters.longitude}, ${filters.latitude}), 4326),
          ${filters.radius}
        )
        ${filters?.status?.length ? 
          `AND r.status IN (${filters.status.map(s => `'${s}'`).join(',')})` : ''}
        ${filters?.severity?.length ? 
          `AND r.severity IN (${filters.severity.map(s => `'${s}'`).join(',')})` : ''}
        ${filters?.userId ? 
          `AND r."authorId" = '${filters.userId}'` : ''}
      `;
      
      const total = parseInt((totalResult as any)[0].total);

      return {
        reports: formattedReports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } else {
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

      return {
        reports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }
  } catch (error) {
    console.error("Error getting reports:", error);
    throw new Error("Failed to fetch reports");
  }
}

// Other functions remain the same
