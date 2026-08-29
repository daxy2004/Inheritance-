import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { MediaPlayer } from './MediaPlayer';
import { Send, Sparkles, MessageCircle, Play, Quote, AlertCircle, HelpCircle, ArrowRight, Globe, Compass, BookOpen } from 'lucide-react';
import { StoryEntry, SUPPORTED_LANGUAGES } from '../types';
import { LanguageSelector } from './LanguageSelector';

export const AskArchive: React.FC = () => {
  const { entries, speakerName, qaHistory, askQuestion, isAsking, language, t } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [activeMediaEntry, setActiveMediaEntry] = useState<StoryEntry | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [qaHistory, isAsking]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isAsking) return;
    const q = inputQuery.trim();
    setInputQuery('');
    await askQuestion(q);
  };

  const handleSelectSuggested = (prompt: string) => {
    setInputQuery(prompt);
  };

  const findEntryById = (id: string): StoryEntry | undefined => {
    return entries.find((e) => e.id === id);
  };

  // Dynamically generate tailored questions directly from the user's stored entries
  const suggestedPrompts = React.useMemo(() => {
    if (entries.length === 0) {
      if (language === 'kn') return ['ಮೊದಲ ಕಥೆಯನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಲು ರೆಕಾರ್ಡ್ ಟ್ಯಾಬ್‌ಗೆ ಹೋಗಿ.', 'ಕುಟುಂಬದ ಹಳೆಯ ನೆನಪುಗಳ ಬಗ್ಗೆ ಕೇಳಿ.'];
      if (language === 'hi') return ['अपनी पहली कहानी रिकॉर्ड करें।', 'परिवार की पुरानी यादों के बारे में पूछें।'];
      if (language === 'ta') return ['முதல் கதையை பதிவு செய்யவும்.', 'குடும்ப நினைவுகள் பற்றி கேளுங்கள்.'];
      return ['Record a memory in the Record tab to start asking questions.', 'Ask about family roots and traditions.'];
    }

    const customQuestions: string[] = [];

    // 1. Clean questions derived from each stored entry
    for (const entry of entries) {
      if (customQuestions.length >= 4) break;
      const cleanTitle = (entry.title || entry.prompt || '').replace(/^["']|["']$/g, '').trim();
      const shortTitle = cleanTitle.length > 45 ? cleanTitle.slice(0, 42) + '...' : cleanTitle;

      if (language === 'kn') {
        customQuestions.push(`"${shortTitle}" ಬಗ್ಗೆ ತಿಳಿಸಿ.`);
      } else if (language === 'hi') {
        customQuestions.push(`"${shortTitle}" के बारे में बताएं।`);
      } else if (language === 'ta') {
        customQuestions.push(`"${shortTitle}" பற்றி கூறுங்கள்.`);
      } else {
        if (cleanTitle.endsWith('?')) {
          customQuestions.push(cleanTitle);
        } else {
          customQuestions.push(`Tell me about "${shortTitle}"`);
        }
      }
    }

    // 2. High-level synthesis questions across stored memories
    if (customQuestions.length < 4) {
      const speaker = entries[0]?.speaker || 'our elder';
      if (language === 'kn') {
        customQuestions.push(`${speaker} ಅವರ ಮುಖ್ಯ ಸಲಹೆಗಳೇನು?`);
        customQuestions.push(`ರೆಕಾರ್ಡ್ ಮಾಡಿದ ನೆನಪುಗಳ ಸಾರಾಂಶವೇನು?`);
      } else if (language === 'hi') {
        customQuestions.push(`${speaker} की मुख्य सीख और सलाह क्या है?`);
        customQuestions.push(`रिकॉर्ड की गई यादों का सारांश क्या है?`);
      } else if (language === 'ta') {
        customQuestions.push(`${speaker} அவர்களின் முக்கிய அறிவுரைகள் என்ன?`);
      } else {
        customQuestions.push(`What core advice and lessons did ${speaker} share?`);
        customQuestions.push(`Summarize the main family memories recorded so far.`);
      }
    }

    return customQuestions.slice(0, 4);
  }, [entries, language]);

  const currentLangInfo = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="min-h-screen pb-48 flex flex-col bg-[#FAF7F2]">
      {/* Header with Language Selector */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-b border-[#E6DDD2] px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white flex items-center justify-center font-bold shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#2C241E] leading-tight">
                {t.ask.title}
              </h1>
              <p className="text-[11px] text-[#7A6A5C] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                <span>{entries.length} {t.family.memoriesPreserved}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E6DDD2]/60">
          <LanguageSelector compact={true} />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B4513] bg-[#EFE6DB] px-2.5 py-0.5 rounded-full border border-[#DECFC0]">
            AI Family Archivist
          </span>
        </div>
      </div>

      {/* Suggested Questions Horizon */}
      {suggestedPrompts.length > 0 && (
        <div className="px-4 pt-3.5 pb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8B4513]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6A5C]">
              {t.ask.suggestedHeading}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto py-1 px-1 -mx-1 scrollbar-hide">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggested(prompt)}
                title={prompt}
                className="shrink-0 text-xs text-[#4A3B2F] bg-white hover:bg-[#FAF7F2] border border-[#DECFC0] hover:border-[#8B4513] px-4 py-2 rounded-full shadow-xs transition-all text-left max-w-[280px] sm:max-w-xs truncate font-serif cursor-pointer hover:-translate-y-0.5 active:scale-98 leading-normal"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Stream */}
      <div className="flex-1 px-4 py-3 space-y-4">
        {qaHistory.length === 0 ? (
          <div className="text-center py-12 max-w-sm mx-auto card bg-gradient-to-b from-white to-[#FAF7F2] border-2 border-[#E6DDD2] shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C241E] mb-1">
              Ask {speakerName}'s Archive
            </h3>
            <p className="text-xs text-[#7A6A5C] leading-relaxed mb-4">
              Ask any question about childhood memories, recipes, family values, or life advice in English, हिन्दी, ಕನ್ನಡ, or தமிழ்.
            </p>
          </div>
        ) : (
          qaHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}
            >
              <div
                className={`max-w-[88%] rounded-3xl p-4 shadow-card ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white rounded-br-xs'
                    : 'bg-white border border-[#E6DDD2] text-[#2C241E] rounded-bl-xs'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-75 font-semibold">
                  {msg.role === 'user' ? (
                    <span>You</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#8B4513]">
                      <Sparkles className="w-3 h-3" />
                      Family Archivist ({msg.language?.toUpperCase() || 'EN'})
                    </span>
                  )}
                </div>

                <p className="font-serif text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Relevant quote callout */}
                {msg.relevantQuote && (
                  <div className="mt-3 p-3 bg-[#FAF7F2] text-[#4A3B2F] rounded-2xl border border-[#DECFC0] text-xs font-serif italic">
                    <Quote className="w-3.5 h-3.5 text-[#8B4513] mb-1" />
                    "{msg.relevantQuote}"
                  </div>
                )}

                {/* Grounded in story sources */}
                {msg.groundedInIds && msg.groundedInIds.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#E6DDD2]/60 flex flex-wrap gap-1.5">
                    {msg.groundedInIds.map((id) => {
                      const entry = findEntryById(id);
                      if (!entry) return null;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveMediaEntry(entry)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-[#EFE6DB] text-[#8B4513] px-3 py-1 rounded-full hover:bg-[#DECFC0] transition-colors cursor-pointer border border-[#DECFC0]"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="truncate max-w-[150px]">{entry.title}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {isAsking && (
          <div className="flex items-start gap-2 animate-fade-in-up">
            <div className="bg-white border border-[#E6DDD2] rounded-3xl p-4 shadow-xs flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#8B4513] animate-spin" />
              <span className="text-xs font-medium text-[#7A6A5C]">
                Searching oral transcripts in {currentLangInfo?.nativeName || 'English'}...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input Dock */}
      <div className="fixed bottom-[78px] sm:bottom-[86px] left-0 right-0 z-30 px-3.5 pb-1 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <form
            onSubmit={handleSubmit}
            className="bg-white/95 backdrop-blur-xl rounded-full p-1.5 border border-[#DECFC0] shadow-elevated flex items-center gap-2 ring-1 ring-black/5"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask anything about ${speakerName}...`}
              className="flex-1 pl-4 text-xs sm:text-sm text-[#2C241E] placeholder:text-[#A08E7E] focus:outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isAsking}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Media Player Modal for Grounded Stories */}
      {activeMediaEntry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] max-w-md w-full rounded-3xl p-6 border border-[#E6DDD2] shadow-2xl space-y-4 animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-[#E6DDD2] pb-3">
              <h3 className="font-serif font-bold text-base text-[#2C241E] truncate">
                {activeMediaEntry.title}
              </h3>
              <button
                onClick={() => setActiveMediaEntry(null)}
                className="text-[#7A6A5C] hover:text-[#2C241E] text-xs font-bold bg-[#EFE6DB] px-3 py-1 rounded-full"
              >
                Close
              </button>
            </div>
            <MediaPlayer entry={activeMediaEntry} showTranscript={true} />
          </div>
        </div>
      )}
    </div>
  );
};
