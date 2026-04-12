'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Trophy, Crown, Medal, Star } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  maxScore: number;
  playedAt: string;
  recordId: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = user 
        ? `/api/leaderboard?currentUserId=${user.id}` 
        : '/api/leaderboard';
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError(data.error || '获取排行榜失败');
      }
    } catch {
      setError('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-amber-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 text-center font-bold text-gray-500">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-amber-100 to-yellow-50 border-amber-300';
      case 2:
        return 'from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-orange-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-amber-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </Link>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl shadow-amber-200">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mt-4 mb-2">排行榜</h1>
          <p className="text-gray-600">展示亲子沟通高手的最高成绩</p>
        </div>

        {/* 提示 */}
        {!user && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-amber-700 text-sm">
              <Star className="w-4 h-4 inline mr-1" />
              登录并通关后可上榜，展示你的实力！
            </p>
          </div>
        )}

        {/* 排行榜列表 */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 overflow-hidden">
          {/* 表头 */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 flex items-center text-sm font-medium">
            <div className="w-12 text-center">排名</div>
            <div className="flex-1">用户名</div>
            <div className="w-24 text-center">最高分</div>
            <div className="w-24 text-center">达成日期</div>
          </div>

          {/* 内容 */}
          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
              </div>
              <p className="mt-4">加载中...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              <p>{error}</p>
              <button 
                onClick={fetchLeaderboard}
                className="mt-4 text-purple-600 hover:underline"
              >
                点击重试
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-gray-500 mb-2">暂无排行榜数据</p>
              <p className="text-gray-400 text-sm">快去游戏，成为第一个上榜的高手吧！</p>
              <Link href="/">
                <button className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all">
                  开始游戏
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className={`
                    px-4 py-3 flex items-center
                    ${entry.isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-500' : ''}
                    ${getRankBg(entry.rank)}
                    hover:${entry.isCurrentUser ? '' : 'bg-amber-50/50'}
                    transition-colors
                  `}
                >
                  {/* 排名 */}
                  <div className="w-12 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  {/* 用户名 */}
                  <div className="flex-1 flex items-center gap-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold
                      ${entry.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-yellow-500' : ''}
                      ${entry.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : ''}
                      ${entry.rank === 3 ? 'bg-gradient-to-br from-amber-600 to-orange-500' : ''}
                      ${entry.rank > 3 ? 'bg-gradient-to-br from-purple-400 to-pink-400' : ''}
                    `}>
                      {entry.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{entry.username}</span>
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs text-purple-600 font-medium">(你)</span>
                      )}
                    </div>
                  </div>
                  
                  {/* 分数 */}
                  <div className="w-24 text-center">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-bold
                      ${entry.rank === 1 ? 'bg-amber-100 text-amber-700' : ''}
                      ${entry.rank === 2 ? 'bg-gray-100 text-gray-700' : ''}
                      ${entry.rank === 3 ? 'bg-orange-100 text-orange-700' : ''}
                      ${entry.rank > 3 ? 'bg-purple-100 text-purple-700' : ''}
                    `}>
                      <Trophy className="w-3.5 h-3.5" />
                      {entry.maxScore}
                    </span>
                  </div>
                  
                  {/* 日期 */}
                  <div className="w-24 text-center text-sm text-gray-500">
                    {formatDate(entry.playedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-gray-400 text-sm mt-6">
          排行榜仅显示每个用户的最高通关分数
        </p>
      </div>
    </div>
  );
}
