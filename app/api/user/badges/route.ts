import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { getUserBadges } from "@/lib/badge-service";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view your badges" },
        { status: 401 }
      );
    }

    const { badges } = await getUserBadges();

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("[USER_BADGES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
