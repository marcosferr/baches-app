"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { LEADERBOARD_CATEGORIES } from "@/types";
import { toLeaderboardEntryDTO, toArrayDTO } from "@/lib/dto";

/**
 * Obtener el ranking de usuarios con más reportes creados
 */
export async function getUsersByReportCount(limit = 10) {
    try {
        // Consulta los usuarios con el recuento de reportes ordenados de mayor a menor
        const usersWithReportCount = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                _count: {
                    select: {
                        reports: true,
                    },
                },
            },
            orderBy: {
                reports: {
                    _count: "desc",
                },
            },
            take: limit,
        });

        // Transforma los datos para devolverlos en formato amigable
        const rankedUsers = usersWithReportCount.map((user, index) => ({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            role: user.role,
            reportCount: user._count.reports,
            rank: index + 1,
        }));

        return rankedUsers;
    } catch (error) {
        console.error("[GET_USERS_BY_REPORT_COUNT_ERROR]", error);
        throw new Error("Error al obtener el ranking de usuarios por reportes");
    }
}

/**
 * Actualizar el ranking específico para usuarios con más reportes
 * Puede ser llamado periódicamente o después de nuevos reportes
 */
export async function updateReportCountRanking() {
    try {
        // Obtener todos los usuarios con su recuento de reportes
        const usersWithReportCount = await prisma.user.findMany({
            select: {
                id: true,
                _count: {
                    select: {
                        reports: true,
                    },
                },
            },
            orderBy: {
                reports: {
                    _count: "desc",
                },
            },
        });

        // Actualizar o crear entradas de leaderboard para cada usuario
        for (let i = 0; i < usersWithReportCount.length; i++) {
            const user = usersWithReportCount[i];
            const score = user._count.reports;
            const rank = i + 1;

            await prisma.leaderboardEntry.upsert({
                where: {
                    userId_category: {
                        userId: user.id,
                        category: "REPORTERO_TOP",
                    },
                },
                update: {
                    score,
                    rank,
                    updatedAt: new Date(),
                },
                create: {
                    userId: user.id,
                    category: "REPORTERO_TOP",
                    score,
                    rank,
                },
            });
        }

        // Refrescar las páginas que muestran el ranking
        revalidatePath('/ranking');
        revalidatePath('/profile');

        return { success: true, updatedUsers: usersWithReportCount.length };
    } catch (error) {
        console.error("[UPDATE_REPORT_COUNT_RANKING_ERROR]", error);
        throw new Error("Error al actualizar el ranking por reportes");
    }
}

export async function getUsersByReportCountInPeriod(
    period: "day" | "week" | "month" | "all" = "all",
    limit = 10
) {
    try {
        let dateFilter = {};

        // Determinar el filtro de fecha según el período
        if (period !== "all") {
            const now = new Date();
            let startDate = new Date();

            switch (period) {
                case "day":
                    startDate.setDate(now.getDate() - 1);
                    break;
                case "week":
                    startDate.setDate(now.getDate() - 7);
                    break;
                case "month":
                    startDate.setMonth(now.getMonth() - 1);
                    break;
            }

            dateFilter = {
                createdAt: {
                    gte: startDate
                }
            };
        }

        // Consulta agrupando por usuario
        const result = await prisma.report.groupBy({
            by: ['authorId'],
            _count: {
                _all: true
            },
            where: dateFilter,
            orderBy: [
                {
                    _count: {
                        authorId: "desc"
                    }
                }
            ],
            take: limit
        });

        // Obtener información completa de los usuarios
        const userIds = result.map(item => item.authorId);
        const users = await prisma.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            },
            select: {
                id: true,
                name: true,
                avatar: true,
                role: true
            }
        });

        // Combinar datos
        const rankedUsers = result.map((item, index) => {
            const user = users.find(u => u.id === item.authorId);
            return {
                id: item.authorId,
                name: user?.name || 'Usuario desconocido',
                avatar: user?.avatar,
                role: user?.role,
                reportCount: item._count ? item._count : 0,
                rank: index + 1
            };
        });

        return rankedUsers;
    } catch (error) {
        console.error("[GET_USERS_BY_REPORT_COUNT_IN_PERIOD_ERROR]", error);
        throw new Error("Error al obtener el ranking de usuarios por reportes");
    }
}