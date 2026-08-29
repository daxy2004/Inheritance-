import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Video, Sparkles } from 'lucide-react';
import { StoryEntry } from '../types';

interface MediaPlayerProps {
  entry: StoryEntry;
  showTranscript?: boolean;
  compact?: boolean;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ entry, showTranscript = true, compact = false }) => {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(entry.mediaDurationSec || 60);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const timerRef = useRef<any>(null);
  const keepAliveRef = useRef<any>(null);

  const transcriptWords = entry.transcript.split(/\s+/);

  // Pre-load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.onvoiceschanged = onVoicesChanged;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
        if (timerRef.current) clearInterval(timerRef.current);
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      };
    }
  }, []);

  // Reset state when switching entry
  useEffect(() => {
    handlePause();
    setCurrentTime(0);
    setCurrentWordIndex(-1);
  }, [entry.id]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
    console.log(`[MediaPlayer] Playing story: "${entry.title}" (type: ${entry.type}, isSample: ${!!entry.isSample}, lang: ${entry.language || 'en'})`);

    // 1. If this is a live recorded user clip (real microphone/camera capture)
    if (!entry.isSample) {
      setIsPlaying(true);
      if (mediaRef.current) {
        mediaRef.current.play().then(() => {
          console.log('[MediaPlayer] Native media playback started successfully');
        }).catch((err) => {
          console.error('[MediaPlayer Error] Native media play rejected:', err);
        });
      }

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (mediaRef.current) {
          const ct = Math.floor(mediaRef.current.currentTime);
          const dur = Math.floor(mediaRef.current.duration || duration);
          setCurrentTime(ct);
          if (dur > 0 && isFinite(dur)) setDuration(dur);
          const estWordIdx = Math.floor((ct / Math.max(dur, 1)) * transcriptWords.length);
          setCurrentWordIndex(estWordIdx);
        }
      }, 500);
      return;
    }

    // 2. If this is a demo story — use SpeechSynthesis for clean storytelling narration
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = (entry.language || 'en').toLowerCase();
      const exactVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

      // If native language voice exists, speak native script. If missing on OS (e.g. Windows without Indic pack), speak phonetic transliteration
      const textToSpeak = (exactVoice || langPrefix === 'en')
        ? entry.transcript
        : (entry.phoneticText || entry.transcript);

      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      if (exactVoice) {
        utterance.lang = exactVoice.lang;
        utterance.voice = exactVoice;
      } else {
        utterance.lang = 'en-IN';
        const indianVoice = voices.find((v) => v.lang.toLowerCase().includes('in') || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('veena'));
        utterance.voice = indianVoice || voices.find((v) => v.default) || voices[0];
      }

      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // GC protection
      (window as any)._inheritanceActiveUtterance = utterance;

      utterance.onstart = () => {
        console.log('[SpeechSynthesis] Spoken narration started for:', entry.title, 'using voice:', utterance.voice?.name || 'default');
        setIsPlaying(true);
      };

      utterance.onboundary = (event: any) => {
        if (typeof event.charIndex === 'number') {
          const textSoFar = textToSpeak.slice(0, event.charIndex);
          const wCount = textSoFar.trim().split(/\s+/).length;
          setCurrentWordIndex(wCount);
        }
      };

      utterance.onend = () => {
        console.log('[SpeechSynthesis] Spoken narration completed');
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentWordIndex(-1);
        (window as any)._inheritanceActiveUtterance = null;
        if (timerRef.current) clearInterval(timerRef.current);
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      };

      utterance.onerror = (err: any) => {
        console.warn('[SpeechSynthesis notice]:', err?.error || err);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      };

      // Chrome keep-alive heartbeat
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      keepAliveRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }

    // Play video animation if video type
    if (entry.type === 'video' && mediaRef.current) {
      mediaRef.current.play().catch(() => {});
    }

    // Progress timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) {
          handlePause();
          return 0;
        }
        const next = prev + 1;
        const estWordIdx = Math.floor((next / Math.max(duration, 1)) * transcriptWords.length);
        setCurrentWordIndex(estWordIdx);
        return next;
      });
    }, 1000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      (window as any)._inheritanceActiveUtterance = null;
    }
    if (mediaRef.current) {
      mediaRef.current.pause();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (keepAliveRef.current) clearInterval(keepAliveRef.current);
  };

  const handleReset = () => {
    handlePause();
    setCurrentTime(0);
    setCurrentWordIndex(-1);
    if (mediaRef.current) {
      mediaRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (!entry.isSample && mediaRef.current) {
      setCurrentTime(Math.floor(mediaRef.current.currentTime));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentWordIndex(-1);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Wave bar heights
  const waveHeights: number[] = [];
  for (let i = 0; i < 28; i++) {
    waveHeights.push(25 + ((entry.id.charCodeAt(i % entry.id.length) * 7 + i * 13) % 60));
  }

  return (
    <div className={`rounded-2xl ${compact ? 'p-3' : 'p-4'} bg-gradient-to-br from-[#FAF7F2] to-[#F0E8DE] border border-[#E3D7C9]`}>
      {/* Video element if video type */}
      {entry.type === 'video' && entry.mediaUrl && (
        <div className="mb-3 rounded-xl overflow-hidden bg-black aspect-video max-h-[70vh] relative flex items-center justify-center">
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={entry.mediaUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onError={(e) => console.warn('[Video Media Error]', entry.id, e.currentTarget.error)}
            className="w-full h-full object-contain"
            playsInline
            preload="auto"
          />
          {!isPlaying && (
            <button
              onClick={handleTogglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
            >
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-7 h-7 text-[#8B4513] ml-1" fill="currentColor" />
              </div>
            </button>
          )}
        </div>
      )}

      {/* Audio element for all audio entries */}
      {entry.type === 'audio' && entry.mediaUrl && (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={entry.mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onError={(e) => console.warn('[Audio Media Error]', entry.id, e.currentTarget.error)}
          preload="auto"
        />
      )}

      {/* Player controls bar */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={handleTogglePlay}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-md transition-all ${
            isPlaying
              ? 'bg-[#8B4513] text-white ring-2 ring-[#8B4513]/20 scale-105'
              : 'bg-[#2C241E] text-white hover:bg-[#433830]'
          }`}
          title={isPlaying ? 'Pause' : 'Play Story'}
        >
          {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" />}
        </button>

        {/* Waveform / Progress */}
        <div className="flex-1">
          <div className="flex items-end gap-[3px] h-10 px-2 rounded-lg bg-[#F4EFEA] border border-[#E6DDD2] overflow-hidden">
            {waveHeights.map((h, i) => {
              const barProg = (i / waveHeights.length) * 100;
              const isPassed = barProg <= progress;
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-all duration-150 ${
                    isPassed ? 'bg-[#8B4513]' : 'bg-[#D8CABE]'
                  } ${isPlaying && isPassed ? 'wave-bar' : ''}`}
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-1 px-1">
            <span className="text-[11px] text-[#7A6A5C] font-medium">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-1 text-[11px] text-[#7A6A5C]">
              {entry.type === 'video' ? <Video className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              <span>{entry.type === 'video' ? 'Video' : 'Voice'} • {entry.speaker}</span>
            </div>
            <span className="text-[11px] text-[#7A6A5C] font-medium">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="p-2.5 text-[#7A6A5C] hover:text-[#2C241E] hover:bg-[#EFE6DB] rounded-xl transition-colors touch-target"
          title="Restart from beginning"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Transcript as captions with active real-time word highlighting */}
      {showTranscript && (
        <div className={`mt-3 ${compact ? 'max-h-32' : 'max-h-48'} overflow-y-auto rounded-xl bg-white/70 p-3.5 border border-[#E9DFD4]`}>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-[#8B4513]" />
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B4513]">
              Voice Narration & Captions
            </span>
          </div>
          <p className="font-serif text-sm leading-relaxed text-[#4A3B2F]">
            {isPlaying ? (
              transcriptWords.map((word, i) => (
                <span
                  key={i}
                  className={`transition-colors duration-150 ${
                    i <= currentWordIndex
                      ? 'text-[#2C241E] font-semibold bg-[#EFE6DB]/70 px-0.5 rounded'
                      : 'text-[#8C7C6E]'
                  }`}
                >
                  {word}{' '}
                </span>
              ))
            ) : (
              entry.transcript
            )}
          </p>
        </div>
      )}
    </div>
  );
};
