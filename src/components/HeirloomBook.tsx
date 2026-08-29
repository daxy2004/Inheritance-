import React, { useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { BookOpen, Printer, Sparkles, Send, Quote, Calendar, Bookmark, Heart, Crown, Award } from 'lucide-react';
import { GoogleDriveBackup } from './GoogleDriveBackup';
import { LanguageSelector } from './LanguageSelector';
import { THEME_EMOJI, SUPPORTED_LANGUAGES } from '../types';

export const HeirloomBook: React.FC = () => {
  const { memoir, isGeneratingMemoir, generateMemoir, speakerName, entries, language, t } = useApp();

  useEffect(() => {
    generateMemoir();
  }, [language, entries.length]);

  const handlePrint = () => {
    window.print();
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

  return (
    <div className="min-h-screen pb-32 px-4 pt-[max(env(safe-area-inset-top,0px),16px)] bg-[#FAF7F2]">
      {/* Header Bar */}
      <div className="no-print mb-6 flex flex-col gap-3 border-b border-[#E6DDD2] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2C241E] leading-tight">
                {t.memoir.title}
              </h1>
              <p className="text-xs text-[#7A6A5C]">
                {t.memoir.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => generateMemoir()}
              disabled={isGeneratingMemoir}
              className="btn-secondary text-xs !py-2 !px-3.5 !min-h-0 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingMemoir ? 'animate-spin' : ''}`} />
              <span>{isGeneratingMemoir ? t.memoir.curating : t.memoir.regenerate}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-primary text-xs !py-2 !px-4 !min-h-0 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{t.memoir.printPdf}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <LanguageSelector compact={true} />
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B4513] bg-[#EFE6DB] px-3 py-1 rounded-full border border-[#DECFC0]">
            Heirloom Keepsake Edition
          </span>
        </div>
      </div>

      {isGeneratingMemoir && !memoir && (
        <div className="text-center py-16 card max-w-md mx-auto shadow-elevated">
          <Sparkles className="w-10 h-10 text-[#8B4513] animate-spin mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-[#2C241E]">
            {t.memoir.curating}
          </h3>
          <p className="text-xs text-[#7A6A5C] mt-1">
            {t.memoir.curatingNote}
          </p>
        </div>
      )}

      {memoir && (
        <div className="max-w-2xl mx-auto space-y-8 bg-white p-6 sm:p-12 rounded-3xl border-2 border-[#E6DDD2] shadow-elevated relative overflow-hidden">
          {/* Decorative Corner Filigrees */}
          <div className="absolute top-3 left-3 text-xs text-[#DECFC0] select-none font-serif">✦</div>
          <div className="absolute top-3 right-3 text-xs text-[#DECFC0] select-none font-serif">✦</div>
          <div className="absolute bottom-3 left-3 text-xs text-[#DECFC0] select-none font-serif">✦</div>
          <div className="absolute bottom-3 right-3 text-xs text-[#DECFC0] select-none font-serif">✦</div>

          {/* Cover Page */}
          <div className="text-center py-10 border-b-2 border-[#8B4513]/25 space-y-4">
            <span className="text-[11px] uppercase tracking-widest font-bold text-[#8B4513] bg-[#EFE6DB] px-4 py-1.5 rounded-full border border-[#DECFC0] shadow-xs">
              {t.appName}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#2C241E] leading-tight tracking-tight px-4">
              {memoir.title}
            </h1>
            <p className="text-xs sm:text-base font-serif italic text-[#7A6A5C]">
              {currentLangLabel} • Spoken Memories of {speakerName}
            </p>
            <div className="pt-2 text-xs text-[#A08E7E] flex items-center justify-center gap-2 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#8B4513]" />
              <span>{new Date(memoir.generatedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Preface */}
          <div className="py-5 border-b border-[#F0E8DE] space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#8B4513] flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span>{t.memoir.preface}</span>
            </h2>
            <p className="font-serif text-sm leading-relaxed text-[#4A3B2F] italic bg-gradient-to-br from-[#FAF7F2] to-[#F4EFEA] p-5 rounded-2xl border border-[#DECFC0] shadow-xs">
              "{memoir.preface}"
            </p>
          </div>

          {/* Table of Contents */}
          <div className="py-5 border-b border-[#F0E8DE] space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#2C241E]">
              {t.memoir.tableOfContents}
            </h2>
            <div className="space-y-2.5">
              {memoir.chapters.map((chap, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs sm:text-sm text-[#4A3B2F] py-1.5 border-b border-dotted border-[#DECFC0]"
                >
                  <span className="font-serif font-semibold">
                    {t.memoir.chapter} {idx + 1}: {THEME_EMOJI[chap.theme]} {t.themes[chap.theme] || chap.title}
                  </span>
                  <span className="text-[#8B4513] font-mono font-bold bg-[#EFE6DB] px-2 py-0.5 rounded-full text-[11px]">
                    {chap.entries.length} {t.memoir.storiesCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-12 pt-4">
            {memoir.chapters.map((chapter, cIdx) => (
              <div key={cIdx} className="space-y-6 print-page-break">
                <div className="border-b-2 border-[#8B4513]/30 pb-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest font-bold text-[#8B4513]">
                      {t.memoir.chapter} {cIdx + 1}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] mt-0.5">
                      {THEME_EMOJI[chapter.theme]} {t.themes[chapter.theme] || chapter.title}
                    </h3>
                  </div>
                </div>

                {chapter.entries.map((entry) => (
                  <div key={entry.id} className="space-y-3 p-4 bg-[#FAF7F2]/60 rounded-2xl border border-[#E8DDD2]">
                    <div className="flex items-baseline justify-between gap-2 border-b border-[#E6DDD2]/60 pb-1.5">
                      <h4 className="font-serif text-lg font-bold text-[#2C241E]">
                        {entry.title}
                      </h4>
                      <span className="text-xs text-[#7A6A5C] shrink-0 font-mono font-semibold bg-white px-2 py-0.5 rounded-md border border-[#E6DDD2]">
                        {entry.approxYear}
                      </span>
                    </div>

                    <p className="font-serif text-sm sm:text-base leading-relaxed text-[#3B2E24] whitespace-pre-line">
                      {entry.transcript}
                    </p>

                    {entry.pullQuote && (
                      <div className="p-3.5 bg-white rounded-xl border-l-4 border-[#8B4513] my-2 shadow-xs">
                        <Quote className="w-3.5 h-3.5 text-[#8B4513] mb-1" />
                        <p className="font-serif italic text-xs sm:text-sm text-[#5C4D40] leading-relaxed">
                          "{entry.pullQuote}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* End Mark */}
          <div className="text-center pt-10 border-t border-[#DECFC0] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center mx-auto shadow-xs">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <p className="font-serif italic text-xs text-[#7A6A5C] max-w-sm mx-auto leading-relaxed">
              {t.memoir.endNote}
            </p>
          </div>
        </div>
      )}

      {/* Backup Section */}
      <div className="no-print mt-10 max-w-md mx-auto">
        <GoogleDriveBackup />
      </div>
    </div>
  );
};
