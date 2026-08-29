import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { SUPPORTED_LANGUAGES, Language } from '../types';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-[#5C3D28] font-bold text-xs px-3 py-1.5 rounded-full border border-[#DECFC0] shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-[#8B4513]" />
          <span>{currentLang.nativeName}</span>
          <ChevronDown className={`w-3 h-3 text-[#7A6A5C] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl border border-[#DECFC0] shadow-elevated py-1.5 z-50 animate-fade-in-up">
            <div className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-[#A08E7E] border-b border-[#F0E8DE]">
              Select Language
            </div>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#FAF7F2] text-[#8B4513] font-bold' : 'text-[#4A3B2F] hover:bg-[#F7F3EE]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{lang.nativeName}</span>
                    <span className="text-[10px] text-[#8C7A6B]">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#8B4513]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-white/95 p-1 rounded-2xl border border-[#DECFC0] shadow-2xs text-xs">
      <div className="pl-2 pr-1 text-[#8B4513] flex items-center gap-1">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-1">
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = language === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              onClick={() => setLanguage(lang.code)}
              className={`px-2.5 py-1 rounded-xl font-semibold transition-all ${
                isSelected
                  ? 'bg-[#8B4513] text-white shadow-xs scale-102'
                  : 'text-[#7A6A5C] hover:text-[#2C241E] hover:bg-[#F4EFEA]'
              } text-[11px]`}
              title={lang.label}
            >
              {lang.nativeName}
            </button>
          );
        })}
      </div>
    </div>
  );
};
