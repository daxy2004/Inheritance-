import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { 
  Heart, 
  Sparkles, 
  Music, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Loader2, 
  Volume2, 
  ShieldCheck,
  Mic,
  Camera,
  Square,
  Upload,
  Trash2
} from 'lucide-react';
import { StoryEntry, Theme, Language, SUPPORTED_LANGUAGES } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { directGenerateMemorialNarrative, directElevenLabsVoiceClone } from '../services/aiDirectService';

export const VoiceMemorialStudio: React.FC<{ onSaved?: () => void }> = ({ onSaved }) => {
  const { addEntry, language, setLanguage, t } = useApp();

  // Form State
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [memoriesText, setMemoriesText] = useState('');

  // Media Files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  // Live On-the-spot Recording State
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  const [liveDuration, setLiveDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveTimerRef = useRef<any>(null);

  // AI Generation State
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false);
  const [generatedMonologue, setGeneratedMonologue] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedPullQuote, setGeneratedPullQuote] = useState('');
  const [generatedTheme, setGeneratedTheme] = useState<Theme>('Family');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Neural Audio & Voice Persona State
  const [voicePersona, setVoicePersona] = useState<'Charon' | 'Kore' | 'Puck' | 'Aoede'>('Charon');
  const [neuralAudioBlob, setNeuralAudioBlob] = useState<Blob | null>(null);
  const [neuralAudioUrl, setNeuralAudioUrl] = useState<string | null>(null);
  const [activeModelName, setActiveModelName] = useState<string | null>(null);
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [isVoiceCloned, setIsVoiceCloned] = useState(false);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSaved, setIsSaved] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const photoCameraInputRef = useRef<HTMLInputElement | null>(null);
  const photoGalleryInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (liveTimerRef.current) clearInterval(liveTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  /* ─── 1. Live Voice Recording on the Spot ─── */
  const startLiveRecording = async () => {
    setErrorMessage(null);
    audioChunksRef.current = [];
    setLiveDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        const ext = mime.includes('wav') ? 'wav' : 'webm';
        const file = new File([blob], `live_recording_${Date.now()}.${ext}`, { type: mime });

        setAudioFile(file);
        setClonedVoiceId(null);
        const url = URL.createObjectURL(blob);
        setAudioPreviewUrl(url);

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start(500);
      setIsRecordingLive(true);

      liveTimerRef.current = setInterval(() => {
        setLiveDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('[Live Record Error]', err);
      setErrorMessage('Could not access microphone for live recording.');
    }
  };

  const stopLiveRecording = () => {
    if (liveTimerRef.current) clearInterval(liveTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingLive(false);
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setClonedVoiceId(null);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearAudio = () => {
    setAudioFile(null);
    setClonedVoiceId(null);
    setIsVoiceCloned(false);
    setAudioPreviewUrl(null);
  };

  const clearPhoto = () => {
    setPhotoUrl(null);
  };

  /* ─── 2. Generate Memorial Monologue via Gemini 3.5 Flash ─── */
  const handleGenerateNarrative = async () => {
    if (!memoriesText.trim()) {
      setErrorMessage('Please type some memories, stories, or personality traits first.');
      return;
    }

    setErrorMessage(null);
    setIsGeneratingNarrative(true);
    setNeuralAudioUrl(null);
    setNeuralAudioBlob(null);

    try {
      const name = personName.trim() || 'Our Beloved Elder';
      const rel = relationship.trim() || 'Family Elder';

      let monologue = '';
      let title = '';
      let pullQuote = '';
      let phoneticSpeech = '';
      let theme: Theme = 'Family';

      // Call Gemini 3.5 Flash / OpenRouter directly
      try {
        const response = await directGenerateMemorialNarrative(
          name,
          rel,
          memoriesText,
          language,
          'Comforting & Reflective',
        );

        monologue = response.monologue;
        title = response.title;
        pullQuote = response.pullQuote;
        phoneticSpeech = response.phoneticSpeech || '';
        theme = (response.theme as Theme) || 'Family';
      } catch (geminiErr: any) {
        console.warn('[VoiceMemorial] Cloud generator note, using local storyteller:', geminiErr);

        if (language === 'hi') {
          title = `${name} की अनमोल यादें`;
          monologue = `${name} के साथ बिताया हर पल हमारे परिवार के लिए एक धरोहर है। ${memoriesText.trim()}। उनकी सीख और प्यार सदैव हमारे दिलों में रहेगा।`;
          pullQuote = memoriesText.slice(0, 80) + '...';
        } else if (language === 'kn') {
          title = `${name} ಅವರ ಅಮೂಲ್ಯ ನೆನಪುಗಳು`;
          monologue = `${name} ಅವರೊಂದಿಗಿನ ಪ್ರತಿಯೊಂದು ಕ್ಷಣವೂ ನಮ್ಮ ಕುಟುಂಬಕ್ಕೆ ಅಚ್ಚಳಿಯದ ನೆನಪು. ${memoriesText.trim()}. ಅವರ ಪ್ರೀತಿ, ಆಶೀರ್ವಾದ ಮತ್ತು ಜೀವನದ ಪಾಠಗಳು ನಮ್ಮಲ್ಲಿ ಎಂದಿಗೂ ಜೀವಂತವಾಗಿರುತ್ತವೆ.`;
          pullQuote = memoriesText.slice(0, 80) + '...';
        } else if (language === 'ta') {
          title = `${name} அவர்களின் பொக்கிஷ நினைவுகள்`;
          monologue = `${name} அவர்களுடன் வாழ்ந்த நினைவுகள் எங்கள் குடும்பத்தின் பெரும் செல்வம். ${memoriesText.trim()}। அவர்களின் வழிகாட்டுதலும் அன்பும் என்றும் நம்முடன் இருக்கும்.`;
          pullQuote = memoriesText.slice(0, 80) + '...';
        } else {
          title = `Reflections & Memories of ${name}`;
          monologue = `Looking back on everything ${name} shared with us as a beloved ${rel.toLowerCase()}, these moments define who we are today. ${memoriesText.trim()}. Their wisdom, warmth, and laughter will echo in our family for generations to come.`;
          pullQuote = memoriesText.slice(0, 100) + '...';
        }
      }

      setGeneratedMonologue(monologue);
      setGeneratedTitle(title);
      setGeneratedPullQuote(pullQuote || monologue.slice(0, 120) + '...');
      setGeneratedTheme(theme);

      // Synthesize voice playback
      if (monologue) {
        await synthesizeNeuralVoice(monologue, voicePersona, phoneticSpeech);
      }
    } catch (err: any) {
      console.error('[Gemini Narrative Error]', err);
      setErrorMessage(err.message || 'Could not generate narrative. Please try again.');
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  /* ─── 3. Synthesize Neural Voice (ElevenLabs Instant Voice Cloning) ─── */
  const synthesizeNeuralVoice = async (text: string, voice = voicePersona, targetLang = language) => {
    setIsSynthesizingVoice(true);
    try {
      const result = await directElevenLabsVoiceClone(
        text,
        voice,
        audioFile,
        personName.trim() || 'Family Elder',
        targetLang,
        clonedVoiceId || undefined,
      );

      setNeuralAudioBlob(result.blob);
      setNeuralAudioUrl(result.url);
      setActiveModelName(result.model);
      if (result.voiceId) {
        setClonedVoiceId(result.voiceId);
      }
      setIsVoiceCloned(result.isCustomCloned);
    } catch (hfErr: any) {
      console.error('[Voice synthesis error]:', hfErr);
      setErrorMessage(hfErr?.message || 'Voice cloning failed. Please ensure at least 3-5 seconds of clear audio is recorded.');
    } finally {
      setIsSynthesizingVoice(false);
    }
  };

  /* ─── 4. Playback Controls ─── */
  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);

    if (audioRef.current && neuralAudioUrl) {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch((err) => console.warn('[Audio Play]', err));
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      const utterance = new SpeechSynthesisUtterance(generatedMonologue);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
      utterance.rate = playbackRate;
      window.speechSynthesis.speak(utterance);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (audioRef.current) {
        setCurrentTime(Math.floor(audioRef.current.currentTime));
        const dur = Math.floor(audioRef.current.duration || duration);
        setDuration(dur);
        const words = generatedMonologue.split(/\s+/);
        const estWordIdx = Math.floor((audioRef.current.currentTime / Math.max(dur, 1)) * words.length);
        setCurrentWordIndex(estWordIdx);
      }
    }, 500);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleReset = () => {
    handlePause();
    setCurrentTime(0);
    setCurrentWordIndex(-1);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  /* ─── 5. Save to Family Archive ─── */
  const handleSaveToArchive = async () => {
    if (!generatedMonologue) return;

    const newEntry: StoryEntry = {
      id: `memorial-${Date.now()}`,
      type: 'audio',
      title: generatedTitle || `Tribute to ${personName || 'Family'}`,
      prompt: `Spoken memorial and life wisdom of ${personName || 'our loved one'}`,
      transcript: generatedMonologue,
      mediaBlob: neuralAudioBlob || (audioFile ? new Blob([await audioFile.arrayBuffer()], { type: audioFile.type }) : null),
      mediaUrl: neuralAudioUrl || audioPreviewUrl || '',
      mediaDurationSec: duration || 60,
      recordedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      approxYear: new Date().getFullYear().toString(),
      theme: generatedTheme || 'Family',
      pullQuote: generatedPullQuote || generatedMonologue.slice(0, 100) + '...',
      speaker: personName.trim() || 'Loved One',
      tags: ['tribute', 'memorial', 'voice-clone', language],
      isSample: false,
      language,
      isMemorial: true,
      memorialPhotoUrl: photoUrl || undefined,
    };

    await addEntry(newEntry);
    setIsSaved(true);
    if (onSaved) onSaved();
  };

  const words = generatedMonologue.split(/\s+/);
  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English';

  return (
    <div className="min-h-screen pb-32 px-4 pt-[max(env(safe-area-inset-top,0px),16px)] bg-[#FAF7F2]">
      {/* Hidden Audio Player for Neural Audio Blob */}
      {neuralAudioUrl && (
        <audio
          ref={audioRef}
          src={neuralAudioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
            setCurrentWordIndex(-1);
          }}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DDD2] pb-3 mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center font-bold">
              🕊️
            </div>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-semibold text-[#2C241E]">
                Voice Memorial & Tribute Studio
              </h1>
              <p className="text-[11px] text-[#7A6A5C]">
                Recreate living memories with Gemini 3.5 & ElevenLabs Voice Cloning
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <LanguageSelector compact={true} />
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-5">
        {/* Step 1: Voice Sample & Photo (Record on the spot or upload) */}
        <div className="card p-4 space-y-4 border border-[#E6DDD2]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B4513]">
              Step 1 • Voice Sample & Photo
            </span>
            <span className="text-[10px] bg-[#EFE6DB] text-[#8B4513] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>ElevenLabs Voice Clone</span>
            </span>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={audioFileInputRef}
            onChange={handleAudioSelect}
            accept="audio/*,video/*"
            className="hidden"
          />
          <input
            type="file"
            ref={photoCameraInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input
            type="file"
            ref={photoGalleryInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Audio Section: Record on spot OR Upload */}
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#DECFC0] space-y-2 text-center">
              <span className="text-[11px] font-bold text-[#2C241E] block">
                🎙️ Voice Recording
              </span>

              {isRecordingLive ? (
                <div className="py-2 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto animate-pulse shadow-md">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono font-bold text-red-600 block">
                    Recording: {liveDuration}s
                  </span>
                  <button
                    type="button"
                    onClick={stopLiveRecording}
                    className="w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop Recording</span>
                  </button>
                </div>
              ) : audioFile ? (
                <div className="py-2 space-y-2">
                  <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-[#E6DDD2] text-left">
                    <div className="truncate mr-2">
                      <span className="text-xs font-semibold text-[#2C241E] block truncate max-w-[110px]">
                        {audioFile.name}
                      </span>
                      <span className="text-[10px] text-[#7A6A5C]">
                        {Math.round(audioFile.size / 1024)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAudio}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remove audio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {audioPreviewUrl && (
                    <audio src={audioPreviewUrl} controls className="w-full h-7" />
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={startLiveRecording}
                    className="py-2.5 px-2 rounded-xl bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span className="text-[11px] leading-tight">Record on Spot</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    className="py-2.5 px-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#DECFC0] text-[#2C241E] text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#8B4513]" />
                    <span className="text-[11px] leading-tight">Upload Audio</span>
                  </button>
                </div>
              )}
            </div>

            {/* Photo Section: Take Photo on spot OR Upload */}
            <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#DECFC0] space-y-2 text-center">
              <span className="text-[11px] font-bold text-[#2C241E] block">
                📷 Portrait Photo
              </span>

              {photoUrl ? (
                <div className="relative rounded-xl overflow-hidden h-24 border border-[#E6DDD2]">
                  <img src={photoUrl} alt="Portrait" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={clearPhoto}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => photoCameraInputRef.current?.click()}
                    className="py-2.5 px-2 rounded-xl bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span className="text-[11px] leading-tight">Take Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => photoGalleryInputRef.current?.click()}
                    className="py-2.5 px-2 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#DECFC0] text-[#2C241E] text-xs font-bold flex flex-col items-center justify-center gap-1 shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4 text-[#8B4513]" />
                    <span className="text-[11px] leading-tight">From Gallery</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Person Details (Name & Relationship) */}
        <div className="card p-4 space-y-3 border border-[#E6DDD2]">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B4513]">
            Step 2 • Loved One's Details
          </span>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-[#7A6A5C] block mb-1">
                Name
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => setPersonName(e.target.value)}
                placeholder="e.g. Grandpa Ramesh"
                className="w-full bg-[#FAF7F2] border border-[#DECFC0] rounded-xl px-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-[#7A6A5C] block mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g. Grandfather / Teacher"
                className="w-full bg-[#FAF7F2] border border-[#DECFC0] rounded-xl px-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Memories Input & Regional Language Picker */}
        <div className="card p-4 space-y-3 border border-[#E6DDD2]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B4513]">
              Step 3 • Spoken Memories & Stories
            </span>
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#DECFC0]">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    language === l.code
                      ? 'bg-[#8B4513] text-white shadow-xs'
                      : 'text-[#7A6A5C] hover:text-[#2C241E]'
                  }`}
                >
                  {l.nativeName}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-[#7A6A5C]">
            Select target language above. Gemini AI will compose the tribute monologue in <strong>{langLabel}</strong> and ElevenLabs will speak it in native audio.
          </p>

          <textarea
            value={memoriesText}
            onChange={(e) => setMemoriesText(e.target.value)}
            rows={4}
            placeholder={
              language === 'kn'
                ? `ಅವರ ಬಗ್ಗೆ ನಿಮ್ಮ ನೆನಪುಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ (ಉದಾ: ಅವರ ಪ್ರೀತಿ, ಕೃಷಿ, ಊರು, ಜೀವನದ ಮೌಲ್ಯಗಳು, ಪಾಕವಿಧಾನಗಳು ಅಥವಾ ಅವರ ನೆನಪಿನ ಮಾತುಗಳು)...`
                : language === 'hi'
                ? `अपने प्रियजन की यादें, सीख, किस्से या बातें यहाँ लिखें (या बोलें)...`
                : language === 'ta'
                ? `அவர்களின் வாழ்க்கைப் பாடங்கள், கதைகள், அன்பு மற்றும் நினைவுகளை இங்கே எழுதுங்கள்...`
                : `Describe what you loved most about ${personName || 'them'} — funny sayings, childhood stories, lessons, advice, recipes, or favorite memories...`
            }
            className="w-full bg-[#FAF7F2] border border-[#DECFC0] rounded-2xl p-3.5 text-xs sm:text-sm text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#8B4513] font-serif shadow-inner resize-y leading-relaxed"
          />

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleGenerateNarrative}
            disabled={isGeneratingNarrative || isSynthesizingVoice || !memoriesText.trim()}
            className="btn-primary w-full text-xs sm:text-sm font-bold shadow-elevated cursor-pointer disabled:opacity-50 py-3.5"
          >
            {isGeneratingNarrative ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Memorial with Gemini 3.5 Flash...</span>
              </>
            ) : isSynthesizingVoice ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Voice with ElevenLabs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Clone Voice & Recreate Living Monologue</span>
              </>
            )}
          </button>
        </div>

        {/* Step 4: Living Monologue & Playback Result */}
        {generatedMonologue && (
          <div className="card p-5 space-y-4 border-2 border-[#8B4513]/30 shadow-elevated bg-gradient-to-b from-white to-[#FAF7F2] animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-[#E6DDD2] pb-3">
              <div className="flex items-center gap-2.5">
                {photoUrl ? (
                  <img src={photoUrl} alt="Portrait" className="w-10 h-10 rounded-full object-cover border border-[#8B4513]" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#8B4513] text-white flex items-center justify-center font-bold text-sm">
                    {personName ? personName.charAt(0).toUpperCase() : '🕊️'}
                  </div>
                )}
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C241E] leading-tight">
                    {generatedTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isVoiceCloned ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        🎙️ Cloned Voice ({langLabel})
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#7A6A5C]">
                        {langLabel} • {activeModelName || 'ElevenLabs Multilingual v2'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-[10px] uppercase font-bold text-[#8B4513] bg-[#EFE6DB] px-2.5 py-1 rounded-full border border-[#DECFC0]">
                {generatedTheme}
              </span>
            </div>

            {/* Quick Language Switcher in Cloned Voice */}
            <div className="flex items-center justify-between gap-2 p-2 bg-[#FAF7F2] rounded-xl border border-[#E6DDD2]">
              <span className="text-[10px] font-bold text-[#7A6A5C] shrink-0">
                Speak in Cloned Voice:
              </span>
              <div className="flex items-center gap-1 overflow-x-auto">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    disabled={isSynthesizingVoice}
                    onClick={async () => {
                      setLanguage(l.code);
                      if (generatedMonologue) {
                        await synthesizeNeuralVoice(generatedMonologue, voicePersona, l.code);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      language === l.code
                        ? 'bg-[#8B4513] text-white shadow-xs'
                        : 'bg-white text-[#5C4D40] hover:bg-[#EFE6DB] border border-[#DECFC0]'
                    }`}
                  >
                    {l.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Karaoke Monologue Stream */}
            <div className="p-4 bg-white rounded-2xl border border-[#DECFC0] shadow-xs max-h-60 overflow-y-auto font-serif text-sm sm:text-base leading-relaxed text-[#3B2E24]">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className={`transition-colors duration-200 mr-1.5 ${
                    idx === currentWordIndex
                      ? 'bg-amber-200 text-[#8B4513] font-bold px-1 rounded'
                      : idx < currentWordIndex
                      ? 'text-[#2C241E]'
                      : 'text-[#5C4D40]'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B4513] to-[#5C2C16] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleReset}
                className="btn-secondary !py-2 !px-3 text-xs cursor-pointer"
                title="Restart audio"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 flex items-center justify-end gap-2">
                <button
                  onClick={handleSaveToArchive}
                  disabled={isSaved}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaved ? 'Saved to Family Archive' : 'Save to Archive'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
