import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { Cloud, ShieldCheck, Heart, Sparkles, BookOpen, Mic, Loader2, ArrowRight, CheckCircle2, Smartphone } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { SUPPORTED_LANGUAGES } from '../types';

export const GoogleSignInGate: React.FC<{ onGuestContinue?: () => void }> = ({ onGuestContinue }) => {
  const { signInWithGoogle, language, t } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleEnterApp = () => {
    try {
      localStorage.setItem('inheritance_seen_welcome', 'true');
    } catch {}
    if (onGuestContinue) onGuestContinue();
  };

  const handleSignIn = async () => {
    setInfoMsg(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      handleEnterApp();
    } catch (err: any) {
      console.warn('[Google Auth Gate]', err);
      setInfoMsg('Google Sign-In is unavailable offline. You can continue with full On-Device storage now and connect Google Drive anytime.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col justify-between p-5 max-w-md mx-auto border-x border-[#E6DDD2]/60 shadow-2xl safe-top animate-fade-in-up">
      {/* Top Bar with Language Selector & Notch Safe Clearance */}
      <div className="flex items-center justify-between pt-1 pb-4 border-b border-[#E6DDD2]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            I
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#2C241E] block leading-tight">Inheritance</span>
            <span className="text-[10px] text-[#7A6A5C] font-semibold">Living Family Archive</span>
          </div>
        </div>

        <LanguageSelector compact={true} />
      </div>

      {/* Main Hero Card */}
      <div className="my-auto py-4 space-y-5 text-center">
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#8B4513] to-[#5C2E0B] text-white flex items-center justify-center shadow-elevated mx-auto mb-2 border-2 border-white/30">
            <Heart className="w-10 h-10 text-white fill-current/20" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#FAF7F2] flex items-center justify-center shadow-md text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-1.5 px-2">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] leading-tight">
            Preserve Every Family Voice
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5C] max-w-xs mx-auto leading-relaxed">
            Record elderly relatives' authentic memories, wisdom, and recipes in an on-device living family archive.
          </p>
        </div>

        {/* Value Pillars */}
        <div className="bg-white p-4 rounded-3xl border border-[#E6DDD2] text-left space-y-3 shadow-xs">
          <div className="flex items-start gap-3 text-xs text-[#4A3B2F]">
            <div className="w-7 h-7 rounded-xl bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[#2C241E]">100% On-Device Voice Capture</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Speech-to-text in English, हिन्दी, ಕನ್ನಡ, and தமிழ். Works without internet.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-[#4A3B2F]">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[#2C241E]">Voice Memorial & Grounded Q&A</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Conversational archive strictly grounded in recorded audio with zero hallucination.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-[#4A3B2F]">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[#2C241E]">Personal Google Drive Backup</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Keep an optional cloud backup in your family's private Google Drive.
              </span>
            </div>
          </div>
        </div>

        {/* Helpful Info Banner (if sign-in was attempted offline) */}
        {infoMsg && (
          <div className="p-3 bg-[#FAF7F2] text-[#5C4D40] text-xs rounded-2xl border border-[#DECFC0] text-left leading-relaxed animate-fade-in-up">
            💡 {infoMsg}
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary: Enter Archive Immediately (Always Works On-Device) */}
          <button
            onClick={handleEnterApp}
            className="btn-primary w-full text-sm font-bold shadow-elevated cursor-pointer"
          >
            <span>Enter Living Family Archive</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary: Connect Google Drive (Cloud Backup) */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2C241E] font-semibold text-xs border border-[#DECFC0] hover:border-[#8B4513] shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#8B4513]" />
                <span>Connecting to Google Drive...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>Connect Google Drive (Optional)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Security Note */}
      <div className="text-center pt-3 pb-1 border-t border-[#E6DDD2]/60">
        <span className="text-[11px] text-[#7A6A5C] flex items-center justify-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local-first on-device storage • 100% private</span>
        </span>
      </div>
    </div>
  );
};
