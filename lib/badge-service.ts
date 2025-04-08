import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { toBadgeDTO, toArrayDTO } from "@/lib/dto";
import { LEADERBOARD_CATEGORIES } from "@/types";
import { createNotification } from "@/lib/notification-service";

/**
 * Get all badges for the current user
 */
export async function getUserBadges() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const badges = await prisma.userBadge.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        earnedAt: "desc",
      },
    });

    return {
      badges: toArrayDTO(badges, toBadgeDTO),
    };
  } catch (error) {
    console.error("[GET_USER_BADGES_ERROR]", error);
    throw error;
  }
}

/**
 * Award a badge to a user if they don't already have it
 */
export async function awardBadge(userId: string, badgeType: keyof typeof LEADERBOARD_CATEGORIES) {
  try {
    // Check if user already has this badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeType,
      },
    });

    if (existingBadge) {
      return null; // User already has this badge
    }

    // Award the badge
    const badge = await prisma.userBadge.create({
      data: {
        userId,
        badgeType,
      },
    });

    // Create a notification for the user
    const badgeInfo = LEADERBOARD_CATEGORIES[badgeType];
    await createNotification({
      userId,
      title: `¡Has ganado una insignia!`,
      message: `Has obtenido la insignia "${badgeInfo.name}": ${badgeInfo.description}`,
      type: "BADGE_EARNED",
      relatedId: badge.id,
    });

    return badge;
  } catch (error) {
    console.error("[AWARD_BADGE_ERROR]", error);
    throw error;
  }
}

/**
 * Check and award badges based on user activity
 * This should be called after relevant actions (creating reports, comments, etc.)
 */
export async function checkAndAwardBadges(userId: string) {
  try {
    // Get user reports
    const reports = await prisma.report.findMany({
      where: {
        authorId: userId,
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Get user comments
    const comments = await prisma.comment.count({
      where: {
        userId,
      },
    });

    // Check for CAZADOR_DE_CRATERES (high severity reports)
    const highSeverityReports = reports.filter(r => r.severity === "HIGH").length;
    if (highSeverityReports >= 5) {
      await awardBadge(userId, "CAZADOR_DE_CRATERES");
    }

    // Check for GUARDIAN_DEL_ASFALTO (verified reports)
    const verifiedReports = reports.filter(r => r.status === "RESOLVED").length;
    if (verifiedReports >= 3) {
      await awardBadge(userId, "GUARDIAN_DEL_ASFALTO");
    }

    // Check for FOTOGRAFO_URBANO (reports with comments)
    const reportsWithComments = reports.filter(r => r._count.comments > 0).length;
    if (reportsWithComments >= 3) {
      await awardBadge(userId, "FOTOGRAFO_URBANO");
    }

    // Check for DETECTIVE_NOCTURNO (reports at night)
    const nightReports = reports.filter(r => {
      const hour = new Date(r.createdAt).getHours();
      return hour >= 20 || hour <= 6;
    }).length;
    if (nightReports >= 3) {
      await awardBadge(userId, "DETECTIVE_NOCTURNO");
    }

    // Check for MAESTRO_DEL_DETALLE (detailed descriptions)
    const detailedReports = reports.filter(r => r.description.length > 100).length;
    if (detailedReports >= 3) {
      await awardBadge(userId, "MAESTRO_DEL_DETALLE");
    }

    // Check for REPORTERO_VELOZ (first to report)
    // This is more complex and would require comparing with other reports
    // For simplicity, we'll award it based on having at least 10 reports
    if (reports.length >= 10) {
      await awardBadge(userId, "REPORTERO_VELOZ");
    }

    // Check for CARTOGRAFO_URBANO (reports in different areas)
    // For simplicity, we'll award it based on having at least 5 reports
    if (reports.length >= 5) {
      await awardBadge(userId, "CARTOGRAFO_URBANO");
    }

    // Check for HEROE_DEL_BARRIO (reports in same area)
    // For simplicity, we'll award it based on having at least 3 reports
    if (reports.length >= 3) {
      await awardBadge(userId, "HEROE_DEL_BARRIO");
    }

  } catch (error) {
    console.error("[CHECK_BADGES_ERROR]", error);
    throw error;
  }
}
