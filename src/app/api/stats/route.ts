import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 统计数据文件路径
const STATS_FILE = '/tmp/game-stats.json';

interface Stats {
  totalVisits: number;
  uniqueVisitors: Set<string>;
  dailyStats: Record<string, number>;
}

// 读取统计数据
function readStats(): Stats {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = fs.readFileSync(STATS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        totalVisits: parsed.totalVisits || 0,
        uniqueVisitors: new Set(parsed.uniqueVisitors || []),
        dailyStats: parsed.dailyStats || {},
      };
    }
  } catch (error) {
    console.error('Error reading stats:', error);
  }
  return {
    totalVisits: 0,
    uniqueVisitors: new Set(),
    dailyStats: {},
  };
}

// 写入统计数据
function writeStats(stats: Stats): void {
  try {
    const data = {
      totalVisits: stats.totalVisits,
      uniqueVisitors: Array.from(stats.uniqueVisitors),
      dailyStats: stats.dailyStats,
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing stats:', error);
  }
}

// 获取今天的日期字符串
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

// 获取客户端标识（简化版，基于IP和User-Agent）
function getClientId(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  return `${ip}-${userAgent.slice(0, 50)}`;
}

// GET: 获取访问统计
export async function GET() {
  const stats = readStats();
  
  return NextResponse.json({
    totalVisits: stats.totalVisits,
    uniqueVisitors: stats.uniqueVisitors.size,
    todayVisits: stats.dailyStats[getTodayKey()] || 0,
  });
}

// POST: 记录一次访问
export async function POST(request: NextRequest) {
  const stats = readStats();
  const clientId = getClientId(request);
  const today = getTodayKey();

  // 增加总访问量
  stats.totalVisits += 1;

  // 记录独立访客
  stats.uniqueVisitors.add(clientId);

  // 更新每日统计
  stats.dailyStats[today] = (stats.dailyStats[today] || 0) + 1;

  // 只保留最近30天的数据
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
  
  Object.keys(stats.dailyStats).forEach(date => {
    if (date < cutoffDate) {
      delete stats.dailyStats[date];
    }
  });

  writeStats(stats);

  return NextResponse.json({
    success: true,
    totalVisits: stats.totalVisits,
    uniqueVisitors: stats.uniqueVisitors.size,
    todayVisits: stats.dailyStats[today],
  });
}
