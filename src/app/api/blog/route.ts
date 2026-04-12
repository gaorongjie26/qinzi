
import { NextResponse } from "next/server";
import { db } from "@/storage/database/db";
import { blogPosts } from "@/storage/database/shared/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        summary: blogPosts.summary,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json(
      { error: "获取文章列表失败" },
      { status: 500 }
    );
  }
}
