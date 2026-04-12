import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { getEmotionState, getEmotionPrompt, GameOption } from '@/lib/game-types';

// 系统提示词
function getSystemPrompt(childGender: string, childPersonality: string, scenario: string): string {
  const personalityDesc: Record<string, string> = {
    rebellious: '叛逆型，嘴硬、顶嘴、不配合，但内心渴望被理解',
    introverted: '内向型，不说话、闷着、回避，但需要有人主动关心',
    sensitive: '敏感型，容易哭、情绪化、需要安抚，其实很懂事',
  };

  return `你是一个正在经历困难时刻的${childGender === 'boy' ? '男孩' : '女孩'}，性格${personalityDesc[childPersonality]}。

当前场景：${scenario}

你需要模拟一个真实的孩子，根据家长说的话做出反应。记住：
1. 你是孩子，不是大人，说话要符合孩子的语气
2. 你的情绪会根据家长说的话变化
3. 你内心其实希望被理解，但可能不知道怎么表达

每次回复格式要求（严格JSON格式）：
{
  "content": "你说的话",
  "options": [
    {"id": "opt1", "text": "选项1文字", "scoreChange": 分数值},
    ...
  ]
}

选项设计要求（共6个选项）：
- 2个加分选项（+5到+20）：共情理解、具体解决方案、表达支持、回忆美好等
- 4个减分选项（-5到-30）：
  - 1-2个普通减分（说教、催促、否定情绪、比较别人家孩子）
  - 2-3个奇葩搞笑选项（离谱到好笑，比如"我给你跪下行不行"、"要不我把你作业吃了"）

选项顺序要随机打乱，不要把加分项固定在前面。

你的回复要自然、真实，像一个真正的孩子会说的。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, childGender, childPersonality, currentScore, history } = body;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 获取当前情绪状态
    const emotion = getEmotionState(currentScore);
    const emotionPrompt = getEmotionPrompt(emotion);

    // 构建对话消息
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: getSystemPrompt(childGender, childPersonality, scenario) },
    ];

    // 添加历史对话
    if (history && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'child') {
          messages.push({ role: 'assistant', content: msg.content });
        } else if (msg.role === 'parent') {
          messages.push({ role: 'user', content: msg.content });
        }
      }
    }

    // 如果是第一轮，添加开场提示
    if (!history || history.length === 0) {
      messages.push({
        role: 'user',
        content: `现在开始游戏。我是家长，你是孩子。当前场景是：${scenario}。
        
请直接以孩子的身份开始第一句话，并给出6个选项供家长选择。
记住：你的情绪状态是"${emotionPrompt}"。
回复必须是JSON格式。`,
      });
    } else {
      // 后续轮次，根据分数调整情绪
      messages.push({
        role: 'user',
        content: `家长刚才选择了某个选项。现在你的情绪状态是：${emotionPrompt}（当前好感度：${currentScore}）

请根据这个情绪状态回复，并给出6个新的选项（不要和之前重复）。
回复必须是JSON格式。`,
      });
    }

    // 调用LLM
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8,
    });

    // 解析JSON响应
    let result;
    try {
      // 尝试提取JSON部分
      let content = response.content.trim();
      // 如果有markdown代码块，提取其中的内容
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        content = jsonMatch[1].trim();
      }
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse LLM response:', response.content);
      // 如果解析失败，返回默认响应
      result = {
        content: '我...我不知道该说什么...',
        options: generateDefaultOptions(),
      };
    }

    // 确保options格式正确
    if (!result.options || !Array.isArray(result.options)) {
      result.options = generateDefaultOptions();
    }

    // 确保每个选项有正确的格式
    result.options = result.options.map((opt: GameOption, index: number) => ({
      id: opt.id || `opt-${index}`,
      text: opt.text || '选项',
      scoreChange: typeof opt.scoreChange === 'number' ? opt.scoreChange : 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        content: '抱歉，我有点累了，让我休息一下...',
        options: generateDefaultOptions(),
      },
      { status: 500 }
    );
  }
}

// 默认选项生成
function generateDefaultOptions(): GameOption[] {
  return [
    { id: 'opt1', text: '我知道你现在很难受，能和我说说发生了什么吗？', scoreChange: 15 },
    { id: 'opt2', text: '我理解你的感受，我们一起想办法好吗？', scoreChange: 10 },
    { id: 'opt3', text: '别发呆了，赶紧写作业！', scoreChange: -15 },
    { id: 'opt4', text: '你看人家小明，每次都能自己完成。', scoreChange: -20 },
    { id: 'opt5', text: '要不我给你跪下行不行？', scoreChange: -25 },
    { id: 'opt6', text: '我请你吃肯德基疯狂星期四行不行？', scoreChange: -30 },
  ];
}
