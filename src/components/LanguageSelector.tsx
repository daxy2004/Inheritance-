import React from 'react';
import { useApp } from '../state/AppContext';
import { SUPPORTED_LANGUAGES, Language } from '../types';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { language, setLanguage } = useApp();

  return (
    <div className={`flex items-center gap-1 bg-white/90 p-1 rounded-2xl border border-[#DECFC0] shadow-2xs ${compact ? 'text-xs' : 'text-sm'}`}>
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
              } ${compact ? 'text-[11px]' : 'text-xs'}`}
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
