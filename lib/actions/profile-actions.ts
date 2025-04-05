"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

interface ProfileUpdateData {
  name?: string;
  avatar?: string;
}

export async function getProfile() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return { user };
  } catch (error) {
    console.error("[PROFILE_GET_ERROR]", error);
    throw error;
  }
}

export async function updateProfile(data: ProfileUpdateData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
      },
    });

    revalidatePath("/profile");
    return { user };
  } catch (error) {
    console.error("[PROFILE_UPDATE_ERROR]", error);
    throw error;
  }
}

export async function getUserStats() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // Get counts for reports created by the user
    const reportsCreated = await prisma.report.count({
      where: {
        authorId: session.user.id,
      },
    });

    // Get counts for resolved reports created by the user
    const reportsResolved = await prisma.report.count({
      where: {
        authorId: session.user.id,
        status: "RESOLVED",
      },
    });

    // Get counts for comments made by the user
    const commentsCount = await prisma.comment.count({
      where: {
        userId: session.user.id,
      },
    });

    return {
      stats: {
        reportsCreated,
        reportsResolved,
        commentsCount,
      },
    };
  } catch (error) {
    console.error("[USER_STATS_ERROR]", error);
    throw error;
  }
}

export async function getUserActivities(limit = 3) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // Get recent reports
    const reports = await prisma.report.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        status: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get recent comments
    const comments = await prisma.comment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        text: true,
        createdAt: true,
        report: {
          select: {
            id: true,
            address: true,
          },
        },
      },
    });

    // Combine and sort activities by date
    const activities = [
      ...reports.map((report) => ({
        type:
          report.status === "RESOLVED" ? "report_resolved" : "report_created",
        id: report.id,
        content: report.address || "Dirección no disponible",
        date:
          report.status === "RESOLVED" ? report.updatedAt : report.createdAt,
        reportId: report.id,
      })),
      ...comments.map((comment) => ({
        type: "comment_added",
        id: comment.id,
        content:
          comment.text.length > 50
            ? `${comment.text.substring(0, 50)}...`
            : comment.text,
        date: comment.createdAt,
        reportId: comment.report.id,
        location: comment.report.address,
      })),
    ]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);

    return { activities };
  } catch (error) {
    console.error("[USER_ACTIVITIES_ERROR]", error);
    throw error;
  }
}
