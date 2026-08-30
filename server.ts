import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

/* ─── OpenRouter DeepSeek Proxy for "Ask the Archive" (Multilingual Supported) ─── */
app.post('/api/ask-archive', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenRouter API key is not configured on the server.',
      });
    }

    const { question, transcriptsContext, speakerName = 'Grandmother', requestedLanguage = 'en' } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'A question is required.' });
    }

    const systemPrompt = `You are a warm, loving family historian and archivist helping relatives explore the recorded oral memoirs of ${speakerName}.

CRITICAL GROUNDING & MULTILINGUAL RULES:
1. Answer ONLY using the provided transcripts. If the answer is not present in the transcripts, say clearly that it wasn't recorded.
2. Never invent details, dates, recipes, names, or facts that aren't in the transcripts, in ANY language.
3. Respond in the same language as the transcript and the user's question. If the transcript is in Hindi (हिन्दी), Kannada (ಕನ್ನಡ), or Tamil (தமிழ்), answer in that language, not English, unless the user explicitly asks in English.
4. If the user asks in Hindi, Kannada, or Tamil, write the entire response warmly in that respective script and language.
5. Reference which specific story or memory the answer comes from.
6. Suggest a gentle follow-up question in the same language for the family to ask the elder in person.

Return your answer strictly in valid JSON format:
{
  "answer": "Warm, conversational answer based ONLY on the transcripts in the matching language",
  "groundedInStoryIds": ["id-1"],
  "isGrounded": true,
  "relevantQuote": "Exact or near-exact quote in the original language",
  "suggestedFollowUp": "Gentle question in the matching language"
}`;

    const userMessage = `Current Language Context: ${requestedLanguage}\nTranscripts of ${speakerName}:\n${transcriptsContext || 'No transcripts provided.'}\n\nFamily Member's Question: "${question}"\n\nProvide the JSON response following the grounding and language rules.`;

    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Inheritance Family Archive',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!openRouterResponse.ok) {
      const errText = await openRouterResponse.text();
      console.error('[OpenRouter Error]', openRouterResponse.status);
      return res.status(openRouterResponse.status).json({
        error: `OpenRouter API returned error ${openRouterResponse.status}`,
        details: errText,
      });
    }

    const completion = await openRouterResponse.json() as any;
    const content = completion.choices?.[0]?.message?.content || '';

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        parsed = JSON.parse(match[1]);
      } else {
        parsed = {
          answer: content,
          groundedInStoryIds: [],
          isGrounded: true,
        };
      }
    }

    return res.json(parsed);
  } catch (error: any) {
    console.error('[Ask Archive Error]', error?.message || 'Unknown error');
    return res.status(500).json({ error: 'Failed to process question via AI proxy.' });
  }
});

/* ─── Gemini 3.5 Flash Memorial Narrative Generator ─── */
app.post('/api/memorial-narrative', async (req, res) => {
  try {
    const { personName, relationship, memories, language, audioBase64, audioMimeType } = req.body;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!memories || !memories.trim()) {
      return res.status(400).json({ error: 'Memories text is required.' });
    }

    const langName = language === 'hi' ? 'Hindi (हिन्दी)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ta' ? 'Tamil (தமிழ்)' : 'English';
    const langCodeInstruction = language === 'kn'
      ? 'Write the monologue strictly in native Kannada (ಕನ್ನಡ) script with authentic Karnataka idioms, warmth, and respectful elder tone (e.g. "ನನ್ನ ಪ್ರೀತಿಯ ಕುಟುಂಬವೇ", "ಸದಾ ನೆನಪಿಡಿ").'
      : language === 'hi'
      ? 'Write the monologue strictly in native Hindi (हिन्दी) Devanagari script with warm elder tone (e.g. "मेरे प्यारे परिवार", "हमेशा याद रखना").'
      : language === 'ta'
      ? 'Write the monologue strictly in native Tamil (தமிழ்) script with warm Tamil familial tone (e.g. "என் அன்பு குடும்பமே").'
      : 'Write the monologue in heartfelt, natural conversational English.';

    const promptInstructions = `You are a compassionate, literary legacy biographer for the Inheritance family preservation app.
Your task is to take user memories about a loved one (${personName || 'Loved One'}, ${relationship || 'Family Member'}) and write a warm, heartfelt, authentic first-person storytelling monologue in ${langName}.
${langCodeInstruction}
The monologue should sound like an elder speaking calmly, slowly, and warmly directly from the heart, reflecting on their life, wisdom, warmth, and love for their family. Use gentle pauses, commas, and short emotional sentences so the delivery is slow, intimate, and never rushed.

Return ONLY a valid JSON object matching this schema:
{
  "monologue": "The heartfelt first-person spoken narrative written in native ${langName} script (approx 100-200 words)...",
  "phoneticSpeech": "The exact same monologue written in natural phonetic Latin transliteration so that ElevenLabs neural voice cloning replicates their exact voice pitch, accent, and cadence flawlessly (e.g. for Kannada: 'Nanna preethiya kutumbave, nanu Ramesh. Neenu nanna nenapugalanu...', for Hindi: 'Mere pyaare parivaar, main hamesha...', for Tamil: 'En anbu kudumbame, naan...')",
  "pullQuote": "One memorable, touching quote from the story in ${langName}...",
  "theme": "Family" | "Childhood" | "Career" | "Values" | "Recipes" | "Advice",
  "title": "A warm title for this memory in ${langName}..."
}`;

    if (geminiKey) {
      const parts: any[] = [];
      if (audioBase64 && audioMimeType) {
        parts.push({
          inlineData: {
            mimeType: audioMimeType,
            data: audioBase64,
          },
        });
        parts.push({
          text: `${promptInstructions}\n\nListen to the audio recording to capture their voice cadence and emotion. Here are the user's memories about them:\n"${memories}"`,
        });
      } else {
        parts.push({
          text: `${promptInstructions}\n\nHere are the user's memories and notes about them:\n"${memories}"`,
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          try {
            return res.json(JSON.parse(rawText));
          } catch {
            const match = rawText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) return res.json(JSON.parse(match[1]));
          }
        }
      }
    }

    // Fallback via OpenRouter DeepSeek v4 Pro
    const fallbackResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-v4-pro',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: promptInstructions },
          { role: 'user', content: `Memories: "${memories}"` },
        ],
      }),
    });

    if (fallbackResponse.ok) {
      const fbData = await fallbackResponse.json();
      const fbContent = fbData.choices?.[0]?.message?.content;
      if (fbContent) return res.json(JSON.parse(fbContent));
    }

    return res.status(500).json({ error: 'Could not generate memorial narrative.' });
  } catch (err: any) {
    console.error('[Memorial Narrative Error]', err);
    return res.status(500).json({ error: 'Server error generating narrative.' });
  }
});

/* ─── PCM to WAV Converter ─── */
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1, bitDepth = 16): Buffer {
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcmBuffer.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * (bitDepth / 8), 28);
  header.writeUInt16LE(numChannels * (bitDepth / 8), 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcmBuffer.length, 40);
  return Buffer.concat([header, pcmBuffer]);
}

/* ─── Neural Voice Clone & Speech Synthesis (ElevenLabs Instant Voice Cloning + Multilingual v2) ─── */
app.post('/api/clone-voice-hf', async (req, res) => {
  try {
    const { text, language, voiceName = 'Charon', referenceAudioBase64, referenceAudioMimeType, personName } = req.body;
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required for voice synthesis.' });
    }

    // 1. Primary: ElevenLabs Voice Synthesis / Instant Voice Cloning
    if (elevenLabsKey) {
      try {
        let voiceId: string | null = null;
        let isCustomClone = false;

        // A) If reference audio of the deceased/elderly relative was uploaded, clone their exact voice!
        if (referenceAudioBase64) {
          try {
            const rawAudioBuf = Buffer.from(referenceAudioBase64, 'base64');
            const form = new FormData();
            const ext = referenceAudioMimeType?.includes('wav') ? 'wav' : referenceAudioMimeType?.includes('mp3') ? 'mp3' : 'webm';
            const audioBlob = new Blob([rawAudioBuf], { type: referenceAudioMimeType || 'audio/webm' });
            
            form.append('name', `${personName || 'Family Elder'} (${Date.now().toString().slice(-4)})`);
            form.append('description', 'Instant cloned voice for Inheritance living family archive');
            form.append('files', audioBlob, `sample.${ext}`);

            const cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
              method: 'POST',
              headers: {
                'xi-api-key': elevenLabsKey,
              },
              body: form,
            });

            if (cloneRes.ok) {
              const cloneData = await cloneRes.json();
              if (cloneData.voice_id) {
                voiceId = cloneData.voice_id;
                isCustomClone = true;
                console.log(`[ElevenLabs] Successfully created instant clone voice: ${voiceId}`);
              }
            } else {
              console.warn('[ElevenLabs Voice Add Error]', await cloneRes.text());
            }
          } catch (cloneErr) {
            console.warn('[Voice Cloning Error]', cloneErr);
          }
        }

        // B) If no reference audio or clone failed, use curated elder persona
        if (!voiceId) {
          const elevenVoiceMap: Record<string, string> = {
            Charon: 'JBFqnCBsd6RMkjVDRZzb', // George (Grandfather / Wise Storyteller)
            Kore: 'XB0fDUnXU5powFXDhCwa',   // Charlotte (Grandmother / Warm Matriarch)
            Puck: 'pNInz6obpgDQGcFmaJgB',   // Adam (Warm Narrator)
            Aoede: '21m00Tcm4TlvDq8ikWAM',  // Rachel (Melodic & Soothing)
          };
          voiceId = elevenVoiceMap[voiceName] || 'JBFqnCBsd6RMkjVDRZzb';
        }

        // Clean and prepare speech text for natural human cadence
        const rawSpeech = (req.body.phoneticText || text || '').slice(0, 2500);
        const speechPayloadText = rawSpeech
          .replace(/[*_#`~>[\](){}]/g, '')
          .replace(/[\u0964\u0965]/g, '.')
          .replace(/[;—–]/g, ', ')
          .replace(/["'«»“”‘’]/g, '')
          .replace(/\s+/g, ' ')
          .trim();

        const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: speechPayloadText,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.60,
              similarity_boost: 0.85,
              style: 0.0,
              use_speaker_boost: true,
            },
          }),
        });

        if (elevenRes.ok) {
          const arrayBuffer = await elevenRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return res.json({
            audioBase64: buffer.toString('base64'),
            mimeType: 'audio/mpeg',
            model: isCustomClone
              ? `ElevenLabs Instant Cloned Voice (${personName || 'Relative'})`
              : `ElevenLabs Multilingual v2 (${voiceName})`,
          });
        } else {
          const errDetail = await elevenRes.text();
          console.warn('[ElevenLabs Synthesis Error]', errDetail);
          return res.status(500).json({ error: `ElevenLabs Voice Synthesis error: ${errDetail}` });
        }
      } catch (e: any) {
        console.warn('[ElevenLabs Call Error]', e);
        return res.status(500).json({ error: `ElevenLabs error: ${e.message}` });
      }
    }

    return res.status(500).json({ error: 'ElevenLabs API key is not configured.' });
  } catch (err: any) {
    console.error('[Neural Voice Error]', err);
    return res.status(500).json({ error: 'Failed to synthesize cloned voice.' });
  }
});

/* ─── Health Check ─── */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    hasElevenLabsKey: Boolean(process.env.ELEVENLABS_API_KEY),
    hasHuggingFaceKey: Boolean(process.env.HUGGINGFACE_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

/* ─── Vite Middleware ─── */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Inheritance server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
