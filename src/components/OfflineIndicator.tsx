import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../state/AppContext';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);
  const { language } = useApp();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showReconnected) return null;

  const offlineMessages: Record<string, { title: string; subtitle: string }> = {
    en: {
      title: 'Offline Mode Active',
      subtitle: '100% on-device recording, playback & local storage are working normally.',
    },
    hi: {
      title: 'ऑफ़लाइन मोड सक्रिय',
      subtitle: '100% डिवाइस पर रिकॉर्डिंग, प्लेबैक और लोकल मेमोरी पूरी तरह सुरक्षित हैं।',
    },
    kn: {
      title: 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ',
      subtitle: 'ಸಾಧನದಲ್ಲಿ ರೆಕಾರ್ಡಿಂಗ್ ಮತ್ತು ಸ್ಥಳೀಯ ಮೆಮೊರಿ ಸುರಕ್ಷಿತವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿದೆ.',
    },
    ta: {
      title: 'ஆஃப்லைன் பயன்முறை செயலில் உள்ளது',
      subtitle: 'சாதனத்தில் பதிவு மற்றும் உள்ளூர் நினைவகம் முழுமையாக செயல்படுகிறது.',
    },
  };

  const reconnectedMessages: Record<string, string> = {
    en: 'Back Online • Cloud sync restored',
    hi: 'ऑनलाइन वापस • क्लाउड सिंक बहाल',
    kn: 'ಮತ್ತೆ ಆನ್‌ಲೈನ್ • ಕ್ಲೌಡ್ ಸಿಂಕ್ ಪುನಃಸ್ಥಾಪಿಸಲಾಗಿದೆ',
    ta: 'மீண்டும் ஆன்லைன் • கிளவுட் ஒத்திசைவு மீட்டமைக்கப்பட்டது',
  };

  const currentOffline = offlineMessages[language] || offlineMessages.en;
  const currentReconnected = reconnectedMessages[language] || reconnectedMessages.en;

  if (showReconnected) {
    return (
      <div className="bg-[#2E6F40] text-white px-3 py-1.5 text-xs flex items-center justify-center gap-2 shadow-md animate-fade-in">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
        <span className="font-medium">{currentReconnected}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#8B4513] text-[#FAF7F2] px-3.5 py-2 text-xs flex items-center justify-between shadow-md border-b border-[#5C2C16]">
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <div>
          <span className="font-semibold">{currentOffline.title}:</span>{' '}
          <span className="text-[#E6DDD2] text-[11px]">{currentOffline.subtitle}</span>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-1 text-[10px] bg-[#5C2C16] px-2 py-0.5 rounded-full border border-[#FAF7F2]/20">
        <ShieldCheck className="w-3 h-3 text-amber-300" />
        <span>On-Device Safe</span>
      </div>
    </div>
  );
};
