import React, { useState, useMemo } from 'react';
import { useApp } from '../state/AppContext';
import { MediaPlayer } from './MediaPlayer';
import { StoryEntry, Theme, THEME_LABELS, THEME_EMOJI, SUPPORTED_LANGUAGES } from '../types';
import { Mic, Clock, Quote, ChevronDown, ChevronUp, Video, Volume2, PlusCircle, ExternalLink, Cloud, Loader2, Search, Play, Pause, Sparkles, Filter } from 'lucide-react';
import { GoogleDriveBackup } from './GoogleDriveBackup';
import { LanguageSelector } from './LanguageSelector';

import { AppLogo } from './AppLogo';

const ALL_THEMES: (Theme | 'All')[] = ['All', 'Childhood', 'Career', 'Family', 'Values', 'Recipes', 'Advice'];

interface FamilyViewProps {
  onGoToCapture: () => void;
}

export const FamilyView: React.FC<FamilyViewProps> = ({ onGoToCapture }) => {
  const { entries, speakerName, t, googleUser, isSyncingDrive, syncAllToGoogleDrive } = useApp();
  const [selectedTheme, setSelectedTheme] = useState<Theme | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchTheme = selectedTheme === 'All' || e.theme === selectedTheme;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        e.title.toLowerCase().includes(q) || 
        e.transcript.toLowerCase().includes(q) || 
        e.prompt.toLowerCase().includes(q) ||
        (e.pullQuote && e.pullQuote.toLowerCase().includes(q));
      return matchTheme && matchQuery;
    });
  }, [entries, selectedTheme, searchQuery]);

  // Sort chronologically by approxYear or recordedAt
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const yearA = parseInt(a.approxYear) || 9999;
      const yearB = parseInt(b.approxYear) || 9999;
      return yearA - yearB;
    });
  }, [filtered]);

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-b border-[#E6DDD2] px-4 pt-[max(env(safe-area-inset-top,0px),16px)] pb-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <AppLogo size="sm" />
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-[#2C241E] leading-tight">
                {speakerName}{t.family.archiveTitle}
              </h1>
              <p className="text-[11px] text-[#7A6A5C] flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                <span>{entries.length} {t.family.memoriesPreserved}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onGoToCapture} 
            className="btn-primary text-xs !py-2 !px-3.5 !min-h-0 shadow-sm shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" /> 
            <span>{t.family.recordBtn}</span>
          </button>
        </div>

        {/* Language Selection & Search Row */}
        <div className="mb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <LanguageSelector compact={true} />
          
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#7A6A5C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories, quotes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-white border border-[#E6DDD2] text-[#2C241E] placeholder:text-[#A08E7E] focus:outline-none focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513] transition-all"
            />
          </div>
        </div>

        {/* Theme tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {ALL_THEMES.map((theme) => {
            const isActive = selectedTheme === theme;
            const count = theme === 'All' ? entries.length : entries.filter((e) => e.theme === theme).length;
            const label = t.themes[theme] || (theme === 'All' ? 'All' : theme);
            return (
              <button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#8B4513] text-white border-[#8B4513] shadow-xs scale-102'
                    : 'bg-white text-[#7A6A5C] border-[#E6DDD2] hover:border-[#DECFC0] hover:text-[#2C241E]'
                }`}
              >
                {theme !== 'All' && <span className="mr-1">{THEME_EMOJI[theme as Theme]}</span>}
                {label}
                <span className={`ml-1 text-[10px] ${isActive ? 'text-amber-200' : 'opacity-60'}`}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline List */}
      <div className="px-4 py-4 stagger-children">
        {sorted.length === 0 ? (
          <div className="text-center py-16 card max-w-sm mx-auto border-dashed border-2">
            <div className="w-16 h-16 rounded-full bg-[#EFE6DB] flex items-center justify-center mx-auto mb-4 text-[#8B4513]">
              <Mic className="w-8 h-8 animate-gentle-pulse" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2C241E] mb-1.5">{t.family.noStoriesTitle}</h3>
            <p className="text-xs text-[#7A6A5C] mb-5 leading-relaxed">{t.family.noStoriesDesc}</p>
            <button onClick={onGoToCapture} className="btn-primary text-xs mx-auto">
              <Mic className="w-4 h-4" /> {t.family.recordFirstBtn}
            </button>
          </div>
        ) : (
          <>
            {sorted.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                isExpanded={expandedId === entry.id}
                onToggle={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              />
            ))}

            {/* Google Drive Status Footer */}
            <div className="pt-4 pb-2">
              {googleUser ? (
                <div className="p-4 rounded-3xl bg-white border border-[#E6DDD2] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 ring-4 ring-emerald-100" />
                    <div className="truncate text-xs">
                      <span className="font-bold text-[#2C241E] block truncate">
                        Google Drive Living Archive
                      </span>
                      <span className="text-[11px] text-[#7A6A5C] truncate block">
                        {googleUser.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => syncAllToGoogleDrive()}
                      disabled={isSyncingDrive || entries.length === 0}
                      className="btn-secondary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5 flex-1 sm:flex-initial justify-center !min-h-0"
                    >
                      {isSyncingDrive ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#8B4513]" />
                          <span>Syncing...</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-3.5 h-3.5 text-[#8B4513]" />
                          <span>Sync All ({entries.length})</span>
                        </>
                      )}
                    </button>

                    {googleUser.folderUrl && (
                      <a
                        href={googleUser.folderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary !py-2 !px-3.5 text-xs font-semibold flex items-center gap-1.5 flex-1 sm:flex-initial justify-center !min-h-0"
                      >
                        <span>Open Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <GoogleDriveBackup />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─── Entry Card ─── */

const EntryCard: React.FC<{
  entry: StoryEntry;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ entry, isExpanded, onToggle }) => {
  const { t } = useApp();
  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.code === (entry.language || 'en'))?.nativeName || 'English';

  return (
    <div className={`card mb-3.5 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-[#8B4513]/30 shadow-hover' : ''}`}>
      {/* Card header — always visible */}
      <button onClick={onToggle} className="w-full text-left cursor-pointer">
        <div className="flex items-start gap-3.5">
          {/* Type icon or Memorial Portrait */}
          {entry.memorialPhotoUrl ? (
            <img
              src={entry.memorialPhotoUrl}
              alt="Portrait"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-[#8B4513]/40 shadow-xs shrink-0"
            />
          ) : (
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              entry.isMemorial ? 'bg-amber-100 text-amber-900 border border-amber-300' : (entry.type === 'video' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-[#EFE6DB] text-[#8B4513] border border-[#DECFC0]')
            }`}>
              {entry.isMemorial ? <span className="text-lg">🕊️</span> : (entry.type === 'video' ? <Video className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              {entry.isMemorial && (
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                  🕊️ Memorial
                </span>
              )}
              <span className="text-[10px] bg-[#EFE6DB] text-[#8B4513] font-bold px-2 py-0.5 rounded-full border border-[#DECFC0]">
                {THEME_EMOJI[entry.theme]} {t.themes[entry.theme] || entry.theme}
              </span>
              <span className="text-[10px] font-bold text-[#8B4513] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E6DDD2]">
                {langLabel}
              </span>
              {entry.approxYear && (
                <span className="text-[10px] text-[#7A6A5C] bg-[#F4EFEA] px-2 py-0.5 rounded-full">
                  {entry.approxYear}
                </span>
              )}
            </div>
            <h3 className="font-serif text-base font-bold text-[#2C241E] leading-snug mb-1 truncate">
              {entry.title}
            </h3>
            <p className="text-xs text-[#7A6A5C] line-clamp-1 italic font-serif leading-relaxed">
              "{entry.pullQuote}"
            </p>
          </div>

          <div className="shrink-0 pt-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-[#EFE6DB] text-[#8B4513]' : 'text-[#7A6A5C]'}`}>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </div>

        {/* Duration + date footer */}
        <div className="flex items-center gap-3 mt-2.5 pl-15">
          <span className="text-[11px] text-[#7A6A5C] flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-[#8B4513]" /> {Math.floor(entry.mediaDurationSec / 60)}m {entry.mediaDurationSec % 60}s
          </span>
          <span className="text-[11px] text-[#A08E7E]">• {entry.recordedAt}</span>
        </div>
      </button>

      {/* Expanded: media player + full transcript */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#E8DDD2] animate-slide-up space-y-3.5">
          {entry.memorialPhotoUrl && (
            <div className="relative rounded-2xl overflow-hidden max-h-56 bg-black/5 border border-[#DECFC0] shadow-sm flex items-center justify-center">
              <img
                src={entry.memorialPhotoUrl}
                alt={entry.title}
                className="w-full h-full max-h-56 object-cover object-center"
              />
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                🕊️ {entry.speaker || 'Family Elder'} • Portrait
              </div>
            </div>
          )}

          <MediaPlayer entry={entry} showTranscript={true} />

          {/* Pull quote highlight */}
          {entry.pullQuote && (
            <div className="mt-3.5 p-3.5 bg-gradient-to-br from-[#FAF7F2] to-[#F4EFEA] rounded-2xl border border-[#DECFC0] shadow-xs">
              <div className="flex items-start gap-2.5">
                <Quote className="w-4 h-4 text-[#8B4513] shrink-0 mt-0.5" />
                <p className="font-serif italic text-xs sm:text-sm text-[#4A3B2F] leading-relaxed">
                  "{entry.pullQuote}"
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3.5">
              {entry.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#7A6A5C] border border-[#DECFC0]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
