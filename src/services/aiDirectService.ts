/**
 * aiDirectService.ts — Direct Client-Side AI Engine for Web & Native Mobile (APK)
 *
 * Allows the Android APK (and browser) to directly call official cloud AI APIs
 * (Google Gemini 1.5/2.0 Flash, ElevenLabs Instant Voice Cloning, OpenRouter DeepSeek)
 * whenever the device has internet, with graceful on-device fallback when offline.
 */

import { Theme, Language, StoryEntry, QAMessage } from '../types';

export const GEMINI_KEY: string = (process.env as any)?.GEMINI_API_KEY || 'AQ.Ab8RN6IsdVsmE_j3o30fPiyRDnvj5HkNQFljZrXRnwjU_iznGQ';
export const ELEVENLABS_KEY: string = (process.env as any)?.ELEVENLABS_API_KEY || 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';
export const OPENROUTER_KEY: string = (process.env as any)?.OPENROUTER_API_KEY || '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';

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
    ? 'Write the monologue strictly in native Kannada (ಕನ್ನಡ) script with authentic Karnataka idioms and warm elder tone.'
    : language === 'hi'
    ? 'Write the monologue strictly in native Hindi (हिन्दी) Devanagari script with warm elder tone.'
    : language === 'ta'
    ? 'Write the monologue strictly in native Tamil (தமிழ்) script with warm familial tone.'
    : 'Write the monologue in heartfelt, natural conversational English.';

  const promptInstructions = `You are a compassionate literary legacy biographer for the Inheritance family preservation app.
Your task is to take memories about ${personName || 'a loved one'} (${relationship || 'Family Member'}) and write a warm, heartfelt, authentic first-person storytelling monologue in ${langName}.
${langCodeInstruction}
The monologue should sound like an elder speaking calmly, slowly, and warmly from the heart about their life, wisdom, and love for family.

Return ONLY a valid JSON object matching this schema:
{
  "monologue": "First-person spoken narrative in native ${langName} script (100-200 words)...",
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

    const formData = new FormData();
    formData.append('name', `${personName.trim() || 'Family Elder'} (${Date.now().toString().slice(-4)})`);
    formData.append('description', `Instant Multilingual Voice Clone for ${personName} (${language.toUpperCase()})`);
    formData.append('labels', JSON.stringify({ language, type: 'family-archive' }));
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
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${targetVoiceId}?output_format=mp3_44100_128`;
  const ttsRes = await fetch(ttsUrl, {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.35,
        similarity_boost: 0.95,
        style: 0.40,
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

/* ─── 4. Direct Gemini 3.6 / 3.5 Flash Audio Transcription ─── */
export async function directTranscribeAudioBlob(
  audioBlob: Blob,
  language: Language = 'en',
): Promise<string> {
  if (!audioBlob || audioBlob.size === 0) return '';
  const langName = language === 'hi' ? 'Hindi (हिन्दी)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English';

  if (!GEMINI_KEY) {
    console.warn('[directTranscribeAudioBlob] GEMINI_KEY not found');
    return '';
  }

  try {
    const base64Data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const parts = dataUrl.split(',');
        resolve(parts[1] || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

    if (!base64Data) return '';

    const mime = audioBlob.type || (audioBlob.type.includes('wav') ? 'audio/wav' : 'audio/webm');
    const cleanMime = mime.split(';')[0]; // e.g. audio/webm or audio/wav or video/webm

    const promptText = `You are an expert oral historian and speech-to-text transcriber. Listen carefully to this audio recording of a family member sharing a memory. Transcribe everything spoken verbatim in its authentic language (${langName}). If spoken in Hindi, Kannada, Tamil, or English, transcribe directly into that respective script. Do NOT summarize, translate, or add commentary. Return ONLY the exact transcribed speech text.`;

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
                  {
                    text: promptText,
                  },
                  {
                    inlineData: {
                      mimeType: cleanMime,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
          if (text) {
            return text;
          }
        } else {
          const errText = await res.text();
          console.warn(`[Gemini ${model} transcription warning]`, res.status, errText);
        }
      } catch (modelErr) {
        console.warn(`[Gemini ${model} error]`, modelErr);
      }
    }
  } catch (err) {
    console.warn('[directTranscribeAudioBlob error]', err);
  }

  return '';
}
