'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, PenLine } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  summary: string;
  created_at: string;
}

// 格式化日期
function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/blog');
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回首页</span>
          </Link>
          <Link
            href="/blog/generate"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
          >
            <PenLine className="w-4 h-4" />
            <span>AI写文章</span>
          </Link>
        </div>
      </div>

      {/* 标题区域 */}
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
          夸夸攻略
        </h1>
        <p className="text-gray-600">解锁亲子沟通的正确姿势，让夸夸成为连接彼此的魔法</p>
      </div>

      {/* 文章列表 */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-purple-50 animate-pulse">
                <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3" />
                <div className="h-4 bg-gray-100 rounded w-full mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">暂无文章</p>
            <Link
              href="/blog/generate"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              <span>让AI生成一篇</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={`/blog/${article.id}`}
                className="block bg-white rounded-2xl p-6 shadow-sm border border-purple-50 hover:shadow-lg hover:border-purple-200 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 标题 */}
                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {article.title}
                </h2>

                {/* 摘要 */}
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                  {article.summary}
                </p>

                {/* 元信息 */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(article.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>约3分钟</span>
                  </div>
                </div>

                {/* 阅读更多指示 */}
                <div className="mt-4 text-sm text-purple-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  <span>阅读全文</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
