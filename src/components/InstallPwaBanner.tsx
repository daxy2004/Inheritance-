import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Sparkles, Smartphone } from 'lucide-react';
import { useApp } from '../state/AppContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const { language } = useApp();

  useEffect(() => {
    // Check if already running in standalone/installed mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem('inheritance_pwa_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Check if iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    if (isAppleDevice && isSafari && !isStandalone) {
      setIsIOS(true);
    }

    // Capture standard PWA beforeinstallprompt event (Android / Chrome / Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('inheritance_pwa_dismissed', 'true');
  };

  if (isInstalled || isDismissed) return null;
  if (!deferredPrompt && !isIOS) return null;

  const copy = {
    en: {
      title: 'Install Inheritance App',
      desc: 'Add to home screen for 1-click recording & instant offline access.',
      button: 'Install App',
      iosTitle: 'Install on iPhone / iPad',
      iosStep1: 'Tap the Share icon at the bottom of Safari',
      iosStep2: 'Scroll down and select "Add to Home Screen"',
      iosStep3: 'Tap "Add" in the top right corner',
    },
    hi: {
      title: 'Inheritance ऐप इंस्टॉल करें',
      desc: 'बिना इंटरनेट तुरंत रिकॉर्डिंग के लिए होम स्क्रीन पर जोड़ें।',
      button: 'ऐप इंस्टॉल करें',
      iosTitle: 'iPhone / iPad पर इंस्टॉल करें',
      iosStep1: 'सफारी ब्राउज़र में नीचे शेयर बटन दबाएं',
      iosStep2: '"होम स्क्रीन में जोड़ें" (Add to Home Screen) चुनें',
      iosStep3: 'ऊपर दाईं ओर "Add" पर टैप करें',
    },
    kn: {
      title: 'Inheritance ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
      desc: 'ಆಫ್‌ಲೈನ್ ರೆಕಾರ್ಡಿಂಗ್‌ಗಾಗಿ ಮುಖಪುಟ ಪರದೆಗೆ ಸೇರಿಸಿ.',
      button: 'ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
      iosTitle: 'iPhone / iPad ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
      iosStep1: 'ಸಫಾರಿ ಕೆಳಗಿನ ಶೇರ್ ಐಕಾನ್ ಒತ್ತಿ',
      iosStep2: '"Add to Home Screen" ಆಯ್ಕೆಮಾಡಿ',
      iosStep3: 'ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿ "Add" ಟ್ಯಾಪ್ ಮಾಡಿ',
    },
    ta: {
      title: 'Inheritance செயலியை நிறுவவும்',
      desc: 'ஆஃப்லைன் பதிவுக்கு முகப்புத் திரையில் சேர்க்கவும்.',
      button: 'செயலியை நிறுவு',
      iosTitle: 'iPhone / iPad இல் நிறுவவும்',
      iosStep1: 'சஃபாரியில் கீழே உள்ள பகிர் பொத்தானைத் தட்டவும்',
      iosStep2: '"Add to Home Screen" என்பதைத் தேர்ந்தெடுக்கவும்',
      iosStep3: 'மேல் வலது மூலையில் "Add" என்பதைத் தட்டவும்',
    },
  }[language] || {
    title: 'Install Inheritance App',
    desc: 'Add to home screen for 1-click recording & instant offline access.',
    button: 'Install App',
    iosTitle: 'Install on iPhone / iPad',
    iosStep1: 'Tap the Share icon at the bottom of Safari',
    iosStep2: 'Scroll down and select "Add to Home Screen"',
    iosStep3: 'Tap "Add" in the top right corner',
  };

  return (
    <>
      <div className="bg-[#FAF7F2] border-b border-[#E6DDD2] px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#8B4513] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-sm shadow-xs flex-shrink-0">
            I
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2C241E]">{copy.title}</span>
              <span className="text-[10px] uppercase tracking-wide bg-[#EFE6DB] text-[#8B4513] px-1.5 py-0.2 rounded font-semibold border border-[#DECFC0]">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-[#7A6A5C] leading-tight line-clamp-1">
              {copy.desc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-[#8B4513] hover:bg-[#6D340E] text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{copy.button}</span>
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="p-1 text-[#7A6A5C] hover:text-[#2C241E] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#FAF7F2] max-w-sm w-full rounded-3xl p-6 border border-[#E6DDD2] shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-[#E6DDD2] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#8B4513]" />
                <h3 className="font-serif font-semibold text-base text-[#2C241E]">
                  {copy.iosTitle}
                </h3>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-[#7A6A5C] hover:text-[#2C241E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-3 text-xs text-[#5C4D41]">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EFE6DB] text-[#8B4513] font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                  1
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>{copy.iosStep1}</span>
                  <Share className="w-4 h-4 text-blue-600 inline" />
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EFE6DB] text-[#8B4513] font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                  2
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>{copy.iosStep2}</span>
                  <PlusSquare className="w-4 h-4 text-[#8B4513] inline" />
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#EFE6DB] text-[#8B4513] font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                  3
                </span>
                <span>{copy.iosStep3}</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full btn-primary text-xs py-2"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
