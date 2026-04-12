import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '亲子沟通模拟器 | 夸夸模拟器',
    template: '%s | 夸夸模拟器',
  },
  description:
    '亲子沟通模拟器是一款帮助家长练习与孩子有效沟通的互动游戏。',
  keywords: [
    '亲子沟通',
    '夸夸模拟器',
    '亲子教育',
    '沟通技巧',
    '育儿',
  ],
  authors: [{ name: '夸夸模拟器' }],
  generator: 'Coze Code',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
