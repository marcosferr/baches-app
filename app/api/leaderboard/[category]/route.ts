import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getCategoryLeaderboard } from "@/lib/leaderboard-service";
import { LEADERBOARD_CATEGORIES } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view the leaderboard" },
        { status: 401 }
      );
    }

    const category = params.category as keyof typeof LEADERBOARD_CATEGORIES;

    // Validate category
    if (!LEADERBOARD_CATEGORIES[category]) {
      return NextResponse.json(
        { error: "Invalid leaderboard category" },
        { status: 400 }
      );
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const leaderboard = await getCategoryLeaderboard(category, limit);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("[CATEGORY_LEADERBOARD_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
