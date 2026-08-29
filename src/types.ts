export type Theme = 'Childhood' | 'Career' | 'Family' | 'Values' | 'Recipes' | 'Advice';

export type Language = 'en' | 'hi' | 'kn' | 'ta';

export interface LanguageInfo {
  code: Language;
  label: string;
  nativeName: string;
  locale: string; // Web Speech API locale
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', label: 'English', nativeName: 'English', locale: 'en-IN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', locale: 'hi-IN' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN' },
];

export interface StoryEntry {
  id: string;
  type: 'audio' | 'video';
  title: string;
  prompt: string;
  transcript: string;
  mediaBlob: Blob | null;
  mediaUrl: string;          // object URL created from mediaBlob
  mediaDurationSec: number;
  recordedAt: string;
  approxYear: string;
  theme: Theme;
  pullQuote: string;
  speaker: string;
  tags: string[];
  isSample: boolean;
  language?: Language;
  phoneticText?: string;
  isMemorial?: boolean;
  memorialPhotoUrl?: string;
}

export interface QAMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  groundedInIds: string[];
  relevantQuote?: string;
  suggestedFollowUp?: string;
  timestamp: string;
  language?: Language;
}

export interface MemoirChapter {
  theme: Theme;
  title: string;
  entries: StoryEntry[];
  pullQuotes: string[];
}

export interface MemoirBook {
  title: string;
  preface: string;
  chapters: MemoirChapter[];
  generatedAt: string;
}

export interface StoryPrompt {
  id: string;
  category: Theme;
  prompt: string;
  sparkTip: string;
}

export const THEME_LABELS: Record<Theme, string> = {
  Childhood: 'Childhood & Roots',
  Career: 'Career & First Jobs',
  Family: 'Family Stories',
  Values: 'Values & Wisdom',
  Recipes: 'Recipes & Kitchen',
  Advice: 'Advice & Life Lessons',
};

export const THEME_EMOJI: Record<Theme, string> = {
  Childhood: '🌱',
  Career: '💼',
  Family: '👨‍👩‍👧‍👦',
  Values: '💎',
  Recipes: '🍲',
  Advice: '🕊️',
};
