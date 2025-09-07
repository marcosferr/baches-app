import { NextResponse } from "next/server";
import { withCors } from "@/lib/apply-cors";
import { prisma } from "@/lib/prisma";
import { createExternalReportSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notification-service";
import { sendReportNotificationEmail } from "@/lib/email-service";
import { hash } from "bcrypt";

// Helper function to validate and format base64 image
function validateBase64Image(base64String: string): string {
  try {
    // Check if it's already a data URL
    if (base64String.startsWith("data:image/")) {
      return base64String;
    }

    // If it's just base64 data, try to determine the MIME type
    // For now, assume JPEG as default
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error("Error validating base64 image:", error);
    throw new Error("Invalid base64 image format");
  }
}

// Helper function to determine severity based on detection results
function determineSeverity(detectedDamages: any[]): "LOW" | "MEDIUM" | "HIGH" {
  if (!Array.isArray(detectedDamages) || detectedDamages.length === 0) {
    return "LOW";
  }

  // Calculate average confidence
  const avgConfidence =
    detectedDamages.reduce((sum, damage) => {
      return sum + (damage.confidence || 0);
    }, 0) / detectedDamages.length;

  // Determine severity based on confidence and number of damages
  if (avgConfidence > 0.8 || detectedDamages.length > 3) {
    return "HIGH";
  } else if (avgConfidence > 0.6 || detectedDamages.length > 1) {
    return "MEDIUM";
  } else {
    return "LOW";
  }
}

// Helper function to generate description from detection results
function generateDescription(detectedDamages: any[], imageId: string): string {
  if (!Array.isArray(detectedDamages) || detectedDamages.length === 0) {
    return `Reporte automático generado desde sistema de detección. ID de imagen: ${imageId}`;
  }

  const damageTypes = detectedDamages.map((d) => d.class || "Daño desconocido");
  const uniqueDamages = Array.from(new Set(damageTypes));
  const damageCount = detectedDamages.length;

  let description = `Reporte automático generado desde sistema de detección. `;
  description += `Se detectaron ${damageCount} daño(s): ${uniqueDamages.join(
    ", "
  )}. `;
  description += `ID de imagen: ${imageId}`;

  // Ensure minimum length requirement
  if (description.length < 10) {
    description += " Reporte generado automáticamente por sistema de IA.";
  }

  return description;
}

// Create a new report from external detection system
async function createExternalReport(request: Request) {
  try {
    // Check for API key authentication
    const apiKey = request.headers.get("x-api-key");
    const expectedApiKey = process.env.EXTERNAL_API_KEY;

    if (!apiKey || !expectedApiKey || apiKey !== expectedApiKey) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid API key" },
        { status: 401 }
      );
    }

    const json = await request.json();

    // Validate input
    const validationResult = createExternalReportSchema.safeParse(json);
    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      image_id,
      image_base64,
      latitude,
      longitude,
      detected_damages,
      timestamp,
      confidence_scores,
      address,
    } = validationResult.data;

    // Parse detected damages JSON
    let parsedDamages: any[] = [];
    try {
      parsedDamages = JSON.parse(detected_damages);
    } catch (error) {
      console.error("Error parsing detected_damages JSON:", error);
      return NextResponse.json(
        { error: "Invalid detected_damages JSON format" },
        { status: 400 }
      );
    }

    // Validate and format the base64 image
    let base64Image: string;
    try {
      base64Image = validateBase64Image(image_base64);
    } catch (error) {
      console.error("Error processing base64 image:", error);
      return NextResponse.json(
        { error: "Invalid base64 image format" },
        { status: 400 }
      );
    }

    // Determine severity and generate description
    const severity = determineSeverity(parsedDamages);
    const description = generateDescription(parsedDamages, image_id);

    // Create the report with a system user or find/create a dedicated external system user
    let externalUserId: string;

    // Try to find existing external system user
    let externalUser = await prisma.user.findFirst({
      where: { email: "external-system@baches-app.com" },
    });

    if (!externalUser) {
      // Create external system user if it doesn't exist
      const hashedPassword = await hash("external-system-password", 12);
      externalUser = await prisma.user.create({
        data: {
          name: "Sistema de Detección Externo",
          email: "external-system@baches-app.com",
          password: hashedPassword,
          role: "CITIZEN",
        },
      });
    }

    externalUserId = externalUser.id;

    // Create the report
    const report = await prisma.report.create({
      data: {
        picture: base64Image,
        description,
        severity,
        status: "SUBMITTED",
        latitude,
        longitude,
        address,
        author: {
          connect: { id: externalUserId },
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

    // Create timeline entry
    await prisma.reportTimeline.create({
      data: {
        reportId: report.id,
        newStatus: "SUBMITTED",
        changedById: externalUserId,
        notes: `Reporte creado desde sistema externo. ID de imagen: ${image_id}. Daños detectados: ${parsedDamages.length}`,
      },
    });

    // Store additional detection metadata (you might want to create a separate table for this)
    // For now, we'll store it in the description or you can extend the Report model

    // Notify admins about new external report
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
        title: "Nuevo reporte automático recibido",
        message: `Sistema de detección ha generado un nuevo reporte que requiere revisión.`,
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
        authorName: "Sistema de Detección Externo",
      });
    } catch (emailError) {
      // Log error but don't fail the report creation
      console.error("Error sending email notification:", emailError);
    }

    // Return success response with additional metadata
    return NextResponse.json(
      {
        success: true,
        report: {
          id: report.id,
          status: report.status,
          severity: report.severity,
          latitude: report.latitude,
          longitude: report.longitude,
          createdAt: report.createdAt,
        },
        detection_metadata: {
          image_id,
          damage_count: parsedDamages.length,
          damage_types: parsedDamages.map((d) => d.class).filter(Boolean),
          avg_confidence:
            parsedDamages.length > 0
              ? parsedDamages.reduce((sum, d) => sum + (d.confidence || 0), 0) /
                parsedDamages.length
              : 0,
          timestamp: timestamp || new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[EXTERNAL_REPORTS_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Export the handler functions with CORS support
export const POST = withCors(createExternalReport);
