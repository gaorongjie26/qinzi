import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { db } from "@/storage/database/db";
import { blogPosts } from "@/storage/database/shared/schema";
import { randomUUID } from "crypto";

const ARTICLE_TOPICS = [
  "孩子不肯上床睡觉怎么办",
  "如何让孩子主动完成作业",
  "兄弟姐妹吵架家长怎么处理",
  "孩子说谎怎么办",
  "如何培养孩子的责任感",
  "孩子太依赖父母怎么办",
  "如何正确表扬孩子",
  "孩子不听话怎么教育",
  "如何与孩子有效沟通",
  "孩子情绪失控怎么处理",
];

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    const targetTopic = topic || ARTICLE_TOPICS[Math.floor(Math.random() * ARTICLE_TOPICS.length)];

    const config = new Config({
      apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY || "",
      basePath: process.env.COZE_INTEGRATION_MODEL_BASE_URL || "https://integration.coze.cn/api/v3",
    });

    const client = new LLMClient(config);

    const prompt = `请为"${targetTopic}"这个主题写一篇1500字左右的亲子沟通教育文章。

要求：
1. 标题吸引人
2. 内容实用、有操作性
3. 适合家长阅读
4. 包含具体的沟通话术和技巧`;

    const response = await client.chat({
      model: "ep-20250418230826-m7r7m",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const data = response.choices?.[0]?.message?.content || "";

    const titleMatch = data.match(/^#\s*(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : targetTopic;

    const cleanContent = data
      .replace(/^#.*$/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .trim();

    const sentences = cleanContent.split(/[。！？]/).filter((s: string) => s.trim().length > 10);
    const summary = sentences.slice(0, 2).join("。").substring(0, 100) + "...";

    const newPost = await db
      .insert(blogPosts)
      .values({
        title,
        summary,
        content: cleanContent,
      })
      .returning({ id: blogPosts.id });

    return NextResponse.json({
      success: true,
      article: {
        id: newPost[0]?.id || randomUUID(),
        title,
        summary,
        content: cleanContent,
      },
    });
  } catch (error) {
    console.error("Failed to generate article:", error);
    return NextResponse.json(
      { error: "生成文章失败" },
      { status: 500 }
    );
  }
}