import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './state/AppContext';
import { BottomNav, ViewTab } from './components/BottomNav';
import { CaptureBooth } from './components/CaptureBooth';
import { FamilyView } from './components/FamilyView';
import { AskArchive } from './components/AskArchive';
import { HeirloomBook } from './components/HeirloomBook';
import { VoiceMemorialStudio } from './components/VoiceMemorialStudio';
import { GoogleAuthHeader } from './components/GoogleAuthHeader';
import { GoogleSignInGate } from './components/GoogleSignInGate';
import { InstallPwaBanner } from './components/InstallPwaBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sparkles } from 'lucide-react';

function AppContent() {
  const { isLoading, entries, speakerName, googleUser, handleOAuthCallback } = useApp();
  const [currentTab, setCurrentTab] = useState<ViewTab>('family');

  // Handle OAuth hash token callback if redirected from Google OAuth
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const token = params.get('access_token');
      if (token && handleOAuthCallback) {
        handleOAuthCallback(token);
        // Clear hash from URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [handleOAuthCallback]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-6 text-center safe-top">
        <div className="w-16 h-16 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-serif font-bold text-2xl shadow-xl animate-gentle-pulse mb-4">
          I
        </div>
        <h1 className="font-serif text-2xl font-bold text-[#2C241E] mb-2">
          Inheritance
        </h1>
        <p className="text-xs text-[#7A6A5C] max-w-xs mb-6">
          Initializing family living archive & Google Drive storage...
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#8B4513] bg-[#EFE6DB] px-4 py-2 rounded-full border border-[#DECFC0]">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Opening Family Archive...</span>
        </div>
      </div>
    );
  }

  // Mandatory Google Sign-In Gate
  if (!googleUser) {
    return <GoogleSignInGate />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col max-w-md mx-auto relative shadow-2xl border-x border-[#E6DDD2]/60 pt-[max(env(safe-area-inset-top,0px),0px)]">
      {/* Live Offline / Reconnected Banner */}
      <OfflineIndicator />

      {/* PWA 1-Click Install Banner */}
      <InstallPwaBanner />

      {/* Persistent Google Drive Auto-Save Header */}
      <GoogleAuthHeader />

      {/* View Content */}
      <main className="flex-1">
        {currentTab === 'capture' && <CaptureBooth />}
        {currentTab === 'memorial' && (
          <VoiceMemorialStudio onSaved={() => setCurrentTab('family')} />
        )}
        {currentTab === 'family' && (
          <FamilyView onGoToCapture={() => setCurrentTab('capture')} />
        )}
        {currentTab === 'ask' && <AskArchive />}
        {currentTab === 'book' && <HeirloomBook />}
      </main>

      {/* Persistent Bottom Nav */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        entryCount={entries.length}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
