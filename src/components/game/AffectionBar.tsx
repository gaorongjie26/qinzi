'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AffectionBarProps {
  score: number;
  maxScore: number;
  loseScore: number;
  winScore: number;
  currentRound: number;
  maxRounds: number;
  lastChange: number;
}

export function AffectionBar({
  score,
  maxScore,
  loseScore,
  winScore,
  currentRound,
  maxRounds,
  lastChange,
}: AffectionBarProps) {
  const [displayScore, setDisplayScore] = useState(score);
  const [showChange, setShowChange] = useState(false);
  const [animatedChange, setAnimatedChange] = useState(0);

  // 计算进度条百分比（从loseScore到maxScore的范围）
  const progressPercent = Math.max(0, Math.min(100, ((score - loseScore) / (maxScore - loseScore)) * 100));

  // 根据分数获取颜色
  const getScoreColor = () => {
    if (score <= 0) return 'text-red-500';
    if (score < 30) return 'text-orange-500';
    if (score < 60) return 'text-yellow-600';
    if (score < winScore) return 'text-blue-500';
    return 'text-green-500';
  };

  // 获取进度条颜色
  const getProgressColor = () => {
    if (score <= 0) return 'from-red-400 to-red-500';
    if (score < 30) return 'from-orange-400 to-orange-500';
    if (score < 60) return 'from-yellow-400 to-yellow-500';
    if (score < winScore) return 'from-blue-400 to-blue-500';
    return 'from-green-400 to-green-500';
  };

  // 分数变化动画
  useEffect(() => {
    if (lastChange !== 0) {
      setShowChange(true);
      setAnimatedChange(lastChange);
      
      // 动画显示分数变化
      const startScore = displayScore;
      const endScore = score;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        setDisplayScore(Math.round(startScore + (endScore - startScore) * progress));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);

      const timer = setTimeout(() => {
        setShowChange(false);
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setDisplayScore(score);
    }
  }, [score, lastChange]);

  // 计算胜利线和失败线的位置
  const winLinePosition = ((winScore - loseScore) / (maxScore - loseScore)) * 100;
  const loseLinePosition = 0;

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-100">
      {/* 顶部信息 */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">好感度</span>
          <div className="flex items-center gap-1">
            <span className={cn('text-2xl font-bold transition-all duration-300', getScoreColor())}>
              {displayScore}
            </span>
            {showChange && (
              <span
                className={cn(
                  'text-base font-bold animate-bounce',
                  animatedChange > 0 ? 'text-green-500' : 'text-red-500'
                )}
              >
                {animatedChange > 0 ? `+${animatedChange}` : animatedChange}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          <span className="font-medium">第 {currentRound} 轮</span>
          <span className="text-gray-300">/</span>
          <span>{maxRounds} 轮</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
        {/* 刻度线 */}
        <div className="absolute inset-0 flex justify-between px-1">
          {Array.from({ length: 11 }).map((_, i) => (
            <div key={i} className="w-px h-full bg-gray-200/50" />
          ))}
        </div>
        
        {/* 失败线 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-red-500 z-10"
          style={{ left: `${loseLinePosition}%` }}
        />
        
        {/* 胜利线 */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-green-500 z-10"
          style={{ left: `${winLinePosition}%` }}
        />

        {/* 进度条填充 */}
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out relative',
            getProgressColor()
          )}
          style={{ width: `${progressPercent}%` }}
        >
          {/* 光泽效果 */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>

      {/* 底部提示 */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {loseScore} 失败
        </span>
        <span className="flex items-center gap-1">
          目标: {winScore}
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        </span>
      </div>
    </div>
  );
}
