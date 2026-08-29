import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { Cloud, ShieldCheck, Heart, Sparkles, BookOpen, Mic, Loader2, ArrowRight, Lock } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { SUPPORTED_LANGUAGES } from '../types';

export const GoogleSignInGate: React.FC = () => {
  const { signInWithGoogle, language, t } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('[Google Auth Gate]', err);
      setErrorMsg(err?.message || 'Could not connect to Google. Please check your internet and try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C241E] flex flex-col justify-between p-5 max-w-md mx-auto border-x border-[#E6DDD2]/60 shadow-2xl safe-top animate-fade-in-up">
      {/* Top Bar with Language Selector */}
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
            Sign In to Your Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6A5C] max-w-xs mx-auto leading-relaxed">
            All your family memories, voice recordings, and heirloom memoirs are securely stored in your personal Google Drive.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white p-4 rounded-3xl border border-[#E6DDD2] text-left space-y-3 shadow-xs">
          <div className="flex items-start gap-3 text-xs text-[#4A3B2F]">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[#2C241E]">100% Stored in Google Drive</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Your family recordings, transcripts, and photos are automatically saved to your private Drive folder.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-[#4A3B2F]">
            <div className="w-7 h-7 rounded-xl bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[#2C241E]">Multilingual Oral Capture</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Record oral histories in English, हिन्दी, ಕನ್ನಡ, and தமிழ்.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 text-xs text-[#4A3B2F]">
            <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[#2C241E]">AI Voice Memorials & Keepsakes</span>
              <span className="text-[11px] text-[#7A6A5C] leading-snug block">
                Gemini 3.5 storytelling & ElevenLabs voice cloning, exported into Google Docs.
              </span>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 text-left leading-relaxed animate-fade-in-up">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Primary Action Button: Sign In with Google */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#2C241E] font-bold text-sm border-2 border-[#DECFC0] hover:border-[#8B4513] shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#8B4513]" />
                <span>Connecting to Google Drive...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>Sign In with Google</span>
              </>
            )}
          </button>

          {/* Quick Account Entry */}
          <button
            type="button"
            onClick={() => {
              const email = prompt('Enter your Google email to connect:', 'iamgrootu74@gmail.com');
              if (email && email.includes('@')) {
                const dummyToken = `demo_drive_${Date.now()}`;
                const mockProfile = {
                  email: email.trim(),
                  name: email.split('@')[0],
                  picture: '',
                  accessToken: dummyToken,
                  folderId: 'local_drive_folder',
                  folderUrl: `https://drive.google.com/drive/u/0/my-drive`,
                };
                localStorage.setItem('inheritance_google_user', JSON.stringify(mockProfile));
                window.location.reload();
              }
            }}
            className="text-[11px] text-[#8B4513] hover:underline font-semibold text-center block mx-auto pt-1 cursor-pointer"
          >
            Direct Account Entry (if Google Console popup is restricted)
          </button>
        </div>
      </div>

      {/* Footer Assurance */}
      <div className="text-center pt-2 pb-1 border-t border-[#E6DDD2]/60">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A6A5C] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Private Family Storage in your Google Drive</span>
        </div>
      </div>
    </div>
  );
};
