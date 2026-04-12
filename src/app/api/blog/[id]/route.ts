
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { blogPosts } from "@/storage/database/shared/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: "无效的文章ID" },
        { status: 400 }
      );
    }

    const data = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, numericId))
      .limit(1);

    if (data.length === 0) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("Failed to fetch article:", error);
    return NextResponse.json(
      { error: "获取文章失败" },
      { status: 500 }
    );
  }
}
