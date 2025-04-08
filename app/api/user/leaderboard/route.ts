import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getUserLeaderboardRanks } from "@/lib/leaderboard-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view your leaderboard ranks" },
        { status: 401 }
      );
    }

    const { entries } = await getUserLeaderboardRanks();

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[USER_LEADERBOARD_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
