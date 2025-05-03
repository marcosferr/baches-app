import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createPostalPDF } from "./postal-pdf-creator";

// Maximum area in square meters (1 km²) is enforced on the client side

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await request.json();
    const { name, points } = json;

    if (!name || !points || !Array.isArray(points) || points.length < 3) {
      return NextResponse.json(
        { error: "Invalid input. Name and at least 3 points are required." },
        { status: 400 }
      );
    }

    // Create a GeoJSON polygon from the points
    // Note: GeoJSON uses [longitude, latitude] format, but our points are [latitude, longitude]
    const polygonPoints = points.map(([lat, lng]) => [lng, lat]);

    // Close the polygon by adding the first point at the end if needed
    if (
      polygonPoints[0][0] !== polygonPoints[polygonPoints.length - 1][0] ||
      polygonPoints[0][1] !== polygonPoints[polygonPoints.length - 1][1]
    ) {
      polygonPoints.push(polygonPoints[0]);
    }

    // Create GeoJSON polygon
    const polygon = {
      type: "Polygon",
      coordinates: [polygonPoints],
    };

    // Query reports within the polygon
    // Debug the polygon
    console.log("Polygon for query:", JSON.stringify(polygon));

    // Use ST_Intersects instead of ST_Within and ensure location is not null
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
        u.name as "userName"
      FROM "Report" r
      JOIN "User" u ON r."authorId" = u.id
      WHERE r.location IS NOT NULL
      AND ST_Intersects(
        r.location,
        ST_GeomFromGeoJSON(${JSON.stringify(polygon)})
      )
      AND r.status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')
      ORDER BY r."createdAt" DESC
    `;

    // If no reports found with location field, try using latitude/longitude directly
    let reportsArray = reports as any[];

    if (!reportsArray || reportsArray.length === 0) {
      console.log(
        "No reports found using location field, trying with lat/lng directly"
      );

      // Extract polygon bounds
      const lats = polygonPoints.map((point) => point[1]);
      const lngs = polygonPoints.map((point) => point[0]);

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      // Query using lat/lng bounds as a fallback
      const fallbackReports = await prisma.$queryRaw`
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
          u.name as "userName"
        FROM "Report" r
        JOIN "User" u ON r."authorId" = u.id
        WHERE r.latitude BETWEEN ${minLat} AND ${maxLat}
        AND r.longitude BETWEEN ${minLng} AND ${maxLng}
        AND r.status IN ('PENDING', 'IN_PROGRESS', 'RESOLVED')
        ORDER BY r."createdAt" DESC
      `;

      reportsArray = fallbackReports as any[];
      console.log(`Found ${reportsArray.length} reports using lat/lng bounds`);
    }

    if (!reportsArray || reportsArray.length === 0) {
      console.log("No reports found in the selected area");
      // Generate PDF with no reports message
      const pdfBuffer = await createPostalPDF(name, []);

      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="postal-${name.replace(
            /\s+/g,
            "-"
          )}.pdf"`,
        },
      });
    }

    // Generate PDF
    const pdfBuffer = await createPostalPDF(name, reportsArray);

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="postal-${name.replace(
          /\s+/g,
          "-"
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[POSTALS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
