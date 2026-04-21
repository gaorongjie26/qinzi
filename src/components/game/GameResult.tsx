'use client';

import { useEffect, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle } from 'lucide-react';

// 撒花动画组件
function Confetti() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-confetti"
          style={{
            left: `${particle.x}%`,
            top: '-10px',
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// 心碎动画组件
function Heartbreak() {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 1.5,
    }));
    setHearts(newHearts);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-4xl animate-fall opacity-60"
          style={{
            left: `${heart.x}%`,
            top: '-20px',
            animationDelay: `${heart.delay}s`,
          }}
        >
          💔
        </div>
      ))}
    </div>
  );
}

interface GameResultProps {
  type: 'success' | 'failed';
}

export function GameResult({ type }: GameResultProps) {
  const { state, resetGame } = useGame();
  const { user } = useAuth();
  const { settings, score, currentRound } = state;
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showLoginTip, setShowLoginTip] = useState(false);

  const isSuccess = type === 'success';

  // 保存游戏记录
  useEffect(() => {
    if (user && !isSuccess) {
      // 只有成功通关才自动保存
      saveGameRecord();
    } else if (!user) {
      // 未登录显示提示
      setShowLoginTip(true);
    }
  }, []);

  const saveGameRecord = async () => {
    if (!user) return;
    
    setSaveStatus('saving');
    try {
      const scenario = settings.scenario?.title || settings.customScenario || '自定义场景';
      
      const response = await fetch('/api/game/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          scenario: scenario,
          finalScore: score,
          result: type,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    }
  };

  const successMessages = [
    '谢谢你愿意听我说...我知道你是为我好了 💕',
    '其实我也不想这样...谢谢你理解我 🥺',
    '你说的对...我会努力的！我们一起加油吧！ ✨',
  ];

  const failedMessages = [
    '算了...你根本不懂我... 😔',
    '我不想说了...让我一个人静静... 💔',
    '每次都是这样...你从来没真正听过我想说什么... 😢',
  ];

  const message = isSuccess
    ? successMessages[Math.floor(Math.random() * successMessages.length)]
    : failedMessages[Math.floor(Math.random() * failedMessages.length)];

  const handleShare = () => {
    const text = isSuccess
      ? `我在「亲子沟通模拟器」中成功理解了孩子的心声！用了${currentRound}轮，最终好感度${score}分！你也来试试吧！`
      : `我在「亲子沟通模拟器」中失败了...孩子的心声真的好难懂。你来试试能做得更好吗？`;
    
    if (navigator.share) {
      navigator.share({
        title: '亲子沟通模拟器',
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(text + '\n' + window.location.href);
      alert('已复制分享内容到剪贴板！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-purple-50 to-blue-50">
      {isSuccess ? <Confetti /> : <Heartbreak />}

      <div className="text-center px-8 py-12 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-md mx-4">
        {/* 图标 */}
        <div className={cn(
          'w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl animate-bounce',
          isSuccess ? 'bg-green-100' : 'bg-red-100'
        )}>
          {isSuccess ? '🎉' : '😢'}
        </div>

        {/* 标题 */}
        <h2 className={cn(
          'text-3xl font-bold mb-4',
          isSuccess ? 'text-green-600' : 'text-red-500'
        )}>
          {isSuccess ? '恭喜通关！' : '再接再厉！'}
        </h2>

        {/* 孩子的话 */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            {settings.selectedCharacter ? (
              <img 
                src={settings.selectedCharacter.image} 
                alt={settings.selectedCharacter.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl">👦</span>
            )}
            <div className="flex-1 text-left">
              <p className="text-sm text-gray-500 mb-1">
                {settings.selectedCharacter?.name || '孩子'}说：
              </p>
              <p className="text-gray-700 leading-relaxed">{message}</p>
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="flex justify-center gap-8 mb-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{currentRound}</p>
            <p className="text-sm text-gray-500">轮数</p>
          </div>
          <div className="text-center">
            <p className={cn(
              'text-3xl font-bold',
              isSuccess ? 'text-green-600' : 'text-red-500'
            )}>
              {score}
            </p>
            <p className="text-sm text-gray-500">好感度</p>
          </div>
        </div>

        {/* 保存状态/登录提示 */}
        <div className="mb-6">
          {isSuccess ? (
            // 成功时显示保存状态
            saveStatus === 'saving' ? (
              <p className="text-sm text-gray-400 animate-pulse">正在保存游戏记录...</p>
            ) : saveStatus === 'saved' ? (
              <p className="text-sm text-green-600 flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" />
                您的游戏记录已经保存
              </p>
            ) : saveStatus === 'error' ? (
              <p className="text-sm text-red-500">保存记录失败</p>
            ) : null
          ) : (
            // 失败时显示登录提示
            showLoginTip && (
              <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                登录后可保存您的游戏记录
              </p>
            )
          )}
        </div>

        {/* 按钮 */}
        <div className="space-y-3">
          {isSuccess && (
            <Button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              分享给朋友 🎁
            </Button>
          )}
          <Button
            variant="outline"
            onClick={resetGame}
            className="w-full"
          >
            再玩一次 🔄
          </Button>
        </div>

        {/* 提示 */}
        <p className="mt-6 text-sm text-gray-400">
          {isSuccess
            ? '你成功理解了孩子的心声，继续保持！'
            : '亲子沟通需要耐心，多练习几次吧！'}
        </p>
      </div>
    </div>
  );
}
