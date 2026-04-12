'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, BookOpen } from 'lucide-react';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
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

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.id) return;
      
      try {
        const response = await fetch(`/api/blog/${params.id}`);
        if (!response.ok) {
          setError(true);
          return;
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-lg w-2/3" />
            <div className="flex gap-4">
              <div className="h-4 bg-gray-100 rounded w-24" />
              <div className="h-4 bg-gray-100 rounded w-20" />
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">文章不存在</h1>
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回攻略列表</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">夸夸攻略</span>
          </Link>
        </div>
      </div>

      {/* 文章内容 */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* 标题 */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
          {article.title}
        </h1>

        {/* 元信息 */}
        <div className="flex items-center gap-6 text-sm text-gray-500 mb-8 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>约3分钟</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>夸夸模拟器</span>
          </div>
        </div>

        {/* 文章内容 */}
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
            {article.content}
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            <BookOpen className="w-5 h-5" />
            <span>查看更多攻略</span>
          </Link>
        </div>
      </article>
    </div>
  );
}
