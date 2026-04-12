
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { gameRecords, users } from "@/storage/database/shared/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("currentUserId");

    const data = await db
      .select({
        id: gameRecords.id,
        userId: gameRecords.userId,
        scenario: gameRecords.scenario,
        finalScore: gameRecords.finalScore,
        result: gameRecords.result,
        playedAt: gameRecords.playedAt,
        username: users.username,
      })
      .from(gameRecords)
      .innerJoin(users, eq(gameRecords.userId, users.id))
      .where(eq(gameRecords.result, "success"))
      .orderBy(desc(gameRecords.finalScore))
      .limit(100);

    const userScores = new Map<number, {
      userId: number;
      username: string;
      maxScore: number;
      playedAt: string;
      recordId: number;
    }>();

    data.forEach((record) => {
      const userId = record.userId;
      const score = record.finalScore;
      
      if (!userScores.has(userId) || score > userScores.get(userId)!.maxScore) {
        userScores.set(userId, {
          userId,
          username: record.username,
          maxScore: score,
          playedAt: record.playedAt,
          recordId: record.id,
        });
      }
    });

    const leaderboard = Array.from(userScores.values())
      .sort((a, b) => b.maxScore - a.maxScore)
      .slice(0, 20)
      .map((item, index) => ({
        rank: index + 1,
        ...item,
        isCurrentUser: currentUserId ? parseInt(currentUserId, 10) === item.userId : false,
      }));

    return NextResponse.json({
      success: true,
      leaderboard,
    });
  } catch (error) {
    console.error("Failed to fetch leaderboard:", error);
    return NextResponse.json(
      { error: "获取排行榜失败" },
      { status: 500 }
    );
  }
}
