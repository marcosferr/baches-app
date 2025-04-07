import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getReportTimeline } from "@/lib/report-timeline-service";

// Get timeline for a specific report
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const timeline = await getReportTimeline(params.id);

    // Even if there's no data, return an empty array instead of failing
    return NextResponse.json(timeline || []);
  } catch (error) {
    console.error("[REPORT_TIMELINE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
