import { NextRequest, NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { gameRecords, users } from "@/storage/database/shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currentUserId = searchParams.get("userId");

    const successfulRecords = await db
      .select({
        id: gameRecords.id,
        userId: gameRecords.userId,
        username: users.username,
        finalScore: gameRecords.finalScore,
        playedAt: gameRecords.playedAt,
      })
      .from(gameRecords)
      .innerJoin(users, eq(gameRecords.userId, users.id))
      .where(eq(gameRecords.result, "success"))
      .orderBy(desc(gameRecords.finalScore));

    const userBestScores = new Map<number, {
      userId: number;
      username: string;
      maxScore: number;
      totalGames: number;
      playedAt: string;
      recordId: number;
    }>();

    for (const record of successfulRecords) {
      if (record.userId === null) continue;
      
      const existing = userBestScores.get(record.userId);
      if (!existing || record.finalScore > existing.maxScore) {
        userBestScores.set(record.userId, {
          userId: record.userId,
          username: record.username,
          maxScore: record.finalScore,
          totalGames: existing ? existing.totalGames + 1 : 1,
          playedAt: record.playedAt,
          recordId: record.id,
        });
      } else if (existing) {
        existing.totalGames += 1;
      }
    }

    const leaderboard = Array.from(userBestScores.values())
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
    console.error("获取排行榜失败:", error);
    return NextResponse.json(
      { success: false, error: "获取排行榜失败" },
      { status: 500 }
    );
  }
}