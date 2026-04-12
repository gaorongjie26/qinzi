
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { gameRecords } from "@/storage/database/shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "缺少用户ID" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(gameRecords)
      .where(eq(gameRecords.userId, parseInt(userId, 10)))
      .orderBy(desc(gameRecords.playedAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      records: data,
    });
  } catch (error) {
    console.error("Failed to fetch game records:", error);
    return NextResponse.json(
      { error: "获取游戏记录失败" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, scenario, finalScore, result } = body;

    if (!userId || !scenario || !finalScore || !result) {
      return NextResponse.json(
        { error: "缺少必要参数" },
        { status: 400 }
      );
    }

    const insertedData = await db
      .insert(gameRecords)
      .values({
        userId: userId,
        scenario: scenario,
        finalScore: finalScore,
        result: result,
      })
      .returning();

    return NextResponse.json({
      success: true,
      record: insertedData[0],
    });
  } catch (error) {
    console.error("Failed to save game record:", error);
    return NextResponse.json(
      { error: "保存游戏记录失败" },
      { status: 500 }
    );
  }
}
