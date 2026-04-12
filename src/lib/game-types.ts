// 游戏类型定义

export type ChildGender = 'boy' | 'girl';

export type ChildPersonality = 'rebellious' | 'introverted' | 'sensitive';

export type VoiceType = 
  | 'gentle_female' // 温柔女声
  | 'domineering_female' // 霸道御姐
  | 'cute_female' // 可爱软妹
  | 'deep_male' // 低沉男声
  | 'gentle_male'; // 温柔男声

export interface ChildCharacter {
  id: string;
  gender: ChildGender;
  personality: ChildPersonality;
  name: string;
  description: string;
  image: string;
  voiceType: VoiceType;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  image: string;
}

export interface GameOption {
  id: string;
  text: string;
  scoreChange: number; // 分值变化（正数为加分，负数为减分）
}

export interface ChatMessage {
  id: string;
  role: 'child' | 'parent';
  content: string;
  timestamp: number;
  options?: GameOption[]; // 只有child的消息才有选项
  selectedOptionId?: string;
  audioUrl?: string;
}

export interface GameSettings {
  selectedCharacter: ChildCharacter | null;
  scenario: Scenario | null;
  customScenario?: string;
}

export interface GameState {
  phase: 'setup' | 'playing' | 'success' | 'failed';
  settings: GameSettings;
  messages: ChatMessage[];
  currentRound: number;
  maxRounds: number;
  score: number;
  initialScore: number;
  winScore: number;
  loseScore: number;
  isLoading: boolean;
  lastScoreChange: number;
}

// 孩子角色列表（性别+性格组合，声音根据性格分配）
export const CHILD_CHARACTERS: ChildCharacter[] = [
  {
    id: 'boy-rebellious',
    gender: 'boy',
    personality: 'rebellious',
    name: '小刚',
    description: '嘴硬、爱顶嘴、不配合，但内心渴望被理解',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_21a8d262-9e7c-4b83-bad3-bcc9af0be5b8.jpeg?sign=1805891886-a7c963f3ac-0-c8ff8246e596ea2257efc361c7a60803aca40110581fdfe9571e3708f0682620',
    voiceType: 'deep_male', // 叛逆型男孩 - 低沉有力
  },
  {
    id: 'boy-introverted',
    gender: 'boy',
    personality: 'introverted',
    name: '小明',
    description: '不说话、闷着、回避，需要有人主动关心',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_7a3c11e8-2aef-48e7-ac73-5d92c29d1840.jpeg?sign=1805891884-61842a3cdd-0-56fc84f0d95800ed072e1037f01c428e0c94f8911e3400826315f8b2902be405',
    voiceType: 'gentle_male', // 内向型男孩 - 温柔沉稳
  },
  {
    id: 'boy-sensitive',
    gender: 'boy',
    personality: 'sensitive',
    name: '小杰',
    description: '容易哭、情绪化、需要安抚，其实很懂事',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_0ec63104-e5f4-4519-b004-1ffe76ca79ad.jpeg?sign=1805891886-3f5b3f4da5-0-2cbd46b658478a864f460600ac80638fd1031b00804dacfe9b81eff4b4ac4233',
    voiceType: 'gentle_male', // 敏感型男孩 - 温柔细腻
  },
  {
    id: 'girl-rebellious',
    gender: 'girl',
    personality: 'rebellious',
    name: '小雪',
    description: '嘴硬、爱顶嘴、不配合，但内心渴望被理解',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_260668cc-5acd-420b-84f0-c6be35e04af6.jpeg?sign=1805891887-e4ba180e6a-0-da565c3dfc2f52f25ce340343947d30458fc1df69d76ad81cc52d689ab795c5c',
    voiceType: 'domineering_female', // 叛逆型女孩 - 霸道傲娇
  },
  {
    id: 'girl-introverted',
    gender: 'girl',
    personality: 'introverted',
    name: '小琳',
    description: '不说话、闷着、回避，需要有人主动关心',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_d70a16bf-26b6-4ff5-a33d-70c50abbb6da.jpeg?sign=1805891885-941a6322ff-0-49ecf1b83d6bc9a12a8d03c30000780a88fb89ec5eda039076bb700ac6ec8087',
    voiceType: 'gentle_female', // 内向型女孩 - 温柔细腻
  },
  {
    id: 'girl-sensitive',
    gender: 'girl',
    personality: 'sensitive',
    name: '小蕊',
    description: '容易哭、情绪化、需要安抚，其实很懂事',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_293ca6e0-ba59-45f1-af53-39349c62f71f.jpeg?sign=1805891884-244bfa7f7b-0-078175bd43c79cb836f5488747088e4085da0837238303d33e571d35ad052392',
    voiceType: 'cute_female', // 敏感型女孩 - 可爱软萌
  },
];

// 预设场景
export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'homework',
    title: '写作业困难',
    description: '孩子做数学题卡住了，开始发呆拖延，你怎么说他都不动',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_04136caf-f9cb-46e7-8976-5be9d1995b51.jpeg?sign=1805891914-359165366d-0-d1097e1300f71a38e3d77d81602a740ac76343894e5d4cad88b1b98ed2c861be',
  },
  {
    id: 'skip_school',
    title: '不想上学',
    description: '孩子说不想去学校，问他原因也不说，就躺在床上',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_c9c761eb-a3ea-49b2-8e96-9d7050e1b4ba.jpeg?sign=1805891911-09e1e54e7f-0-60244c81de59e16e73a0384f1b4ac6f0a666a47ac84c80f6cfd696b9502c05c7',
  },
  {
    id: 'phone_addiction',
    title: '沉迷手机',
    description: '孩子每天回家就玩手机，作业也不写，说了好几次都没用',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_2caf171d-f1ab-48da-b3d1-5df9f6c549ab.jpeg?sign=1805891913-b6b7e7c377-0-01884b2aa8d589f31631737294a4b6f7be652eb801804cabf443c72d292ed498',
  },
  {
    id: 'bad_grades',
    title: '考试考砸了',
    description: '孩子成绩下滑明显，你看了成绩单，想和他谈谈',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_d956b21d-d3cb-427b-a685-f42c487af05b.jpeg?sign=1805891914-7ac0dab728-0-bb1ae29f31fc7f44bd05a811dd7094a53deb2dfc21b57b971a6be6a6af6c7242',
  },
  {
    id: 'teacher_complaint',
    title: '被老师批评',
    description: '老师打电话说孩子上课说话被罚站，孩子回家后情绪很低落',
    image: 'https://coze-coding-project.tos.coze.site/coze_storage_7620427114864607275/image/generate_image_b185204a-8ab2-485e-835c-3ecfed2d89ea.jpeg?sign=1805891913-f99c60caa0-0-3b0e939d81cd67aa15222b4e23f4dea58c60aca23e776b52188053e7e5f6ec29',
  },
];

// 语音类型映射到TTS speaker ID
export const VOICE_TYPE_TO_SPEAKER: Record<VoiceType, string> = {
  gentle_female: 'zh_female_xiaohe_uranus_bigtts',
  domineering_female: 'zh_female_jitangnv_saturn_bigtts',
  cute_female: 'saturn_zh_female_keainvsheng_tob',
  deep_male: 'zh_male_m191_uranus_bigtts',
  gentle_male: 'zh_male_ruyayichen_saturn_bigtts',
};

// 语音类型描述
export const VOICE_LABELS: Record<VoiceType, { name: string; description: string }> = {
  cute_female: { name: '可爱软妹', description: '活泼可爱' },
  gentle_female: { name: '温柔女声', description: '温柔细腻' },
  domineering_female: { name: '霸道御姐', description: '强势傲娇' },
  gentle_male: { name: '温柔男声', description: '温和沉稳' },
  deep_male: { name: '低沉男声', description: '深沉有力' },
};

// 根据好感度获取情绪状态
export function getEmotionState(score: number): string {
  if (score <= 0) {
    return 'very_angry';
  } else if (score <= 30) {
    return 'angry';
  } else if (score <= 60) {
    return 'softening';
  } else if (score < 80) {
    return 'almost_convinced';
  } else {
    return 'convinced';
  }
}

// 根据情绪状态获取提示词描述
export function getEmotionPrompt(emotion: string): string {
  switch (emotion) {
    case 'very_angry':
      return '非常抗拒，可能摔门、说"不想和你说话"、或者直接哭出来';
    case 'angry':
      return '还在生气，但愿意听你说';
    case 'softening':
      return '开始软化，嘴硬但语气缓和';
    case 'almost_convinced':
      return '快被说通了，可能小声说"哼，那你说的哦"';
    case 'convinced':
      return '被理解了，愿意配合';
    default:
      return '';
  }
}
