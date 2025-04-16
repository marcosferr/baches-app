import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { toLeaderboardEntryDTO, toArrayDTO } from "@/lib/dto";
import { LEADERBOARD_CATEGORIES } from "@/types";

/**
 * Get leaderboard entries for a specific category
 */
export async function getCategoryLeaderboard(category: keyof typeof LEADERBOARD_CATEGORIES, limit = 10) {
  try {
    const leaderboard = await prisma.leaderboardEntry.findMany({
      where: {
        category,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [
        { score: "desc" },
        { updatedAt: "asc" },
      ],
      take: limit,
    });

    return {
      entries: toArrayDTO(leaderboard, toLeaderboardEntryDTO),
      category,
      categoryInfo: LEADERBOARD_CATEGORIES[category],
    };
  } catch (error) {
    console.error(`[GET_LEADERBOARD_ERROR] Category: ${category}`, error);
    throw error;
  }
}

/**
 * Get all leaderboard categories with top entries
 */
export async function getAllLeaderboards(limit = 5) {
  try {
    const categories = Object.keys(LEADERBOARD_CATEGORIES) as Array<keyof typeof LEADERBOARD_CATEGORIES>;

    const leaderboards = await Promise.all(
      categories.map(async (category) => {
        const { entries } = await getCategoryLeaderboard(category, limit);
        return {
          category,
          categoryInfo: LEADERBOARD_CATEGORIES[category],
          entries,
        };
      })
    );

    return { leaderboards };
  } catch (error) {
    console.error("[GET_ALL_LEADERBOARDS_ERROR]", error);
    throw error;
  }
}

/**
 * Get user's rank in all leaderboard categories
 */
export async function getUserLeaderboardRanks() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userEntries = await prisma.leaderboardEntry.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return {
      entries: toArrayDTO(userEntries, toLeaderboardEntryDTO),
    };
  } catch (error) {
    console.error("[GET_USER_LEADERBOARD_RANKS_ERROR]", error);
    throw error;
  }
}

/**
 * Update leaderboard scores for a user
 * This should be called after relevant actions (creating reports, comments, etc.)
 */
export async function updateLeaderboardScores(userId: string) {
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

    // Calculate scores for each category
    const scores: Record<keyof typeof LEADERBOARD_CATEGORIES, number> = {
      CAZADOR_DE_CRATERES: reports.filter(r => r.severity === "HIGH").length,
      GUARDIAN_DEL_ASFALTO: reports.filter(r => r.status === "RESOLVED").length,
      FOTOGRAFO_URBANO: reports.filter(r => r._count.comments > 0).length,
      DETECTIVE_NOCTURNO: reports.filter(r => {
        const hour = new Date(r.createdAt).getHours();
        return hour >= 20 || hour <= 6;
      }).length,
      HEROE_DEL_BARRIO: reports.length, // Simplified
      REPORTERO_VELOZ: reports.length, // Simplified
      CARTOGRAFO_URBANO: reports.length, // Simplified
      REPORTERO_TOP: reports.length,
      MAESTRO_DEL_DETALLE: reports.filter(r => r.description.length > 100).length,
    };

    // Update or create leaderboard entries for each category
    const categories = Object.keys(LEADERBOARD_CATEGORIES) as Array<keyof typeof LEADERBOARD_CATEGORIES>;

    for (const category of categories) {
      const score = scores[category];

      // Get current rank (count of users with higher scores)
      const higherScores = await prisma.leaderboardEntry.count({
        where: {
          category,
          score: {
            gt: score,
          },
          userId: {
            not: userId,
          },
        },
      });

      const rank = higherScores + 1;

      // Update or create entry
      await prisma.leaderboardEntry.upsert({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
        update: {
          score,
          rank,
          updatedAt: new Date(),
        },
        create: {
          userId,
          category,
          score,
          rank,
        },
      });
    }

    // Update ranks for all users in affected categories
    // This is a simplified approach - in a production app, you might want to do this in a background job
    for (const category of categories) {
      const entries = await prisma.leaderboardEntry.findMany({
        where: {
          category,
        },
        orderBy: {
          score: "desc",
        },
      });

      // Update ranks
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const newRank = i + 1;

        if (entry.rank !== newRank) {
          await prisma.leaderboardEntry.update({
            where: {
              id: entry.id,
            },
            data: {
              rank: newRank,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error("[UPDATE_LEADERBOARD_SCORES_ERROR]", error);
    throw error;
  }
}
