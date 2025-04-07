import { prisma } from "@/lib/prisma";
import { Status } from "@prisma/client";
import { toReportTimelineDTO, toArrayDTO } from "@/lib/dto";
import type { ReportTimeMetrics } from "@/types";

/**
 * Creates a new timeline entry when a report's status changes
 */
export async function createTimelineEntry({
  reportId,
  previousStatus,
  newStatus,
  changedById,
  notes,
}: {
  reportId: string;
  previousStatus?: Status;
  newStatus: Status;
  changedById: string;
  notes?: string;
}) {
  try {
    const timelineEntry = await prisma.reportTimeline.create({
      data: {
        reportId,
        previousStatus,
        newStatus,
        changedById,
        notes,
      },
      include: {
        changedBy: true,
      },
    });

    return toReportTimelineDTO(timelineEntry);
  } catch (error) {
    console.error("Error creating timeline entry:", error);
    throw new Error("Failed to create timeline entry");
  }
}

/**
 * Gets all timeline entries for a specific report
 */
export async function getReportTimeline(reportId: string) {
  try {
    // First check if the report exists
    const reportExists = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!reportExists) {
      return [];
    }

    const timeline = await prisma.reportTimeline.findMany({
      where: {
        reportId,
      },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // If no timeline entries exist yet, return an empty array
    if (!timeline || timeline.length === 0) {
      return [];
    }

    return toArrayDTO(timeline, toReportTimelineDTO);
  } catch (error) {
    console.error("Error getting report timeline:", error);
    // Return empty array instead of throwing to make the API more robust
    return [];
  }
}

/**
 * Calculates time metrics for reports
 */
export async function getReportTimeMetrics(): Promise<ReportTimeMetrics> {
  try {
    // Get all timeline entries
    const allTimelines = await prisma.reportTimeline.findMany({
      orderBy: {
        createdAt: "asc",
      },
      include: {
        report: {
          select: {
            id: true,
          },
        },
      },
    });

    // If there are no timeline entries, return default metrics
    if (!allTimelines || allTimelines.length === 0) {
      return {
        averageResolutionTime: 0,
        averageTimeInProgress: 0,
        averageTimeToApprove: 0,
        totalResolvedCount: 0,
        totalInProgressCount: 0,
        totalPendingCount: 0,
        totalSubmittedCount: 0,
        totalRejectedCount: 0,
      };
    }

    // Group timeline entries by report
    const timelinesByReport = allTimelines.reduce((acc, entry) => {
      if (!acc[entry.reportId]) {
        acc[entry.reportId] = [];
      }
      acc[entry.reportId].push(entry);
      return acc;
    }, {} as Record<string, typeof allTimelines>);

    // Calculate metrics
    let totalResolutionTime = 0;
    let totalTimeInProgress = 0;
    let totalTimeToApprove = 0;
    let resolvedCount = 0;
    let inProgressCount = 0;
    let approvedCount = 0;

    // Count totals for each status
    const statusCounts = {
      SUBMITTED: 0,
      PENDING: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      REJECTED: 0,
    };

    // Process each report's timeline
    Object.values(timelinesByReport).forEach((timeline) => {
      // Sort timeline by creation date
      const sortedTimeline = [...timeline].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      );

      // Track the latest status
      const latestEntry = sortedTimeline[sortedTimeline.length - 1];
      statusCounts[latestEntry.newStatus]++;

      // Find status transition timestamps
      let submittedTime: Date | undefined = undefined;
      let pendingTime: Date | undefined = undefined;
      let inProgressTime: Date | undefined = undefined;
      let resolvedTime: Date | undefined = undefined;

      sortedTimeline.forEach((entry) => {
        if (entry.newStatus === "SUBMITTED") {
          submittedTime = entry.createdAt;
        } else if (entry.newStatus === "PENDING") {
          pendingTime = entry.createdAt;
        } else if (entry.newStatus === "IN_PROGRESS") {
          inProgressTime = entry.createdAt;
        } else if (entry.newStatus === "RESOLVED") {
          resolvedTime = entry.createdAt;
        }
      });

      // Calculate time to approve (SUBMITTED -> PENDING)
      if (submittedTime && pendingTime) {
        const timeToApprove =
          (pendingTime as Date).getTime() - (submittedTime as Date).getTime();
        totalTimeToApprove += timeToApprove;
        approvedCount++;
      }

      // Calculate time in progress (IN_PROGRESS -> RESOLVED)
      if (inProgressTime && resolvedTime) {
        const timeInProgress =
          (resolvedTime as Date).getTime() - (inProgressTime as Date).getTime();
        totalTimeInProgress += timeInProgress;
        inProgressCount++;
      }

      // Calculate total resolution time (SUBMITTED -> RESOLVED)
      if (submittedTime && resolvedTime) {
        const resolutionTime =
          (resolvedTime as Date).getTime() - (submittedTime as Date).getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    return {
      averageResolutionTime:
        resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0,
      averageTimeInProgress:
        inProgressCount > 0 ? totalTimeInProgress / inProgressCount : 0,
      averageTimeToApprove:
        approvedCount > 0 ? totalTimeToApprove / approvedCount : 0,
      totalResolvedCount: statusCounts.RESOLVED,
      totalInProgressCount: statusCounts.IN_PROGRESS,
      totalPendingCount: statusCounts.PENDING,
      totalSubmittedCount: statusCounts.SUBMITTED,
      totalRejectedCount: statusCounts.REJECTED,
    };
  } catch (error) {
    console.error("Error calculating report time metrics:", error);
    throw new Error("Failed to calculate report time metrics");
  }
}
