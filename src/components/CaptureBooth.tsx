import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, Video, Square, Shuffle, ChevronRight, Check, Sparkles, Edit3, Globe, Volume2, Radio } from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PROMPTS_BY_LANGUAGE } from '../data/prompts';
import { StoryEntry, Theme, THEME_EMOJI, SUPPORTED_LANGUAGES } from '../types';
import { startLiveTranscription, tagTheme } from '../processing/onDevice';
import { LanguageSelector } from './LanguageSelector';

type RecordingState = 'idle' | 'recording' | 'review';
type RecordingType = 'audio' | 'video';

function getBestSupportedMimeType(type: 'audio' | 'video'): string {
  if (typeof MediaRecorder === 'undefined') return '';
  if (type === 'audio') {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
  } else {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ];
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c;
    }
  }
  return '';
}

export const CaptureBooth: React.FC = () => {
  const { addEntry, speakerName, language, t } = useApp();

  const [promptIndex, setPromptIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingType, setRecordingType] = useState<RecordingType>('audio');
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [detectedTheme, setDetectedTheme] = useState<Theme | null>(null);
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [isManualEntry, setIsManualEntry] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const transcriptionRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Web Audio Visualizer Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const availablePrompts = PROMPTS_BY_LANGUAGE[language] || PROMPTS_BY_LANGUAGE.en;
  const currentPrompt = availablePrompts[promptIndex % availablePrompts.length];

  // Visualizer Animation Loop
  const drawWaveform = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / 32) - 2;
    let x = 0;

    for (let i = 0; i < 32; i++) {
      const barHeight = ((dataArray[i * 2] || 0) / 255) * (canvas.height - 4);
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#8B4513');
      gradient.addColorStop(0.6, '#D97706');
      gradient.addColorStop(1, '#F59E0B');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, canvas.height - Math.max(barHeight, 4), Math.max(barWidth, 3), Math.max(barHeight, 4), 3);
      ctx.fill();

      x += barWidth + 2;
    }

    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  }, []);

  const handleShuffle = () => {
    const next = Math.floor(Math.random() * availablePrompts.length);
    setPromptIndex(next);
    resetState();
  };

  const handleNext = () => {
    setPromptIndex((i) => (i + 1) % availablePrompts.length);
    resetState();
  };

  const resetState = () => {
    setRecordingState('idle');
    setDuration(0);
    setTranscript('');
    setDetectedTheme(null);
    setMediaBlob(null);
    setMediaUrl('');
    setSaved(false);
    setIsManualEntry(false);
    if (transcriptionRef.current) transcriptionRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = useCallback(async (type: RecordingType) => {
    setRecordingType(type);
    setRecordingState('recording');
    setDuration(0);
    setTranscript('');
    chunksRef.current = [];

    // Start timer
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);

    // Start live transcription with selected language locale (en-IN, hi-IN, kn-IN, ta-IN)
    transcriptionRef.current = startLiveTranscription(
      (interim) => setTranscript(interim),
      (final) => setTranscript(final),
      (error) => console.warn('[OnDevice] Transcription note:', error),
      language,
    );

    // Start MediaRecorder & Audio Visualizer
    try {
      const constraints: MediaStreamConstraints = type === 'video'
        ? { audio: true, video: { facingMode: 'user', width: 360, height: 640 } }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Audio Visualizer setup
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyserRef.current = analyser;
        drawWaveform();
      } catch (audioCtxErr) {
        console.warn('[AudioContext Visualizer Init]:', audioCtxErr);
      }

      // Show video preview
      if (type === 'video' && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play().catch(() => {});
      }

      const mimeType = getBestSupportedMimeType(type);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const activeMime = recorder.mimeType || (type === 'video' ? 'video/webm' : 'audio/webm');
        const blob = new Blob(chunksRef.current, { type: activeMime });
        setMediaBlob(blob);
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      // Collect data every 1000ms for continuous streaming buffers
      recorder.start(1000);
    } catch (err) {
      console.error('[MediaRecorder Error] Could not access media devices:', err);
    }
  }, [language, drawWaveform]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (transcriptionRef.current) transcriptionRef.current.stop();
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }

    setRecordingState('review');

    // On-device multilingual theme tagging
    setTimeout(() => {
      const theme = tagTheme(transcript, language);
      setDetectedTheme(theme);
    }, 200);
  }, [transcript, language]);

  const handleSave = () => {
    const cleanTranscript = transcript.trim() || `Voice memory for prompt: "${currentPrompt.prompt}"`;
    const entry: StoryEntry = {
      id: `story-${Date.now()}`,
      type: recordingType,
      title: currentPrompt.prompt.slice(0, 60),
      prompt: currentPrompt.prompt,
      transcript: cleanTranscript,
      mediaBlob: mediaBlob,
      mediaUrl: mediaUrl,
      mediaDurationSec: duration,
      recordedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      approxYear: new Date().getFullYear().toString(),
      theme: detectedTheme || tagTheme(cleanTranscript, language),
      pullQuote: (cleanTranscript.length > 120 ? cleanTranscript.slice(0, 120) + '...' : cleanTranscript),
      speaker: speakerName,
      tags: [],
      isSample: false,
      language: language,
    };

    addEntry(entry);
    setSaved(true);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const currentLangLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

  return (
    <div className="min-h-screen pb-32 px-4 pt-[max(env(safe-area-inset-top,0px),20px)] max-w-md mx-auto">
      {/* Header with Language Selector */}
      <div className="flex flex-col items-center justify-between gap-2.5 mb-5 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#EFE6DB] px-3 py-1 rounded-full border border-[#DECFC0] text-[#8B4513] text-[11px] font-bold uppercase tracking-wider shadow-xs">
          <Radio className="w-3 h-3 text-[#8B4513] animate-pulse" />
          <span>Living Story Booth</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C241E] tracking-tight">
          {t.capture.title}
        </h1>
        <p className="text-xs text-[#7A6A5C] max-w-xs leading-relaxed">
          {t.capture.subtitle}
        </p>

        <div className="pt-1">
          <LanguageSelector compact={true} />
        </div>
      </div>

      {/* Prompt Card */}
      <div className="card mb-6 text-center animate-fade-in-up border-2 border-[#E6DDD2] shadow-card bg-gradient-to-b from-white to-[#FAF7F2]">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold text-[#8B4513] bg-[#EFE6DB] px-3.5 py-1 rounded-full border border-[#DECFC0]">
            {THEME_EMOJI[currentPrompt.category]} {t.themes[currentPrompt.category] || currentPrompt.category}
          </span>
          <span className="text-[10px] font-bold text-[#8B4513] bg-white px-2 py-0.5 rounded-md border border-[#E6DDD2]">
            {currentLangLabel}
          </span>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C241E] leading-relaxed mb-3 px-2">
          "{currentPrompt.prompt}"
        </h2>
        <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E9DFD4] mx-2">
          <p className="text-xs text-[#7A6A5C] italic leading-relaxed">
            💡 <strong className="text-[#8B4513] font-semibold">{t.capture.sparkTipPrefix}</strong> {currentPrompt.sparkTip}
          </p>
        </div>

        {/* Prompt navigation */}
        <div className="flex items-center justify-center gap-2.5 mt-4">
          <button onClick={handleShuffle} className="btn-secondary text-xs !py-1.5 !px-3.5 cursor-pointer">
            <Shuffle className="w-3.5 h-3.5" /> {t.capture.shuffle}
          </button>
          <button onClick={handleNext} className="btn-secondary text-xs !py-1.5 !px-3.5 cursor-pointer">
            {t.capture.next} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── IDLE STATE ─── */}
      {recordingState === 'idle' && !isManualEntry && (
        <div className="animate-fade-in-up">
          {/* Recording buttons */}
          <div className="flex items-center justify-center gap-5 mb-6">
            {/* Voice Record */}
            <button
              onClick={() => startRecording('audio')}
              className="w-30 h-30 rounded-3xl bg-gradient-to-br from-[#8B4513] via-[#753711] to-[#54250B] text-white flex flex-col items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-1.5 group-hover:bg-white/20 transition-colors">
                <Mic className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-wide">{t.capture.voiceBtn}</span>
            </button>

            {/* Video Record */}
            <button
              onClick={() => startRecording('video')}
              className="w-30 h-30 rounded-3xl bg-gradient-to-br from-[#2C241E] via-[#382E27] to-[#1C1613] text-white flex flex-col items-center justify-center shadow-lg hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-1.5 group-hover:bg-white/20 transition-colors">
                <Video className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold tracking-wide">{t.capture.videoBtn}</span>
            </button>
          </div>

          <p className="text-center text-xs text-[#7A6A5C] mb-6 max-w-xs mx-auto leading-relaxed">
            {t.capture.takeYourTime}
          </p>

          {/* Manual entry option */}
          <div className="text-center border-t border-[#E8DDD2] pt-4">
            <button
              onClick={() => { setIsManualEntry(true); setRecordingState('review'); setRecordingType('audio'); }}
              className="text-xs text-[#8B4513] hover:underline font-semibold inline-flex items-center gap-1.5 cursor-pointer bg-white px-4 py-2 rounded-full border border-[#E6DDD2] shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" /> {t.capture.preferToType}
            </button>
          </div>
        </div>
      )}

      {/* ─── RECORDING STATE ─── */}
      {recordingState === 'recording' && (
        <div className="animate-fade-in-up flex flex-col items-center">
          {/* Video preview */}
          {recordingType === 'video' && (
            <div className="w-full max-w-lg aspect-video max-h-[50vh] rounded-3xl overflow-hidden bg-black mb-4 relative flex items-center justify-center border-2 border-[#8B4513]/40 shadow-xl">
              <video
                ref={videoPreviewRef}
                className="w-full h-full object-contain"
                muted
                playsInline
              />
              <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-gentle-pulse">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                REC {formatTimer(duration)}
              </div>
            </div>
          )}

          {/* Audio recording visualization */}
          {recordingType === 'audio' && (
            <div className="flex flex-col items-center mb-6">
              <div className="recording-ring my-3">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex flex-col items-center justify-center shadow-2xl animate-gentle-pulse border-4 border-white/40">
                  <Mic className="w-10 h-10 mb-1" />
                  <span className="text-sm font-bold font-mono tracking-wider">{formatTimer(duration)}</span>
                </div>
              </div>

              {/* Real-time Web Audio Canvas Visualizer */}
              <div className="w-64 h-12 bg-white rounded-2xl p-1.5 border border-[#DECFC0] shadow-xs flex items-center justify-center mt-2">
                <canvas ref={canvasRef} width="240" height="40" className="w-full h-full" />
              </div>
            </div>
          )}

          {/* Live transcript preview */}
          {transcript && (
            <div className="w-full max-w-sm bg-white/95 rounded-2xl p-4 border border-[#DECFC0] mb-4 shadow-sm animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#8B4513] animate-pulse" />
                <span className="text-xs font-bold text-[#8B4513]">
                  {t.capture.liveTranscriptionBadge} ({currentLangLabel})
                </span>
              </div>
              <p className="font-serif text-sm text-[#4A3B2F] leading-relaxed line-clamp-3 italic">
                "{transcript}"
              </p>
            </div>
          )}

          {/* Stop button */}
          <button
            onClick={stopRecording}
            className="btn-primary !bg-[#2C241E] hover:!bg-[#1C1613] !px-8 mt-2 cursor-pointer shadow-lg"
          >
            <Square className="w-4 h-4 fill-current text-red-400" />
            <span>{t.capture.doneSpeaking}</span>
          </button>
        </div>
      )}

      {/* ─── REVIEW STATE ─── */}
      {recordingState === 'review' && !saved && (
        <div className="animate-fade-in-up max-w-md mx-auto">
          <div className="card shadow-elevated border-2 border-[#E6DDD2]">
            {/* On-device processing badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-xs">
                <Check className="w-3.5 h-3.5" /> {t.capture.onDeviceComplete}
              </span>
              {detectedTheme && (
                <span className="text-xs bg-[#EFE6DB] text-[#8B4513] font-bold px-3 py-1 rounded-full border border-[#DECFC0]">
                  {THEME_EMOJI[detectedTheme]} {t.themes[detectedTheme] || detectedTheme}
                </span>
              )}
            </div>

            {/* Video/Audio preview */}
            {mediaUrl && recordingType === 'video' && (
              <div className="rounded-2xl overflow-hidden mb-3.5 bg-black max-h-[50vh] flex items-center justify-center border border-[#DECFC0] shadow-sm">
                <video src={mediaUrl} className="w-full h-full max-h-[50vh] object-contain" controls playsInline preload="metadata" />
              </div>
            )}
            {mediaUrl && recordingType === 'audio' && (
              <div className="mb-3.5 p-2 bg-[#FAF7F2] rounded-2xl border border-[#DECFC0]">
                <audio src={mediaUrl} controls className="w-full" preload="metadata" />
              </div>
            )}

            {/* Transcript */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-[#7A6A5C] mb-1.5">
                {isManualEntry ? t.capture.manualTypePrompt : t.capture.transcriptLabel}
              </label>
              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setDetectedTheme(tagTheme(e.target.value, language));
                }}
                rows={5}
                placeholder={isManualEntry ? t.capture.manualTypePrompt : (mediaUrl ? 'Audio recording captured. You can edit this transcript or save directly...' : '...')}
                className="w-full text-base leading-relaxed text-[#2C241E] p-3.5 rounded-2xl border border-[#DECFC0] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#8B4513] resize-y font-serif shadow-inner"
              />
            </div>

            {/* Duration */}
            {duration > 0 && (
              <p className="text-xs text-[#7A6A5C] mb-3.5 font-medium">
                ⏱️ {formatTimer(duration)} • {recordingType === 'video' ? `📹 ${t.family.video}` : `🎙️ ${t.family.voice}`} • {currentLangLabel}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={resetState} className="btn-secondary flex-1 text-xs cursor-pointer">
                {t.capture.rerecord}
              </button>
              <button
                onClick={handleSave}
                disabled={!transcript.trim() && !mediaBlob && !mediaUrl}
                className="btn-primary flex-1 text-xs disabled:opacity-40 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4" /> {t.capture.saveToArchive}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SAVED CONFIRMATION ─── */}
      {saved && (
        <div className="animate-fade-in-up text-center max-w-sm mx-auto">
          <div className="card bg-gradient-to-b from-emerald-50 to-white border-2 border-emerald-200 shadow-elevated p-8">
            <div className="w-18 h-18 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-sm">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-emerald-950 mb-2">{t.capture.savedTitle}</h3>
            <p className="text-xs text-emerald-800 mb-6 leading-relaxed">
              {t.capture.savedMessage}
            </p>
            <button onClick={handleNext} className="btn-primary w-full text-sm cursor-pointer shadow-md">
              {t.capture.recordAnother}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
