'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Loader2, PenLine } from 'lucide-react';

export default function GeneratePage() {
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [articleId, setArticleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');

  const generateArticle = async () => {
    setGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic || undefined }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }
      
      setSuccess(true);
      setArticleId(data.article.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
    } finally {
      setGenerating(false);
    }
  };

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
            <span className="font-medium">返回攻略列表</span>
          </Link>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        {success && articleId ? (
          <div className="space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">文章生成成功！</h1>
            <p className="text-gray-600">
              AI已经为你生成了一篇精彩的亲子沟通攻略
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/blog/${articleId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
              >
                查看文章
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setArticleId(null);
                }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-purple-600 font-medium rounded-xl hover:bg-purple-50 transition-colors border border-purple-200"
              >
                再生成一篇
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">AI智能生成文章</h1>
            <p className="text-gray-600 max-w-md mx-auto">
              让AI根据亲子沟通话题为你创作一篇轻松有趣的文章
            </p>
            
            {/* 主题输入框 */}
            <div className="max-w-md mx-auto pt-2">
              <div className="relative">
                <PenLine className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="输入自定义主题（选填，如：孩子不听话怎么办）"
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-purple-100 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all shadow-sm"
                  disabled={generating}
                  maxLength={100}
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-left pl-1">
                不填则由AI随机选择主题
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="pt-4">
              <button
                onClick={generateArticle}
                disabled={generating}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-xl shadow-purple-200 border-2 border-white/30 hover:border-white/50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>开始生成</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-400 pt-4">
              生成的文章会自动保存到数据库中
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
