'use client';

import { GameProvider, useGame } from '@/contexts/GameContext';
import { Header } from '@/components/layout/Header';
import { SetupScreen } from '@/components/game/SetupScreen';
import { ChatInterface } from '@/components/game/ChatInterface';
import { GameResult } from '@/components/game/GameResult';
import { BackgroundMusic } from '@/components/game/BackgroundMusic';

function GameContent() {
  const { state } = useGame();

  // 根据游戏阶段渲染不同界面
  if (state.phase === 'setup') {
    return <SetupScreen />;
  }

  return (
    <>
      <ChatInterface />
      {state.phase === 'success' && <GameResult type="success" />}
      {state.phase === 'failed' && <GameResult type="failed" />}
      {state.phase === 'playing' && <BackgroundMusic />}
    </>
  );
}

export default function Home() {
  return (
    <GameProvider>
      <Header />
      <main className="min-h-screen">
        <GameContent />
      </main>
    </GameProvider>
  );
}
