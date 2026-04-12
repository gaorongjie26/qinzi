
import { NextRequest, NextResponse } from "next/server";
import { LLMClient, Config } from "coze-coding-dev-sdk";
import { db } from "@/storage/database/db";
import { blogPosts } from "@/storage/database/shared/schema";

const ARTICLE_TOPICS = [
  "孩子不肯上床睡觉怎么办",
  "如何让孩子主动完成作业",
  "兄弟姐妹吵架家长怎么处理",
  "孩子沉迷手机游戏怎么沟通",
  "孩子成绩下降怎么鼓励",
  "孩子不愿意分享怎么办",
  "如何培养孩子的自信心",
  "孩子说谎了怎么处理",
  "如何和孩子有效沟通",
  "孩子发脾气时家长怎么办",
];

interface GeneratedArticle {
  title: string;
  summary: string;
  content: string;
}

async function generateArticleContent(customTopic?: string): Promise<GeneratedArticle> {
  const config = new Config();
  const client = new LLMClient(config);
  
  const topic = customTopic || ARTICLE_TOPICS[Math.floor(Math.random() * ARTICLE_TOPICS.length)];
  
  const prompt = `请为"夸夸模拟器"亲子沟通App写一篇博客文章。

主题：${topic}
要求：
1. 风格轻松幽默，像朋友聊天，可以用"家人们谁懂啊"这类开场白
2. 300-500字
3. 适合家长阅读
4. 包含实用的沟通技巧
5. 可以用emoji点缀（放在句子中间，不要在开头）
6. 段落之间用空行分隔

请直接输出JSON格式，包含以下字段：
- title: 文章标题（10-20字，吸睛有趣）
- summary: 摘要（30-50字，概括文章核心观点）
- content: 正文内容

请确保输出是合法的JSON格式，不要加任何其他文字。`;

  const response = await client.invoke(
    [{ role: "user", content: prompt }],
    { temperature: 0.9 }
  );

  let articleData: GeneratedArticle;
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      articleData = JSON.parse(jsonMatch[0]);
    } else {
      articleData = JSON.parse(response.content);
    }
  } catch (parseError) {
    console.error("Failed to parse JSON:", parseError);
    articleData = {
      title: `关于${topic}的那些事儿`,
      summary: `和孩子沟通${topic}其实没那么难，关键是用对方法。`,
      content: `家人们谁懂啊！每次跟娃说到${topic}这个话题，我就脑壳疼🥺...

后来我发现啊，其实换个方式沟通，效果完全不一样！

与其天天念叨，不如试试先理解娃的想法。当我们真正蹲下来听他们说，娃才会愿意打开心扉。

记住，夸夸比批评管用100倍！多用"我看到你...做得很好"这种句式，少用"你怎么又..."开头。

坚持一段时间，你会发现娃的变化真的让人惊喜！✨`,
    };
  }

  return articleData;
}

export async function POST(request: NextRequest) {
  try {
    let customTopic: string | undefined;
    try {
      const body = await request.json();
      customTopic = body.topic?.trim() || undefined;
    } catch {
    }
    
    const article = await generateArticleContent(customTopic);
    
    const insertedData = await db
      .insert(blogPosts)
      .values({
        title: article.title,
        summary: article.summary,
        content: article.content,
      })
      .returning();
    
    return NextResponse.json({
      success: true,
      article: insertedData[0],
    });
  } catch (error) {
    console.error("Failed to generate article:", error);
    return NextResponse.json(
      { error: "生成文章失败" },
      { status: 500 }
    );
  }
}
