import React from 'react';
import { Mic, Users, MessageCircle, BookOpen, Heart } from 'lucide-react';
import { useApp } from '../state/AppContext';

export type ViewTab = 'capture' | 'memorial' | 'family' | 'ask' | 'book';

interface BottomNavProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  entryCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, entryCount }) => {
  const { t, language } = useApp();

  const memorialLabel = language === 'hi' ? 'स्मृति' : language === 'kn' ? 'ಸ್ಮಾರಕ' : language === 'ta' ? 'நினைவு' : 'Tribute';

  const TABS: { id: ViewTab; label: string; icon: React.ElementType; accent?: string }[] = [
    { id: 'capture', label: t.nav.record, icon: Mic },
    { id: 'memorial', label: memorialLabel, icon: Heart },
    { id: 'family', label: t.nav.family, icon: Users },
    { id: 'ask', label: t.nav.ask, icon: MessageCircle },
    { id: 'book', label: t.nav.memoir, icon: BookOpen },
  ];

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-2 sm:pb-3 px-3">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-[#FAF7F2]/90 backdrop-blur-2xl border border-[#E6DDD2]/80 shadow-[0_12px_36px_-6px_rgba(44,36,30,0.18)] rounded-3xl p-1.5 flex items-center justify-between gap-1 safe-bottom">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-300 relative group cursor-pointer ${
                  isActive
                    ? 'text-[#8B4513] font-bold shadow-xs'
                    : 'text-[#8A796A] hover:text-[#2C241E] hover:bg-[#FAF7F2]/60'
                }`}
              >
                {/* Active Indicator Background Pill */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] to-[#EFE6DB] rounded-2xl border border-[#DECFC0] shadow-xs -z-10 animate-fade-in-up" />
                )}

                <div className={`relative transition-all duration-300 ${isActive ? 'scale-115 -translate-y-0.5' : 'group-hover:scale-105'}`}>
                  <Icon 
                    className="w-5 h-5" 
                    strokeWidth={isActive ? 2.4 : 1.8} 
                  />
                  {tab.id === 'family' && entryCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-gradient-to-r from-[#8B4513] to-[#5C2C16] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs ring-2 ring-[#FAF7F2]">
                      {entryCount}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#8B4513] rounded-full" />
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 transition-all ${isActive ? 'text-[#8B4513] font-bold scale-102' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
