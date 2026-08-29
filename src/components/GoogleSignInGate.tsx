import React, { useEffect, useState } from 'react';
import { useApp } from '../state/AppContext';
import { Cloud, ShieldCheck, Heart, Sparkles, Mic, Loader2 } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { AppLogo } from './AppLogo';
import { SUPPORTED_LANGUAGES } from '../types';

export const GoogleSignInGate: React.FC = () => {
  const { signInWithGoogle, language, t } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const onHashChange = () => setErrorMsg(null);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('[Google Auth Gate]', err);
      setErrorMsg(err?.message || 'Could not connect to Google. Please check your internet connection and try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] via-[#F6F1EA] to-[#EAE0D3] text-[#2C241E] flex flex-col justify-between px-5 sm:px-6 pt-[max(env(safe-area-inset-top,0px),1.25rem)] pb-5 max-w-md mx-auto relative shadow-2xl border-x border-[#E6DDD2]/80">
      {/* Spacious, Elegant Header with Heritage Crest Logo */}
      <header className="flex items-center justify-between pb-3.5 border-b border-[#DECFC0]/80">
        <AppLogo size="sm" showText={true} />
        <LanguageSelector compact={true} />
      </header>

      {/* Main Content Area with Generous Breathing Room */}
      <main className="my-auto py-5 space-y-6 animate-fade-in-up">
        {/* Heritage Tree Hero Emblem & Main Title */}
        <div className="text-center space-y-2">
          <div className="relative inline-block mx-auto mb-1">
            <div className="p-1 rounded-full bg-gradient-to-br from-[#E2A63B]/40 to-transparent shadow-xl">
              <AppLogo size="hero" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center shadow-md text-white">
              <Cloud className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] leading-tight tracking-tight">
            Preserve Every Voice
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5C] max-w-xs mx-auto leading-relaxed">
            Record oral histories, recipes, and memories with <strong>100% automated personal Google Drive sync</strong>.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-[#DECFC0] shadow-card space-y-3.5">
          {/* Feature 1 */}
          <div className="flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200/60 shadow-2xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#2C241E] block text-xs">Auto-Sync to Personal Google Drive</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Audio recordings, video clips, transcripts, and memoir books upload straight to your private Drive.
              </span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center shrink-0 mt-0.5 border border-[#DECFC0] shadow-2xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#2C241E] block text-xs">Multilingual Voice & Video Booth</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Preserve elders' stories in English, हिन्दी, ಕನ್ನಡ, and தமிழ் with Gemini AI transcription.
              </span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3 text-xs">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 mt-0.5 border border-purple-200/60 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#2C241E] block text-xs">Heirloom Memoirs & Voice Studio</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Synthesize AI keepsake books formatted directly as editable Google Docs in your Drive.
              </span>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 text-left leading-relaxed shadow-xs flex items-start gap-2 animate-fade-in-up">
            <span className="text-red-600 font-bold shrink-0">⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mandatory Sign In Button */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2C241E] font-bold text-sm border-2 border-[#8B4513]/40 hover:border-[#8B4513] shadow-md hover:shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 active:scale-98 group"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#8B4513]" />
                <span className="text-xs font-bold text-[#8B4513]">Connecting to Google Drive...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="tracking-tight">Sign In with Google to Access Archive</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-[#7A6A5C] font-medium">
            Sign in is required to initialize your personal cloud storage folder.
          </p>
        </div>
      </main>

      {/* Footer Assurance Badge */}
      <footer className="pt-3 pb-1 border-t border-[#DECFC0]/80 text-center">
        <div className="inline-flex items-center justify-center gap-1.5 text-[11px] text-[#5C4D40] font-semibold bg-white/70 px-3.5 py-1.5 rounded-full border border-[#DECFC0] shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>100% Private • Stored solely in your personal Google Drive</span>
        </div>
      </footer>
    </div>
  );
};
