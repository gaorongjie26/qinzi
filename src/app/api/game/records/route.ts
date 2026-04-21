import { NextRequest, NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { gameRecords, users } from "@/storage/database/shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const uid = parseInt(userId, 10);
      const records = await db
        .select({
          id: gameRecords.id,
          userId: gameRecords.userId,
          username: users.username,
          scenario: gameRecords.scenario,
          finalScore: gameRecords.finalScore,
          result: gameRecords.result,
          playedAt: gameRecords.playedAt,
        })
        .from(gameRecords)
        .leftJoin(users, eq(gameRecords.userId, users.id))
        .where(eq(gameRecords.userId, uid))
        .orderBy(desc(gameRecords.playedAt))
        .limit(20);

      return NextResponse.json(records);
    }

    const records = await db
      .select({
        id: gameRecords.id,
        userId: gameRecords.userId,
        username: users.username,
        scenario: gameRecords.scenario,
        finalScore: gameRecords.finalScore,
        result: gameRecords.result,
        playedAt: gameRecords.playedAt,
      })
      .from(gameRecords)
      .leftJoin(users, eq(gameRecords.userId, users.id))
      .orderBy(desc(gameRecords.playedAt))
      .limit(50);

    return NextResponse.json(records);
  } catch (error) {
    console.error("获取游戏记录失败:", error);
    return NextResponse.json(
      { error: "获取游戏记录失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, scenario, finalScore, result } = await request.json();

    if (!userId || !scenario || finalScore === undefined || !result) {
      return NextResponse.json(
        { error: "缺少必要的参数" },
        { status: 400 }
      );
    }

    const newRecord = await db
      .insert(gameRecords)
      .values({
        userId: parseInt(userId, 10),
        scenario,
        finalScore: parseInt(finalScore, 10),
        result,
      })
      .returning({ id: gameRecords.id });

    if (!newRecord || newRecord.length === 0) {
      return NextResponse.json(
        { error: "保存游戏记录失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: newRecord[0].id,
    });
  } catch (error) {
    console.error("保存游戏记录失败:", error);
    return NextResponse.json(
      { error: "保存游戏记录失败" },
      { status: 500 }
    );
  }
}