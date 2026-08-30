/**
 * aiDirectService.ts — Direct Client-Side AI Engine for Web & Native Mobile (APK)
 *
 * Allows the Android APK (and browser) to directly call official cloud AI APIs
 * (Google Gemini 1.5/2.0 Flash, ElevenLabs Instant Voice Cloning, OpenRouter DeepSeek)
 * whenever the device has internet, with graceful on-device fallback when offline.
 */

import { Theme, Language, StoryEntry, QAMessage } from '../types';

export const GEMINI_KEY: string = (process.env as any)?.GEMINI_API_KEY || '';
export const ELEVENLABS_KEY: string = (process.env as any)?.ELEVENLABS_API_KEY || '';
export const OPENROUTER_KEY: string = (process.env as any)?.OPENROUTER_API_KEY || '';

/* ─── 1. Direct OpenRouter / Google Gemini Grounded Archive Q&A ─── */
export async function directAskArchive(
  question: string,
  transcriptsContext: string,
  speakerName = 'Grandmother',
  language: Language = 'en',
): Promise<{ answer: string; groundedInStoryIds: string[]; isGrounded: boolean; relevantQuote?: string; suggestedFollowUp?: string }> {
  const langName = language === 'hi' ? 'Hindi (हिन्दी)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English';

  const systemPrompt = `You are a warm, loving family historian and archivist helping relatives explore the recorded oral memoirs of ${speakerName}.

CRITICAL GROUNDING & MULTILINGUAL RULES:
1. Answer ONLY using the provided transcripts. If the answer is not present in the transcripts, say clearly that it wasn't recorded.
2. Never invent details, dates, recipes, names, or facts that aren't in the transcripts, in ANY language.
3. Respond in ${langName}. If the transcript is in Hindi, Kannada, or Tamil, write the entire response warmly in that respective script and language.
4. Reference which specific story or memory the answer comes from.
5. Suggest a gentle follow-up question in ${langName} for the family to ask the elder in person.

Return your answer strictly in valid JSON format:
{
  "answer": "Warm, conversational answer based ONLY on the transcripts in ${langName}",
  "groundedInStoryIds": ["id-1"],
  "isGrounded": true,
  "relevantQuote": "Exact or near-exact quote in the original language",
  "suggestedFollowUp": "Gentle question in ${langName}"
}`;

  const userPrompt = `Transcripts of ${speakerName}:\n${transcriptsContext || 'No transcripts provided.'}\n\nFamily Member's Question: "${question}"`;

  // 1. Primary: OpenRouter API (Minimax M3 / DeepSeek V4 Pro / DeepSeek Chat)
  if (OPENROUTER_KEY) {
    const candidateOpenRouterModels = [
      'minimax/minimax-m3',
      'deepseek/deepseek-v4-pro',
      'deepseek/deepseek-chat',
      'deepseek/deepseek-r1',
    ];

    for (const model of candidateOpenRouterModels) {
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://inheritance-archive.app',
            'X-Title': 'Inheritance Family Archive',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content || '';
          try {
            return JSON.parse(content);
          } catch {
            const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) return JSON.parse(match[1]);
          }
        }
      } catch (e) {
        console.warn(`[OpenRouter ${model} Note]`, e);
      }
    }
  }

  // 2. Fallback: Google Gemini 3.6 / 3.5 Flash
  if (GEMINI_KEY) {
    const candidateGeminiModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];
    for (const model of candidateGeminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
        });
        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              return JSON.parse(rawText);
            } catch {
              const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (match) return JSON.parse(match[1]);
            }
          }
        }
      } catch (e) {
        console.warn(`[Gemini ${model} Ask Note]`, e);
      }
    }
  }

  throw new Error('Cloud AI unavailable');
}

/* ─── Pronunciation & Speech Text Normalizer ─── */
export function cleanAndPunctuateForSpeech(rawText: string, lang: Language = 'en'): string {
  if (!rawText) return '';
  let clean = rawText
    .replace(/[*_#`~>[\](){}]/g, '') // remove markdown symbols that distort TTS
    .replace(/[\u0964\u0965]/g, '.') // convert Devanagari full stops to periods
    .replace(/[;—–]/g, ', ') // replace em-dashes / semicolons with natural breathing commas
    .replace(/["'«»“”‘’]/g, '') // remove quotes that alter intonation
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure space after punctuation for natural breath pacing
  clean = clean.replace(/([.,!?])(?=[^\s])/g, '$1 ');
  return clean;
}

/* ─── 2. Direct Gemini Memorial Narrative Generator ─── */
export async function directGenerateMemorialNarrative(
  personName: string,
  relationship: string,
  memories: string,
  language: Language = 'en',
  audioBase64?: string,
  audioMimeType?: string,
): Promise<{ monologue: string; phoneticSpeech: string; pullQuote: string; theme: Theme; title: string }> {
  const langName = language === 'hi' ? 'Hindi (हिन्दी)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English';
  const langCodeInstruction = language === 'kn'
    ? 'Write the monologue strictly in native, warm, colloquial spoken Kannada (ಕನ್ನಡ) script. Use natural Karnataka spoken phrases, avoiding complex Sanskrit compounds or archaic literary words. Spell out all numbers in full Kannada words.'
    : language === 'hi'
    ? 'Write the monologue strictly in native, warm, conversational Hindi (हिन्दी) Devanagari script. Use everyday spoken Hindustani, avoiding overly formal bookish Sanskrit. Spell out all numbers in full Hindi words.'
    : language === 'ta'
    ? 'Write the monologue strictly in native, warm, conversational spoken Tamil (தமிழ்) script (எளிய பேச்சு நடை). Avoid rigid classical Senthamizh. Spell out all numbers in full Tamil words.'
    : 'Write the monologue in heartfelt, natural conversational English with warm, spoken cadence. Spell out numbers as words.';

  const promptInstructions = `You are a compassionate oral historian and literary legacy biographer for the Inheritance family preservation app.
Your task is to take memories about ${personName || 'a loved one'} (${relationship || 'Family Member'}) and write an extraordinarily warm, heartfelt, authentic first-person storytelling monologue in ${langName}.
${langCodeInstruction}

CRITICAL SPOKEN CADENCE & PRONUNCIATION GUIDELINES:
1. Write in short, rhythmic sentences (8 to 15 words per sentence) that sound natural and effortless when spoken aloud.
2. Insert natural commas (,) wherever a speaker would naturally pause to take a gentle breath.
3. The tone must be intimate and affectionate, like a loving elder sitting by your side sharing cherished memories and blessings.
4. Avoid tongue-twisting compound words, dense jargon, or rigid grammar.
5. Do NOT include quotation marks, markdown asterisks, or bracketed directions.

Return ONLY a valid JSON object matching this schema:
{
  "monologue": "First-person spoken narrative in native ${langName} script (100-180 words with natural commas for speech)...",
  "phoneticSpeech": "The exact same monologue in phonetic Latin transliteration for voice cloning...",
  "pullQuote": "One memorable, touching quote in ${langName}...",
  "theme": "Family" | "Childhood" | "Career" | "Values" | "Recipes" | "Advice",
  "title": "Warm title for this memory in ${langName}..."
}`;

  if (GEMINI_KEY) {
    const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];
    for (const model of candidateModels) {
      try {
        const parts: any[] = [];
        if (audioBase64 && audioMimeType) {
          parts.push({ inlineData: { mimeType: audioMimeType, data: audioBase64 } });
          parts.push({ text: `${promptInstructions}\n\nListen to their audio recording to match vocal cadence. User memories:\n"${memories}"` });
        } else {
          parts.push({ text: `${promptInstructions}\n\nUser memories:\n"${memories}"` });
        }

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            try {
              return JSON.parse(rawText);
            } catch {
              const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
              if (match) return JSON.parse(match[1]);
            }
          }
        }
      } catch (e) {
        console.warn(`[Direct Gemini Narrative ${model} Error]`, e);
      }
    }
  }

  // Fallback to OpenRouter
  if (OPENROUTER_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-v4-pro',
          messages: [
            { role: 'system', content: promptInstructions },
            { role: 'user', content: `Memories: "${memories}"` },
          ],
          response_format: { type: 'json_object' },
        }),
      });
      if (res.ok) {
        const fbData = await res.json();
        const fbContent = fbData.choices?.[0]?.message?.content;
        if (fbContent) return JSON.parse(fbContent);
      }
    } catch (e) {
      console.warn('[Direct OpenRouter Narrative Error]', e);
    }
  }

  throw new Error('Cloud generator unavailable');
}

/* ─── 3. Direct ElevenLabs Instant Voice Cloning & Synthesis ─── */
const ELEVENLABS_VOICE_MAP: Record<string, string> = {
  Charon: 'GBv7mTt0atIp3Br8iCZE', // Warm, grandfatherly
  Puck: 'jBpfuIE2acCO8z3wKNLl',   // Calm, gentle
  Fenrir: 'onwK4e9ZLuTAKqWW03F9', // Deep, steady elder
  Aoede: '21m00Tcm4TlvDq8ikWAM',  // Warm, grandmotherly
  Kore: 'EXAVITQu4vr4xnSDxMaL',   // Soft, affectionate
  Thalia: 'AZnzlk1XvdvUeBnXmlld', // Energetic, storytelling
};

export async function directElevenLabsVoiceClone(
  text: string,
  voiceName = 'Charon',
  audioFile?: File | null,
  personName = 'Family Elder',
  language: Language = 'en',
  existingVoiceId?: string,
): Promise<{ blob: Blob; url: string; model: string; voiceId: string; isCustomCloned: boolean }> {
  if (!ELEVENLABS_KEY) {
    throw new Error('ElevenLabs API Key not configured');
  }

  let targetVoiceId = existingVoiceId || ELEVENLABS_VOICE_MAP[voiceName] || ELEVENLABS_VOICE_MAP.Charon;
  let isCustomCloned = Boolean(existingVoiceId);

  // Helper to ensure an open custom voice slot on ElevenLabs
  const ensureVoiceSlotAvailable = async () => {
    try {
      const vRes = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': ELEVENLABS_KEY },
      });
      if (!vRes.ok) return;
      const vData = await vRes.json();
      const cloned = (vData.voices || []).filter((v: any) => v.category === 'cloned');
      if (cloned.length >= 8) {
        // Sort ascending by created date to remove the oldest
        cloned.sort((a: any, b: any) => (a.created_at_unix || 0) - (b.created_at_unix || 0));
        const oldest = cloned[0];
        console.log(`[ElevenLabs] Freeing custom voice slot by removing oldest clone: ${oldest.name} (${oldest.voice_id})`);
        await fetch(`https://api.elevenlabs.io/v1/voices/${oldest.voice_id}`, {
          method: 'DELETE',
          headers: { 'xi-api-key': ELEVENLABS_KEY },
        });
      }
    } catch (err) {
      console.warn('[ElevenLabs] Slot cleanup notice:', err);
    }
  };

  // 1. If user provided a voice sample and we don't already have a cloned voiceId for this session, create the clone!
  if (audioFile && !existingVoiceId) {
    if (audioFile.size < 1000) {
      throw new Error('Audio recording too short. Please record or upload at least 3-5 seconds of voice.');
    }

    await ensureVoiceSlotAvailable();

    const safeLang = typeof language === 'string' && language.length <= 4 ? language : 'kn';
    const cleanName = (personName || 'Family Elder').slice(0, 30);
    const formData = new FormData();
    formData.append('name', `${cleanName} (${Date.now().toString().slice(-4)})`);
    formData.append('description', `Inheritance Voice Clone (${safeLang})`);
    formData.append('labels', JSON.stringify({ language: safeLang, type: 'family-archive' }));
    formData.append('files', audioFile, audioFile.name || 'voice_sample.wav');

    let cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
      },
      body: formData,
    });

    if (!cloneRes.ok && (cloneRes.status === 400 || cloneRes.status === 429)) {
      // If blocked by voice limit or transient error, force free slots and retry once
      console.log('[ElevenLabs] Retrying voice add after slot cleanup...');
      await ensureVoiceSlotAvailable();
      cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_KEY,
        },
        body: formData,
      });
    }

    if (cloneRes.ok) {
      const cloneData = await cloneRes.json();
      if (cloneData.voice_id) {
        targetVoiceId = cloneData.voice_id;
        isCustomCloned = true;
        console.log(`[ElevenLabs] Successfully created Instant Voice Clone for ${personName}: ${targetVoiceId}`);
      }
    } else {
      const errBody = await cloneRes.text();
      console.error('[ElevenLabs Voice Add Error]', cloneRes.status, errBody);
      let userMsg = 'Voice cloning could not process audio sample.';
      try {
        const parsed = JSON.parse(errBody);
        if (parsed.detail?.message) userMsg = parsed.detail.message;
      } catch (_) {}
      throw new Error(`Voice Cloning Error: ${userMsg}. Please record 5-10 seconds of clear speech.`);
    }
  }

  // 2. Synthesize audio with ElevenLabs Multilingual v2 (Indic script autodetection for Kannada, Hindi, Tamil, English)
  const speechText = cleanAndPunctuateForSpeech(text, language);
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`;
  const ttsRes = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: speechText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.60,
        similarity_boost: 0.85,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!ttsRes.ok) {
    const errText = await ttsRes.text();
    throw new Error(`ElevenLabs TTS Error: ${errText}`);
  }

  const audioBlob = await ttsRes.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  const langLabel = language === 'hi' ? 'Hindi (हिन्दी)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English';

  return {
    blob: audioBlob,
    url: audioUrl,
    model: isCustomCloned ? `Instant Voice Clone (${langLabel})` : `ElevenLabs Multilingual v2 (${langLabel})`,
    voiceId: targetVoiceId,
    isCustomCloned,
  };
}

/* ─── 4. Client-side Audio Extraction & Direct Multimodal Transcription ─── */
async function extractAudioWavFromMediaBlob(mediaBlob: Blob): Promise<{ base64: string; mimeType: string }> {
  try {
    const AudioContextClass = typeof window !== 'undefined'
      ? (window as any).AudioContext || (window as any).webkitAudioContext
      : null;

    if (AudioContextClass) {
      const arrayBuffer = await mediaBlob.arrayBuffer();
      const audioCtx = new AudioContextClass();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
      
      const targetSampleRate = 16000;
      const numChannels = 1;
      const length = Math.max(1, Math.floor(audioBuffer.duration * targetSampleRate));
      
      const offlineCtx = new ((window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext)(
        numChannels,
        length,
        targetSampleRate
      );
      
      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(offlineCtx.destination);
      source.start(0);
      
      const renderedBuffer = await offlineCtx.startRendering();
      const channelData = renderedBuffer.getChannelData(0);
      
      const wavBuffer = new ArrayBuffer(44 + channelData.length * 2);
      const view = new DataView(wavBuffer);
      
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + channelData.length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true); // PCM
      view.setUint16(22, 1, true); // Mono
      view.setUint32(24, targetSampleRate, true);
      view.setUint32(28, targetSampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, channelData.length * 2, true);
      
      let offset = 44;
      for (let i = 0; i < channelData.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
      
      let binary = '';
      const bytes = new Uint8Array(wavBuffer);
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      if (base64 && base64.length > 50) {
        return { base64, mimeType: 'audio/wav' };
      }
    }
  } catch (extractErr) {
    console.warn('[Audio Extraction Fallback]:', extractErr);
  }

  // Fallback to raw base64 data
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1] || '');
    };
    reader.readAsDataURL(mediaBlob);
  });

  const rawMime = mediaBlob.type ? mediaBlob.type.split(';')[0] : 'video/mp4';
  return { base64, mimeType: rawMime };
}

export async function directTranscribeAudioBlob(
  audioBlob: Blob,
  language: Language = 'en',
): Promise<string> {
  if (!audioBlob || audioBlob.size === 0) return '';
  const langName = language === 'hi' ? 'Hindi (हिन्दी)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English';

  try {
    const { base64: base64Data, mimeType: cleanMime } = await extractAudioWavFromMediaBlob(audioBlob);
    if (!base64Data) return '';

    const promptText = `You are an expert oral historian and speech-to-text transcriber. Listen carefully to this recording of a family member sharing a memory. Transcribe everything spoken verbatim in its authentic language (${langName}). If spoken in Hindi, Kannada, Tamil, or English, transcribe directly into that respective script. Do NOT summarize, translate, or add commentary. Return ONLY the exact transcribed speech text. If no clear speech is heard, return an empty string.`;

    // 1. Try Direct Google Gemini Flash models
    if (GEMINI_KEY) {
      const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];

      for (const model of candidateModels) {
        try {
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
          const res = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: promptText },
                    { inlineData: { mimeType: cleanMime, data: base64Data } },
                  ],
                },
              ],
              generationConfig: { temperature: 0.1 },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
            if (text && text.toLowerCase() !== 'none' && text !== '.') {
              return text;
            }
          } else {
            console.warn(`[Gemini ${model} transcribe status ${res.status}]`);
          }
        } catch (modelErr) {
          console.warn(`[Gemini ${model} transcribe error]`, modelErr);
        }
      }
    }

    // 2. Multimodal Fallback: OpenRouter google/gemini-2.5-flash
    if (OPENROUTER_KEY) {
      try {
        const dataUrl = `data:${cleanMime};base64,${base64Data}`;
        const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENROUTER_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: promptText },
                  { type: 'image_url', image_url: { url: dataUrl } },
                ],
              },
            ],
          }),
        });

        if (orRes.ok) {
          const orData = await orRes.json();
          const orText = orData.choices?.[0]?.message?.content?.trim() || '';
          if (orText && orText.toLowerCase() !== 'none' && orText !== '.') {
            return orText;
          }
        }
      } catch (orErr) {
        console.warn('[OpenRouter Audio Transcribe Note]', orErr);
      }
    }
  } catch (err) {
    console.warn('[directTranscribeAudioBlob error]', err);
  }

  return '';
}
