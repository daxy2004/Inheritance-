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

/* ─── 1. Direct Google Gemini / OpenRouter Grounded Archive Q&A ─── */
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

  // Try OpenRouter DeepSeek first
  if (OPENROUTER_KEY) {
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
          model: 'deepseek/deepseek-v4-pro',
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
      console.warn('[OpenRouter Direct Note]', e);
    }
  }

  // Fallback to Google Gemini
  if (GEMINI_KEY) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) return JSON.parse(rawText);
      }
    } catch (e) {
      console.warn('[Gemini Direct Note]', e);
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
    try {
      const parts: any[] = [];
      if (audioBase64 && audioMimeType) {
        parts.push({ inlineData: { mimeType: audioMimeType, data: audioBase64 } });
        parts.push({ text: `${promptInstructions}\n\nListen to their audio recording to match vocal cadence. User memories:\n"${memories}"` });
      } else {
        parts.push({ text: `${promptInstructions}\n\nUser memories:\n"${memories}"` });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;
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
      console.warn('[Direct Gemini Narrative Error]', e);
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
): Promise<{ blob: Blob; url: string; model: string }> {
  if (!ELEVENLABS_KEY) {
    throw new Error('ElevenLabs API Key not configured');
  }

  let targetVoiceId = ELEVENLABS_VOICE_MAP[voiceName] || ELEVENLABS_VOICE_MAP.Charon;
  let isCustomCloned = false;

  // 1. If user uploaded a voice recording file, create an Instant Voice Clone on ElevenLabs!
  if (audioFile) {
    try {
      const formData = new FormData();
      formData.append('name', `${personName} (${Date.now().toString().slice(-4)})`);
      formData.append('description', 'Instant Voice Clone for Inheritance Family Archive');
      formData.append('files', audioFile, audioFile.name || 'voice-sample.webm');

      const cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_KEY,
        },
        body: formData,
      });

      if (cloneRes.ok) {
        const cloneData = await cloneRes.json();
        if (cloneData.voice_id) {
          targetVoiceId = cloneData.voice_id;
          isCustomCloned = true;
          console.log(`[ElevenLabs] Instant Voice Clone created: ${targetVoiceId}`);
        }
      }
    } catch (e) {
      console.warn('[ElevenLabs Clone Add Note]', e);
    }
  }

  // 2. Synthesize audio with ElevenLabs Multilingual v2
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
        stability: 0.55,
        similarity_boost: 0.85,
        style: 0.35,
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

  return {
    blob: audioBlob,
    url: audioUrl,
    model: isCustomCloned ? 'ElevenLabs Instant Voice Clone (Custom Model)' : 'ElevenLabs Multilingual v2',
  };
}
