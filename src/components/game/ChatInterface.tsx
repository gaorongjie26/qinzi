'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { ChatMessage, GameOption, getEmotionState } from '@/lib/game-types';
import { AffectionBar } from './AffectionBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Play, VolumeX } from 'lucide-react';

// 解析消息内容，分离动作描写和对话内容
function parseMessageContent(content: string): { action: string | null; dialogue: string } {
  // 匹配中文括号或英文括号内的内容
  const bracketRegex = /^（[^）]+）|\([^)]+\)/;
  const match = content.match(bracketRegex);
  
  if (match) {
    const action = match[0].replace(/[（）()]/g, '').trim();
    const dialogue = content.replace(bracketRegex, '').trim();
    return { action, dialogue };
  }
  
  return { action: null, dialogue: content };
}

// 过滤掉括号内容，只保留对话文本（用于TTS）
function extractDialogueForTTS(content: string): string {
  // 移除所有中文括号和英文括号及其内容
  return content.replace(/（[^）]+）|\([^)]+\)/g, '').trim();
}

// 孩子头像组件 - 使用角色图片
function ChildAvatar({ image, name }: { image: string; name: string }) {
  return (
    <div className="w-10 h-10 rounded-full overflow-hidden shadow-md ring-2 ring-white flex-shrink-0">
      <img 
        src={image} 
        alt={name}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

// 家长头像组件
function ParentAvatar() {
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-md ring-2 ring-white flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}

// 消息生成函数
async function generateResponse(
  scenario: string,
  childGender: 'boy' | 'girl',
  childPersonality: string,
  currentScore: number,
  history: ChatMessage[]
): Promise<{ content: string; options: GameOption[] }> {
  try {
    const response = await fetch('/api/game/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario,
        childGender,
        childPersonality,
        currentScore,
        history: history.map(m => ({ role: m.role, content: m.content, selectedOptionId: m.selectedOptionId })),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate response');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating response:', error);
    throw error;
  }
}

// 单条消息组件
function MessageBubble({
  message,
  character,
  isLastChildMessage,
  playingAudio,
  onPlayTTS,
}: {
  message: ChatMessage;
  character: { image: string; name: string; voiceType: string };
  isLastChildMessage: boolean;
  playingAudio: HTMLAudioElement | null;
  onPlayTTS: (text: string) => void;
}) {
  // 解析消息内容
  const { action, dialogue } = parseMessageContent(message.content);
  
  if (message.role === 'child') {
    return (
      <div className="flex gap-2.5 animate-fade-in">
        <ChildAvatar image={character.image} name={character.name} />
        <div className="flex-1 max-w-[85%]">
          <div className="bg-white border border-gray-100 px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-sm">
            {/* 动作描写 - 灰色斜体小字 */}
            {action && (
              <p className="text-xs text-gray-400 italic mb-1">（{action}）</p>
            )}
            {/* 实际对话内容 */}
            <p className="text-sm leading-relaxed">{dialogue}</p>
          </div>
          {/* 只在最后一条孩子消息上显示播放按钮 */}
          {isLastChildMessage && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 mt-1"
              onClick={() => onPlayTTS(message.content)}
            >
              {playingAudio ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">停止</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span className="text-xs">播放语音</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="flex justify-end gap-2.5 animate-fade-in">
        <div className="max-w-[85%]">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-none shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
        </div>
        <ParentAvatar />
      </div>
    );
  }
}

export function ChatInterface() {
  const { state, addMessage, selectOption, setLoading, setGamePhase } = useGame();
  const { settings, messages, currentRound, maxRounds, score, winScore, loseScore, isLoading, lastScoreChange } = state;

  const containerRef = useRef<HTMLDivElement>(null);
  const [playingAudio, setPlayingAudio] = useState<HTMLAudioElement | null>(null);

  // 获取当前选择的角色
  const character = settings.selectedCharacter;
  
  // 获取场景描述
  const scenarioDescription = settings.customScenario || settings.scenario?.description || '';

  // 获取当前需要显示的消息（最后一条孩子消息）
  const currentChildMessage = [...messages].reverse().find(m => m.role === 'child');

  // 初始化第一条消息
  useEffect(() => {
    if (messages.length === 0 && !isLoading && character) {
      handleGenerateResponse();
    }
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // 检查游戏结束条件
  useEffect(() => {
    if (score >= winScore) {
      setGamePhase('success');
    } else if (score <= loseScore || currentRound > maxRounds) {
      setGamePhase('failed');
    }
  }, [score, currentRound, winScore, loseScore, maxRounds, setGamePhase]);

  // 生成AI回复
  const handleGenerateResponse = async () => {
    if (!character) return;
    
    setLoading(true);
    try {
      const result = await generateResponse(
        scenarioDescription,
        character.gender,
        character.personality,
        score,
        messages
      );

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'child',
        content: result.content,
        timestamp: Date.now(),
        options: result.options,
      };

      addMessage(newMessage);
    } catch (error) {
      console.error('Failed to generate response:', error);
    } finally {
      setLoading(false);
    }
  };

  // 选择选项
  const handleOptionSelect = async (option: GameOption) => {
    if (!currentChildMessage) return;

    // 停止音频
    if (playingAudio) {
      playingAudio.pause();
      setPlayingAudio(null);
    }

    // 更新选中的选项
    selectOption(currentChildMessage.id, option.id, option.scoreChange);

    // 添加家长的回复
    const parentMessage: ChatMessage = {
      id: `msg-parent-${Date.now()}`,
      role: 'parent',
      content: option.text,
      timestamp: Date.now(),
    };
    addMessage(parentMessage);

    // 延迟生成孩子的回复
    setTimeout(() => {
      handleGenerateResponse();
    }, 800);
  };

  // 播放TTS音频
  const handlePlayTTS = async (text: string) => {
    if (!character) return;

    // 如果正在播放，停止
    if (playingAudio) {
      playingAudio.pause();
      playingAudio.src = '';
      setPlayingAudio(null);
      return;
    }

    try {
      // 过滤掉括号内容，只播放实际对话
      const dialogueText = extractDialogueForTTS(text);
      
      // 如果没有可播放的内容，不调用TTS
      if (!dialogueText) {
        console.log('No dialogue text to play');
        return;
      }

      // 调用TTS API获取音频
      const response = await fetch('/api/game/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: dialogueText,
          voiceType: character.voiceType,
        }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const { audioUrl } = await response.json();
      const audio = new Audio(audioUrl);
      setPlayingAudio(audio);

      audio.onended = () => {
        setPlayingAudio(null);
      };

      audio.onerror = () => {
        setPlayingAudio(null);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing TTS:', error);
      setPlayingAudio(null);
    }
  };

  // 根据当前分数获取情绪
  const currentEmotion = getEmotionState(score);

  // 如果没有选择角色，显示错误
  if (!character) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">请先选择一个角色</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-indigo-50 via-white to-purple-50">
      {/* 顶部好感度条 */}
      <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-b from-indigo-50 to-transparent">
        <AffectionBar
          score={score}
          maxScore={100}
          loseScore={loseScore}
          winScore={winScore}
          currentRound={currentRound}
          maxRounds={maxRounds}
          lastChange={lastScoreChange}
        />
      </div>

      {/* 聊天消息区域 - 显示所有对话 */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {/* 显示所有历史消息 */}
        {messages.map((message, index) => {
          const isLastChildMessage = message.role === 'child' && message.id === currentChildMessage?.id;
          return (
            <MessageBubble
              key={message.id}
              message={message}
              character={character}
              isLastChildMessage={isLastChildMessage}
              playingAudio={playingAudio}
              onPlayTTS={handlePlayTTS}
            />
          );
        })}

        {/* 加载中 */}
        {isLoading && (
          <div className="flex gap-2.5 animate-fade-in">
            <ChildAvatar image={character.image} name={character.name} />
            <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-2xl rounded-tl-none shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 选项区域 - 固定在底部 */}
      {currentChildMessage && !isLoading && currentChildMessage.options && !currentChildMessage.selectedOptionId && (
        <div className="sticky bottom-0 bg-gradient-to-t from-purple-50 via-white to-transparent pt-4 pb-6 px-4">
          <div className="space-y-2.5">
            <p className="text-xs text-gray-400 mb-2 pl-1">选择你的回应：</p>
            {currentChildMessage.options.map((option, index) => (
              <Button
                key={option.id}
                variant="outline"
                className="w-full h-auto py-3.5 px-4 text-left justify-start bg-white hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-200 animate-slide-up rounded-xl"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleOptionSelect(option)}
              >
                <span className="text-sm leading-relaxed whitespace-pre-wrap">{option.text}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
