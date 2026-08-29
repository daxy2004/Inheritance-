import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../state/AppContext';
import { Heart, Sparkles, Music, Image, Play, Pause, RotateCcw, Check, AlertCircle, Loader2, Volume2, ShieldCheck } from 'lucide-react';
import { StoryEntry, Theme, Language, SUPPORTED_LANGUAGES } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { directGenerateMemorialNarrative, directElevenLabsVoiceClone } from '../services/aiDirectService';

export const VoiceMemorialStudio: React.FC<{ onSaved?: () => void }> = ({ onSaved }) => {
  const { addEntry, language, setLanguage, t } = useApp();

  // Form State
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [approxYear, setApproxYear] = useState('');
  const [memoriesText, setMemoriesText] = useState('');

  // Media Files
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

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

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(60);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSaved, setIsSaved] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  /* ─── 1. Handle Audio File Upload ─── */
  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
    }
  };

  /* ─── 2. Handle Photo Upload ─── */
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

  /* ─── 3. Generate Memorial Monologue via Gemini 3.5 Flash ─── */
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
      let audioBase64: string | undefined;
      let audioMimeType: string | undefined;

      if (audioFile) {
        audioMimeType = audioFile.type || 'audio/webm';
        audioBase64 = await fileToBase64(audioFile);
      }

      let monologue = '';
      let title = `Memories of ${personName || 'Family'}`;
      let pullQuote = '';
      let theme: Theme = 'Family';
      let phoneticSpeech = '';

      // Step 1: Call Gemini 3.5 Flash / OpenRouter directly
      try {
        const result = await directGenerateMemorialNarrative(
          personName,
          relationship,
          memoriesText,
          language,
          audioBase64,
          audioMimeType,
        );

        monologue = result.monologue || '';
        phoneticSpeech = result.phoneticSpeech || '';
        title = result.title || title;
        pullQuote = result.pullQuote || '';
        theme = result.theme || 'Family';
      } catch (cloudErr) {
        console.warn('[VoiceMemorial] Cloud generator note, using local storyteller:', cloudErr);
        const name = personName.trim() || (language === 'hi' ? 'हमारे प्रियजन' : language === 'kn' ? 'ನಮ್ಮ ಪ್ರೀತಿಪಾತ್ರರು' : language === 'ta' ? 'நம் அன்பிற்குரியவர்' : 'Our Beloved');
        const rel = relationship.trim() || (language === 'hi' ? 'परिवार' : language === 'kn' ? 'ಕುಟುಂಬ' : language === 'ta' ? 'குடும்பம்' : 'Family');

        if (language === 'hi') {
          title = `${name} (${rel}) के संस्मरण`;
          monologue = `मैं हमेशा याद रखता हूँ कि कैसे ${name} ने हमें हर परिस्थिति में एक साथ रहना सिखाया। ${memoriesText.trim()}। उनकी बातें और उनका स्नेह हमारे दिल में हमेशा जीवित रहेगा।`;
          pullQuote = memoriesText.slice(0, 100) + '...';
        } else if (language === 'kn') {
          title = `${name} (${rel}) ಅವರ ನೆನಪುಗಳು`;
          monologue = `${name} ಅವರ ಜೊತೆ ಕಳೆದ ಪ್ರತಿಯೊಂದು ಕ್ಷಣವೂ ಒಂದು ಸುಂದರ ನೆನಪು. ${memoriesText.trim()}. ಅವರ ಪ್ರೀತಿ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ ನಮ್ಮ ಕುಟುಂಬದೊಂದಿಗೆ ಸದಾ ಇರುತ್ತದೆ.`;
          pullQuote = memoriesText.slice(0, 100) + '...';
        } else if (language === 'ta') {
          title = `${name} (${rel}) அவர்களின் நினைவுகள்`;
          monologue = `${name} அவர்கள் நமக்கு கற்றுக்கொடுத்த பாடம் என்றும் மறையாது. ${memoriesText.trim()}. அவர்களின் அன்பு என்றும் நம்முடன் இருக்கும்.`;
          pullQuote = memoriesText.slice(0, 100) + '...';
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

      // Step 2: Synthesize voice playback
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

  /* ─── 4. Synthesize Neural Voice (ElevenLabs Instant Voice Cloning) ─── */
  const synthesizeNeuralVoice = async (text: string, voice = voicePersona, phoneticText?: string) => {
    setIsSynthesizingVoice(true);
    try {
      const result = await directElevenLabsVoiceClone(
        text,
        voice,
        audioFile,
        personName.trim() || 'Family Elder',
      );

      setNeuralAudioBlob(result.blob);
      setNeuralAudioUrl(result.url);
      setActiveModelName(result.model);
      return;
    } catch (hfErr) {
      console.warn('[Voice synthesis offline note]:', hfErr);
    } finally {
      setIsSynthesizingVoice(false);
    }
    setActiveModelName('On-Device Neural Speech');
  };

  /* ─── 5. Playback Controls ─── */
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
      // Fallback speech synthesis
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

  /* ─── 6. Save to Family Archive ─── */
  const handleSaveToArchive = async () => {
    if (!generatedMonologue) return;

    // Use synthesized neural audio blob if available, or user uploaded file
    const mediaBlob: Blob | null = neuralAudioBlob || audioFile;
    const mediaUrl = neuralAudioUrl || audioPreviewUrl || '';

    const newEntry: StoryEntry = {
      id: `memorial-${Date.now()}`,
      type: 'audio',
      title: generatedTitle || `🕊️ In Memory of ${personName || 'Loved One'}`,
      prompt: `Remembering ${personName || 'Our Elder'} (${relationship || 'Family'})`,
      transcript: generatedMonologue,
      mediaBlob,
      mediaUrl,
      mediaDurationSec: duration || 75,
      recordedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      approxYear: approxYear || 'Memorial',
      theme: generatedTheme,
      pullQuote: generatedPullQuote || generatedMonologue.slice(0, 100),
      speaker: personName ? `${personName} (${relationship || 'Memorial'})` : 'Loved One',
      tags: ['Memorial', 'Tribute', personName || 'Family', 'Legacy'],
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
        {/* Step 1: Upload Reference Audio & Photo */}
        <div className="card p-4 space-y-4 border border-[#E6DDD2]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B4513]">
              Step 1 • Audio Sample & Photo
            </span>
            <span className="text-[10px] bg-[#EFE6DB] text-[#8B4513] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>ElevenLabs Voice Clone</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Audio File Input */}
            <div>
              <input
                type="file"
                ref={audioInputRef}
                onChange={handleAudioSelect}
                accept="audio/*,video/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all ${
                  audioFile
                    ? 'border-[#8B4513] bg-[#FAF7F2]'
                    : 'border-[#DECFC0] bg-white hover:border-[#8B4513]/50'
                }`}
              >
                <Music className="w-6 h-6 text-[#8B4513] mb-1" />
                <span className="text-xs font-semibold text-[#2C241E] truncate max-w-[130px]">
                  {audioFile ? audioFile.name : 'Upload Voice Audio'}
                </span>
                <span className="text-[10px] text-[#7A6A5C] mt-0.5">
                  {audioFile ? `${Math.round(audioFile.size / 1024)} KB` : 'WhatsApp, Video or Call'}
                </span>
              </button>
            </div>

            {/* Photo Input */}
            <div>
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className={`w-full h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 text-center transition-all overflow-hidden relative ${
                  photoUrl
                    ? 'border-[#8B4513] bg-[#FAF7F2]'
                    : 'border-[#DECFC0] bg-white hover:border-[#8B4513]/50'
                }`}
              >
                {photoUrl ? (
                  <img src={photoUrl} alt="Portrait" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <Image className="w-6 h-6 text-[#8B4513] mb-1" />
                    <span className="text-xs font-semibold text-[#2C241E]">
                      Upload Photo
                    </span>
                    <span className="text-[10px] text-[#7A6A5C] mt-0.5">
                      Portrait or Vintage Photo
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {audioPreviewUrl && (
            <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E9DFD4] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#8B4513]" />
                <span className="text-xs font-medium text-[#4A3B2F] truncate max-w-[200px]">
                  Original Reference Clip
                </span>
              </div>
              <audio src={audioPreviewUrl} controls className="h-7 max-w-[140px]" />
            </div>
          )}
        </div>

        {/* Step 2: Person Details */}
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

          <div>
            <label className="text-[10px] uppercase font-bold text-[#7A6A5C] block mb-1">
              Time Period / Years (Optional)
            </label>
            <input
              type="text"
              value={approxYear}
              onChange={(e) => setApproxYear(e.target.value)}
              placeholder="e.g. 1942 – 2021"
              className="w-full bg-[#FAF7F2] border border-[#DECFC0] rounded-xl px-3 py-2 text-xs text-[#2C241E] focus:outline-none focus:ring-1 focus:ring-[#8B4513]"
            />
          </div>

          {/* Spoken Language Selection */}
          <div>
            <label className="text-[10px] uppercase font-bold text-[#7A6A5C] block mb-1.5">
              Spoken Language & Dialect
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all ${
                    language === l.code
                      ? 'border-[#8B4513] bg-[#8B4513] text-white shadow-xs font-bold'
                      : 'border-[#DECFC0] bg-white text-[#4A3B2F] hover:border-[#8B4513]/40'
                  }`}
                >
                  <div className="text-xs font-semibold">{l.nativeName}</div>
                  <div className={`text-[9px] ${language === l.code ? 'text-white/80' : 'text-[#7A6A5C]'}`}>{l.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ElevenLabs Instant Voice Cloning Indicator */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#DECFC0] flex items-center gap-2.5 text-xs text-[#5C4D40]">
            <div className="w-6 h-6 rounded-lg bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-semibold text-[#2C241E] block">
                ElevenLabs Instant Voice Cloning
              </span>
              <span className="text-[11px] text-[#7A6A5C]">
                {audioFile ? `Ready to clone "${audioFile.name}" into their exact spoken voice in ${langLabel}` : `Upload an audio recording above to clone their exact voice in ${langLabel}`}
              </span>
            </div>
          </div>
        </div>

        {/* Step 3: Typed Memories & AI Narrative Synthesis */}
        <div className="card p-4 space-y-3 border border-[#E6DDD2]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#8B4513]">
              Step 3 • Type Memories & Stories ({langLabel})
            </span>
          </div>

          <textarea
            rows={4}
            value={memoriesText}
            onChange={(e) => setMemoriesText(e.target.value)}
            placeholder={`Type memories, personality traits, favorite advice, or stories in ${langLabel}...
Example: He loved morning filter coffee in Mysore, worked 35 years as a maths teacher, and always said 'Patience is the foundation of character'.`}
            className="w-full bg-[#FAF7F2] border border-[#DECFC0] rounded-xl p-3 text-xs text-[#2C241E] focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
          />

          {errorMessage && (
            <div className="p-2.5 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            onClick={handleGenerateNarrative}
            disabled={isGeneratingNarrative || isSynthesizingVoice || !memoriesText.trim()}
            className="btn-primary w-full !py-2.5 text-xs font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {isGeneratingNarrative || isSynthesizingVoice ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isGeneratingNarrative ? `Gemini 3.5 Writing Monologue in ${langLabel}...` : 'ElevenLabs Cloning Voice & Synthesizing...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Clone Voice & Recreate Living Monologue</span>
              </>
            )}
          </button>
        </div>

        {/* Step 4: Living Memorial Player & Neural Voice */}
        {generatedMonologue && (
          <div className="card p-4 sm:p-5 space-y-4 border-2 border-[#8B4513]/40 bg-white shadow-md animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-[#F0E8DE] pb-2.5">
              <div className="flex items-center gap-2">
                {photoUrl ? (
                  <img src={photoUrl} alt="Portrait" className="w-9 h-9 rounded-full object-cover border-2 border-[#8B4513]" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#EFE6DB] text-[#8B4513] flex items-center justify-center font-bold">
                    🕊️
                  </div>
                )}
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#2C241E]">
                    {generatedTitle}
                  </h3>
                  <span className="text-[10px] text-[#7A6A5C]">
                    {personName || 'Loved One'} • {langLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeModelName && (
                  <span className="text-[9px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full border border-green-200">
                    {activeModelName}
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-[#8B4513] bg-[#EFE6DB] px-2 py-0.5 rounded-full">
                  {generatedTheme}
                </span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-[#F0E8DE] border border-[#E3D7C9] flex items-center gap-3">
              <button
                onClick={handleTogglePlay}
                className="w-11 h-11 rounded-full bg-[#8B4513] text-white flex items-center justify-center shadow-md hover:bg-[#6E330B] transition-all shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-[11px] text-[#7A6A5C] mb-1">
                  <span className="font-semibold text-[#8B4513]">
                    {neuralAudioUrl ? 'Neural Voice Track' : 'Spoken Audio'}
                  </span>
                  <span className="font-mono">{currentTime}s / {duration}s</span>
                </div>
                <div className="w-full bg-[#E6DDD2] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8B4513] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${(currentTime / Math.max(duration, 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Pacing / Speed Controls */}
              <div className="flex items-center gap-1 bg-[#EFE6DB] p-1 rounded-xl shrink-0">
                {[
                  { label: '0.75x', val: 0.75 },
                  { label: '0.85x', val: 0.85 },
                  { label: '1.0x', val: 1.0 },
                ].map((s) => (
                  <button
                    key={s.val}
                    type="button"
                    onClick={() => {
                      setPlaybackRate(s.val);
                      if (audioRef.current) audioRef.current.playbackRate = s.val;
                    }}
                    className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                      playbackRate === s.val
                        ? 'bg-[#8B4513] text-white shadow-xs'
                        : 'text-[#5C4D40] hover:text-[#2C241E]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="p-2 text-[#7A6A5C] hover:text-[#2C241E] rounded-lg hover:bg-[#EFE6DB]"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Monologue Transcript with synchronized captions */}
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DDD2] max-h-48 overflow-y-auto">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8B4513] block mb-1">
                Spoken Monologue
              </span>
              <p className="font-serif text-xs sm:text-sm leading-relaxed text-[#3B2E24]">
                {isPlaying ? (
                  words.map((word, idx) => (
                    <span
                      key={idx}
                      className={`transition-colors duration-150 ${
                        idx <= currentWordIndex
                          ? 'text-[#2C241E] font-semibold bg-[#EFE6DB] px-0.5 rounded'
                          : 'text-[#7A6A5C]'
                      }`}
                    >
                      {word}{' '}
                    </span>
                  ))
                ) : (
                  generatedMonologue
                )}
              </p>
            </div>

            {/* Pull Quote */}
            {generatedPullQuote && (
              <div className="p-2.5 bg-white rounded-xl border border-dashed border-[#DECFC0] italic text-xs text-[#5C4D40] font-serif">
                "{generatedPullQuote}"
              </div>
            )}

            {/* Save to Archive Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveToArchive}
                disabled={isSaved}
                className="btn-primary w-full !py-3 text-xs font-semibold shadow-md flex items-center justify-center gap-2"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-300" />
                    <span>Saved to Living Family Archive!</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-current" />
                    <span>Save to Family Timeline & Heirloom Book</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Helper: Convert File to Base64 ─── */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const base64 = res.split(',')[1] || res;
      resolve(base64);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
