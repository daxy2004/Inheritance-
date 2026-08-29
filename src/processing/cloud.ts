/**
 * cloud.ts — External AI Call Handler (Strictly for "Ask the Archive" only)
 *
 * Calls the server-side proxy at /api/ask-archive interfacing with OpenRouter deepseek/deepseek-v4-pro.
 * Detects context language and instructs the model to respond in English, Hindi (हिन्दी),
 * Kannada (ಕನ್ನಡ), or Tamil (தமிழ்).
 */

import { StoryEntry, QAMessage, MemoirBook, Theme, THEME_LABELS, Language } from '../types';
import { computeQACacheKey, getCachedQAResponse, setCachedQAResponse } from '../storage/db';
import { TRANSLATIONS } from '../i18n/translations';

/* ─── Build transcript context with language annotations ─── */
function buildTranscriptsContext(entries: StoryEntry[]): string {
  return entries
    .map(
      (e, i) =>
        `[Story ${i + 1}] ID: ${e.id} | Title: "${e.title}" | Theme: ${e.theme} | Approx Year: ${e.approxYear} | Language: ${e.language || 'en'} | Type: ${e.type}\nPrompt: "${e.prompt}"\nTranscript:\n${e.transcript}\n`,
    )
    .join('\n---\n');
}

/* ─── Ask the Archive (OpenRouter DeepSeek via Server Proxy + Local Cache) ─── */

export async function askArchive(
  question: string,
  entries: StoryEntry[],
  speakerName: string,
  language: Language = 'en',
): Promise<QAMessage> {
  const contextIds = entries.map((e) => e.id);
  const cacheKey = `${computeQACacheKey(question, contextIds)}_lang:${language}`;

  const baseMessage: QAMessage = {
    id: `qa-${Date.now()}`,
    role: 'assistant',
    text: '',
    groundedInIds: [],
    timestamp: new Date().toISOString(),
    language,
  };

  // 1. Check local IndexedDB cache first (works 100% offline with zero network dependency)
  try {
    const cached = await getCachedQAResponse(cacheKey);
    if (cached) {
      return {
        ...baseMessage,
        text: cached.answer,
        groundedInIds: cached.groundedInStoryIds || [],
        relevantQuote: cached.relevantQuote,
        suggestedFollowUp: cached.suggestedFollowUp,
      };
    }
  } catch (err) {
    console.warn('[Cloud/Storage] Cache lookup note:', err);
  }

  // 2. Call server-side OpenRouter DeepSeek proxy
  const transcriptsContext = buildTranscriptsContext(entries);

  try {
    const res = await fetch('/api/ask-archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        transcriptsContext,
        speakerName,
        requestedLanguage: language,
      }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      const answerPayload = {
        answer: data.answer || 'Thank you for asking.',
        groundedInStoryIds: Array.isArray(data.groundedInStoryIds) ? data.groundedInStoryIds : [],
        isGrounded: Boolean(data.isGrounded),
        relevantQuote: data.relevantQuote,
        suggestedFollowUp: data.suggestedFollowUp,
      };

      // 3. Cache response locally in IndexedDB
      setCachedQAResponse(
        cacheKey,
        question,
        contextIds.join(','),
        answerPayload,
      ).catch(() => {});

      return {
        ...baseMessage,
        text: answerPayload.answer,
        groundedInIds: answerPayload.groundedInStoryIds,
        relevantQuote: answerPayload.relevantQuote,
        suggestedFollowUp: answerPayload.suggestedFollowUp,
      };
    }
  } catch (err) {
    console.warn('[Cloud] OpenRouter proxy call offline/failed, using local fallback:', err);
  }

  // 4. Multilingual Local Grounded Extraction Fallback
  const qLower = question.toLowerCase();
  const matched = entries.find(
    (e) =>
      e.transcript.toLowerCase().includes(qLower) ||
      e.title.toLowerCase().includes(qLower) ||
      e.prompt.toLowerCase().includes(qLower),
  );

  if (matched) {
    return {
      ...baseMessage,
      text: `${matched.transcript.slice(0, 300)}...`,
      groundedInIds: [matched.id],
      relevantQuote: matched.pullQuote,
      suggestedFollowUp: language === 'hi'
        ? `दादी से पूछें: "क्या आप ${matched.title} के बारे में और बता सकती हैं?"`
        : language === 'kn'
        ? `ಅಜ್ಜಿಯನ್ನು ಕೇಳಿ: "${matched.title} ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ಹೇಳುವಿರಾ?"`
        : language === 'ta'
        ? `பாட்டியிடம் கேளுங்கள்: "${matched.title} பற்றி மேலும் கூறுங்கள்?"`
        : `Ask ${speakerName}: "Can you tell me more about ${matched.title.toLowerCase()}?"`,
    };
  }

  const unrecordedMsg: Record<Language, string> = {
    en: `${speakerName} hasn't shared a story about that yet. You could ask her during your next family visit!`,
    hi: `${speakerName} ने इस बारे में अभी कोई संस्मरण रिकॉर्ड नहीं किया है। अगली बार मिलने पर उनसे ज़रूर पूछिएगा!`,
    kn: `${speakerName} ಅವರು ಈ ಬಗ್ಗೆ ಇನ್ನೂ ಯಾವುದೇ ಕಥೆಯನ್ನು ಹೇಳಿಲ್ಲ. ಮುಂದಿನ ಬಾರಿ ಭೇಟಿಯಾದಾಗ ಅವರನ್ನು ಕೇಳಿ!`,
    ta: `${speakerName} இது குறித்து இன்னும் கதை எதுவும் பகிரவில்லை. அடுத்த முறை சந்திக்கும் போது அவரிடம் கேளுங்கள்!`,
  };

  return {
    ...baseMessage,
    text: unrecordedMsg[language] || unrecordedMsg.en,
    groundedInIds: [],
  };
}

/* ─── Local Heirloom Memoir Book Generator (Zero network required) ─── */

export function generateMemoir(
  entries: StoryEntry[],
  speakerName: string,
  language: Language = 'en',
): MemoirBook {
  const themes: Theme[] = ['Childhood', 'Career', 'Family', 'Values', 'Recipes', 'Advice'];
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return {
    title: `${speakerName} — ${t.appName} ${t.memoir.title}`,
    preface: language === 'hi'
      ? `यह संस्मरण संग्रह ${speakerName} की वास्तविक आवाज़, वीडियो और संस्मरणों की जीवंत धरोहर है। प्रत्येक अध्याय परिवार की आने वाली पीढ़ियों के लिए प्रेमपूर्वक सुरक्षित किया गया है।`
      : language === 'kn'
      ? `ಈ ಸ್ಮರಣ ಸಂಪುಟವು ${speakerName} ಅವರ ಅಧಿಕೃತ ಧ್ವನಿ, ವೀಡಿಯೊ ಮತ್ತು ನೆನಪುಗಳ ಜೀವಂತ ಪರಂಪರೆಯಾಗಿದೆ. ಪ್ರತಿಯೊಂದು ಅಧ್ಯಾಯವನ್ನು ಮುಂದಿನ ಪೀಳಿಗೆಗಾಗಿ ಪ್ರೀತಿಯಿಂದ ಸಂರಕ್ಷಿಸಲಾಗಿದೆ.`
      : language === 'ta'
      ? `இந்த நினைவுக் களஞ்சியம் ${speakerName} அவர்களின் உண்மையான குரல் மற்றும் வீடியோ நினைவுகளின் பொக்கிஷம். ஒவ்வொரு அத்தியாயமும் எதிர்கால தலைமுறைகளுக்காக அன்புடன் பாதுகாக்கப்பட்டுள்ளது.`
      : `This keepsake gathers the authentic voice, video, and spoken memories of ${speakerName}. Every chapter reflects real moments preserved on-device and held in trust for our family's future generations.`,
    chapters: themes
      .map((theme) => {
        const themeEntries = entries.filter((e) => e.theme === theme);
        return {
          theme,
          title: t.themes[theme] || THEME_LABELS[theme],
          entries: themeEntries,
          pullQuotes: themeEntries.map((e) => e.pullQuote).filter(Boolean),
        };
      })
      .filter((ch) => ch.entries.length > 0),
    generatedAt: new Date().toISOString(),
  };
}
