'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/contexts/GameContext';
import { CHILD_CHARACTERS, PRESET_SCENARIOS, ChildCharacter, Scenario } from '@/lib/game-types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Users, Eye, TrendingUp, Volume2, VolumeX, Check, BookOpen, Trophy } from 'lucide-react';

interface Stats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
}

// 角色卡片组件
function CharacterCard({ 
  character, 
  isSelected, 
  onSelect,
  onPlayVoice,
  isPlaying 
}: { 
  character: ChildCharacter;
  isSelected: boolean;
  onSelect: () => void;
  onPlayVoice: () => void;
  isPlaying: boolean;
}) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border-2',
        isSelected 
          ? 'border-purple-500 shadow-lg shadow-purple-200 scale-105' 
          : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* 角色图片 */}
      <div className="aspect-square relative">
        <img 
          src={character.image} 
          alt={character.name}
          className="w-full h-full object-cover"
        />
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* 角色信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">{character.name}</h3>
              <p className="text-xs opacity-90">
                {character.gender === 'boy' ? '👦 男孩' : '👧 女孩'}
              </p>
            </div>
            {/* 试听按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlayVoice();
              }}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                isPlaying 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/20 backdrop-blur-sm hover:bg-white/30'
              )}
            >
              {isPlaying ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* 性格标签 */}
      <div className="p-3 bg-white">
        <p className="text-sm text-gray-600">{character.description}</p>
      </div>
    </div>
  );
}

// 场景卡片组件
function ScenarioCard({ 
  scenario, 
  isSelected, 
  onSelect 
}: { 
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-xl overflow-hidden transition-all duration-300 border-2',
        isSelected 
          ? 'border-green-500 shadow-lg shadow-green-200' 
          : 'border-gray-200 hover:border-green-300 hover:shadow-md'
      )}
      onClick={onSelect}
    >
      {/* 选中标记 */}
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}
      
      {/* 场景图片 */}
      <div className="aspect-video relative">
        <img 
          src={scenario.image} 
          alt={scenario.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* 标题 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-bold">{scenario.title}</h3>
        </div>
      </div>
      
      {/* 描述 */}
      <div className="p-3 bg-white">
        <p className="text-xs text-gray-600 line-clamp-2">{scenario.description}</p>
      </div>
    </div>
  );
}

export function SetupScreen() {
  const { state, setCharacter, setScenario, setCustomScenario, startGame } = useGame();
  const { settings } = state;
  const [stats, setStats] = useState<Stats>({ totalVisits: 0, uniqueVisitors: 0, todayVisits: 0 });
  const [playingCharacterId, setPlayingCharacterId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const canStart = settings.selectedCharacter && (settings.scenario || (settings.customScenario?.trim() ?? ''));

  // 记录访问并获取统计
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const response = await fetch('/api/stats', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalVisits: data.totalVisits,
            uniqueVisitors: data.uniqueVisitors,
            todayVisits: data.todayVisits,
          });
        }
      } catch (error) {
        console.error('Failed to record visit:', error);
      }
    };
    recordVisit();
  }, []);

  // 播放角色语音
  const playCharacterVoice = async (character: ChildCharacter) => {
    // 如果正在播放同一个角色，停止
    if (playingCharacterId === character.id) {
      if (audioElement) {
        audioElement.pause();
        setAudioElement(null);
      }
      setPlayingCharacterId(null);
      return;
    }

    // 停止之前的音频并清理状态
    if (audioElement) {
      audioElement.pause();
      audioElement.src = ''; // 清除音频源
      setAudioElement(null);
    }
    setPlayingCharacterId(null);

    // 根据性格生成不同的台词
    const getVoiceText = () => {
      switch (character.personality) {
        case 'rebellious':
          return '哼，你又要说什么？我不想听！';
        case 'introverted':
          return '嗯...有什么事吗？';
        case 'sensitive':
          return '我...我不是故意的...';
        default:
          return `你好，我是${character.name}。`;
      }
    };

    try {
      const response = await fetch('/api/game/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: getVoiceText(),
          voiceType: character.voiceType,
        }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const { audioUrl } = await response.json();
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setPlayingCharacterId(null);
        setAudioElement(null);
      };

      audio.onerror = () => {
        setPlayingCharacterId(null);
        setAudioElement(null);
      };

      setAudioElement(audio);
      setPlayingCharacterId(character.id);
      await audio.play();
    } catch (error) {
      console.error('Error playing voice:', error);
      setPlayingCharacterId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            亲子沟通模拟器
          </h1>
          <p className="text-gray-600">选择一个孩子角色，开始练习沟通技巧</p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-medium">夸夸攻略</span>
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all shadow-md hover:shadow-lg"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-medium">排行榜</span>
            </Link>
          </div>
        </div>

        {/* 工具简介 */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100 shadow-sm">
          <CardContent className="pt-5 pb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-2xl">🎯</div>
                <p className="text-sm font-medium text-gray-700">模拟真实场景</p>
                <p className="text-xs text-gray-500">5种常见沟通难题</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl">💡</div>
                <p className="text-sm font-medium text-gray-700">AI智能对话</p>
                <p className="text-xs text-gray-500">每轮6种回应选择</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl">📈</div>
                <p className="text-sm font-medium text-gray-700">即时反馈</p>
                <p className="text-xs text-gray-500">好感度实时变化</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 访问统计 */}
        <div className="flex justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-purple-500" />
            <span>总访问: <strong className="text-purple-600">{stats.totalVisits}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-500" />
            <span>独立访客: <strong className="text-blue-600">{stats.uniqueVisitors}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>今日: <strong className="text-green-600">{stats.todayVisits}</strong></span>
          </div>
        </div>

        {/* 步骤1：选择孩子角色 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-purple-500 text-white text-sm flex items-center justify-center">1</span>
            选择孩子角色
            <span className="text-sm font-normal text-gray-500">点击图片选择，点击🔊试听声音</span>
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CHILD_CHARACTERS.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                isSelected={settings.selectedCharacter?.id === character.id}
                onSelect={() => setCharacter(character)}
                onPlayVoice={() => playCharacterVoice(character)}
                isPlaying={playingCharacterId === character.id}
              />
            ))}
          </div>
        </div>

        {/* 步骤2：选择场景 */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-green-500 text-white text-sm flex items-center justify-center">2</span>
            选择沟通场景
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {PRESET_SCENARIOS.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                isSelected={settings.scenario?.id === scenario.id}
                onSelect={() => {
                  setScenario(scenario);
                  setCustomScenario('');
                }}
              />
            ))}
          </div>

          {/* 自定义场景 */}
          <div className="mt-4">
            <div className="relative flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-400">或自定义场景</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Textarea
              placeholder="描述你遇到的沟通场景，例如：孩子最近总说不想写作业，说作业太多太难..."
              className={cn(
                'min-h-20 transition-all',
                settings.customScenario && 'border-green-300 ring-2 ring-green-100'
              )}
              value={settings.customScenario || ''}
              onChange={(e) => {
                setCustomScenario(e.target.value);
                if (e.target.value.trim()) {
                  setScenario(null);
                }
              }}
            />
          </div>
        </div>

        {/* 开始按钮 */}
        <Button
          className="w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!canStart}
          onClick={startGame}
        >
          开始模拟 🚀
        </Button>

        <p className="text-center text-sm text-gray-500">
          目标：10轮内把好感度提升到80分以上
        </p>
      </div>
    </div>
  );
}
