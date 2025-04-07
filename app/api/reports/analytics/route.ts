import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getReportTimeMetrics } from "@/lib/report-timeline-service";

// Get report analytics data
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      const metrics = await getReportTimeMetrics();
      return NextResponse.json(metrics);
    } catch (error) {
      // Return default metrics if there's an error
      return NextResponse.json({
        averageResolutionTime: 0,
        averageTimeInProgress: 0,
        averageTimeToApprove: 0,
        totalResolvedCount: 0,
        totalInProgressCount: 0,
        totalPendingCount: 0,
        totalSubmittedCount: 0,
        totalRejectedCount: 0,
      });
    }
  } catch (error) {
    console.error("[REPORT_ANALYTICS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
