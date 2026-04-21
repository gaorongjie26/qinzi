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
    const postId = parseInt(id, 10);

    if (isNaN(postId)) {
      return NextResponse.json({ error: "无效的文章ID" }, { status: 400 });
    }

    const post = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.id, postId))
      .limit(1);

    if (!post || post.length === 0) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 });
    }

    return NextResponse.json(post[0]);
  } catch (error) {
    console.error("获取博客详情失败:", error);
    return NextResponse.json(
      { error: "获取博客详情失败" },
      { status: 500 }
    );
  }
}