'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trophy, CheckCircle, XCircle, Clock } from 'lucide-react';

interface GameRecord {
  id: number;
  user_id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);

  // 未登录或加载中跳转
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // 获取游戏记录
  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  const fetchRecords = async () => {
    if (!user) return;
    
    setRecordsLoading(true);
    try {
      const response = await fetch(`/api/game/records?userId=${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.records);
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setRecordsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-purple-600">加载中...</div>
      </div>
    );
  }

  // 未登录
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100">
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
        {/* 用户信息 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{user.username}</h1>
              <p className="text-gray-500 text-sm">游戏记录</p>
            </div>
          </div>
          
          {/* 统计卡片 */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{records.filter(r => r.result === 'success').length}</p>
              <p className="text-xs text-gray-500">通关次数</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {records.length > 0 
                  ? Math.round(records.reduce((sum, r) => sum + r.final_score, 0) / records.length)
                  : 0}
              </p>
              <p className="text-xs text-gray-500 mt-2">平均好感度</p>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">{records.length}</p>
              <p className="text-xs text-gray-500 mt-2">总场次</p>
            </div>
          </div>
        </div>

        {/* 游戏记录列表 */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100">
          <div className="p-4 border-b border-purple-100">
            <h2 className="font-semibold text-gray-800">历史记录</h2>
          </div>
          
          {recordsLoading ? (
            <div className="p-8 text-center text-gray-500">
              加载中...
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">🎮</div>
              <p className="text-gray-500 mb-4">还没有游戏记录</p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  开始游戏
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {records.map((record) => (
                <div key={record.id} className="p-4 hover:bg-purple-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{record.scenario}</span>
                        {record.result === 'success' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            通关
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                            <XCircle className="w-3 h-3" />
                            失败
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5 text-amber-500" />
                          {record.final_score}分
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(record.played_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
