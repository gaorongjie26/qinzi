'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

// 免费背景音乐URL（使用公开的轻音乐）
// 在实际项目中，应该将音乐文件放在public目录下
const MUSIC_URLS = {
  relaxing: 'https://assets.mixkit.co/music/preview/mixkit-relaxing-in-nature-522.mp3',
  peaceful: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3',
  gentle: 'https://assets.mixkit.co/music/preview/mixkit-gentle-forest-rain-126.mp3',
};

interface BackgroundMusicProps {
  className?: string;
}

export function BackgroundMusic({ className }: BackgroundMusicProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 创建音频元素
    audioRef.current = new Audio(MUSIC_URLS.relaxing);
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className={cn('fixed bottom-4 right-4 z-50 flex items-center gap-2', className)}>
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={togglePlay}
          title={isPlaying ? '暂停音乐' : '播放音乐'}
        >
          {isPlaying ? (
            <Music className="h-4 w-4 text-purple-500 animate-pulse" />
          ) : (
            <Music className="h-4 w-4 text-gray-400" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={toggleMute}
          title={isMuted ? '取消静音' : '静音'}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-gray-400" />
          ) : (
            <Volume2 className="h-4 w-4 text-purple-500" />
          )}
        </Button>
        {isPlaying && !isMuted && (
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 accent-purple-500"
          />
        )}
      </div>
    </div>
  );
}
