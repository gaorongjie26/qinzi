import { NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { blogPosts } from "@/storage/database/shared/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const posts = await db
      .select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(50);

    return NextResponse.json(posts);
  } catch (error) {
    console.error("获取博客列表失败:", error);
    return NextResponse.json(
      { error: "获取博客列表失败" },
      { status: 500 }
    );
  }
}