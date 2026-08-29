import React, { useState } from 'react';
import { useApp } from '../state/AppContext';
import { Cloud, Check, Loader2, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';

export const GoogleAuthHeader: React.FC = () => {
  const { googleUser, isSyncingDrive, signInWithGoogle, signOutGoogle } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMsg(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.warn('[Sign-in]', err);
      setErrorMsg(err.message || 'Could not sign in with Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="no-print bg-[#FAF7F2] border-b border-[#E6DDD2] px-4 pt-[max(env(safe-area-inset-top,0px),10px)] pb-2.5 flex items-center justify-between text-xs">
      {googleUser ? (
        <div className="flex items-center justify-between w-full gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {googleUser.picture ? (
              <img
                src={googleUser.picture}
                alt="Profile"
                className="w-5 h-5 rounded-full object-cover border border-[#8B4513]"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#8B4513] text-white flex items-center justify-center text-[10px] font-bold">
                G
              </div>
            )}
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-[#2C241E] truncate max-w-[140px]">
                {googleUser.email}
              </span>
              <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-200 shrink-0 font-medium">
                {isSyncingDrive ? (
                  <>
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    <span>Syncing...</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Drive Auto-Save</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {googleUser.folderUrl && (
              <a
                href={googleUser.folderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#8B4513] hover:underline flex items-center gap-0.5 font-medium"
                title="Open Google Drive Folder"
              >
                <span>Drive</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            <button
              onClick={signOutGoogle}
              className="text-[#A08E7E] hover:text-[#2C241E] p-1 rounded hover:bg-[#EFE6DB] transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-1.5 text-[11px] text-[#7A6A5C]">
            <Cloud className="w-3.5 h-3.5 text-[#8B4513]" />
            <span>Auto-backup memories to your personal Drive</span>
          </div>

          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#DECFC0] hover:border-[#8B4513] text-[11px] font-semibold text-[#2C241E] shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin text-[#8B4513]" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="font-bold text-[#4285F4]">G</span>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
