import { NextRequest, NextResponse } from 'next/server';
import { TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { VOICE_TYPE_TO_SPEAKER, VoiceType } from '@/lib/game-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceType } = body as { text: string; voiceType: VoiceType };

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    // 获取对应的speaker ID
    const speakerId = VOICE_TYPE_TO_SPEAKER[voiceType] || VOICE_TYPE_TO_SPEAKER.cute_female;

    const response = await client.synthesize({
      uid: 'parent-child-game',
      text,
      speaker: speakerId,
      audioFormat: 'mp3',
      sampleRate: 24000,
    });

    return NextResponse.json({
      audioUrl: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
