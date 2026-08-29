/**
 * onDevice.ts — On-device processing layer
 *
 * Runs BEFORE any cloud call.
 * 1. transcribeAudio() — Web Speech API live transcription with language locale support (en-IN, hi-IN, kn-IN, ta-IN)
 * 2. tagTheme() — lightweight keyword-based theme classifier supporting English, Hindi, Kannada, and Tamil
 *
 * Handles mixed-language speech gracefully without blocking.
 */

import { Theme, Language, SUPPORTED_LANGUAGES } from '../types';

/* ─── Multilingual Theme Keywords (English, Hindi, Kannada, Tamil) ─── */

const MULTILINGUAL_THEME_KEYWORDS: Record<Theme, string[]> = {
  Childhood: [
    // English
    'child', 'kid', 'young', 'school', 'playground', 'neighborhood', 'grew up', 'little', 'boy', 'girl', 'toys', 'bicycle', 'summer', 'holiday', 'mischief',
    // Hindi
    'बचपन', 'बच्चे', 'स्कूल', 'मोहल्ला', 'खेल', 'शरारत', 'गली', 'छोटा', 'छोटी', 'खिलौना', 'हवेली', 'नीम', 'दीवाली', 'पतंग',
    // Kannada
    'ಬಾಲ್ಯ', 'ಮಕ್ಕಳು', 'ಶಾಲೆ', 'ಆಟ', 'ಗೆಳೆಯರು', 'ಊರು', 'ಮನೆ', 'ಬಾಲಕ', 'ಬಾಲಕಿ', 'ಆಟಿಕೆ', 'ಹಿತ್ತಲು', 'ದಸರಾ',
    // Tamil
    'குழந்தை', 'சிறுவன்', 'சிறுமி', 'பள்ளி', 'விளையாட்டு', 'தெரு', 'ஊர்', 'பால்யம்', 'நண்பர்கள்', 'விடுமுறை', 'பொம்மை',
  ],

  Career: [
    // English
    'job', 'work', 'career', 'office', 'factory', 'boss', 'paycheck', 'wages', 'hired', 'first day', 'profession', 'retire', 'company', 'salary', 'craft',
    // Hindi
    'नौकरी', 'काम', 'तनख्वाह', 'वेतन', 'कमाई', 'दुकान', 'कारखाना', 'दफ्तर', 'व्यापार', 'मेहनत', 'रोजगार', 'पेशा',
    // Kannada
    'ಕೆಲಸ', 'ಉದ್ಯೋಗ', 'ಸಂಬಳ', 'ಗಳಿಕೆ', 'ಕಾರ್ಖಾನೆ', 'ಕಚೇರಿ', 'ದುಡಿಮೆ', 'ವೃತ್ತಿ', 'ವ್ಯಾಪಾರ', 'ಮೊದಲ ದಿನ',
    // Tamil
    'வேலை', 'தொழில்', 'சம்பளம்', 'வருமானம்', 'அலுவலகம்', 'தொழிற்சாலை', 'வியாபாரம்', 'உழைப்பு', 'முதல் வேலை',
  ],

  Family: [
    // English
    'married', 'wedding', 'spouse', 'husband', 'wife', 'daughter', 'son', 'family', 'children', 'baby', 'grandchild', 'mother', 'father', 'parent', 'courtship', 'love',
    // Hindi
    'शादी', 'विवाह', 'पति', 'पत्नी', 'परिवार', 'माता', 'पिता', 'बाबूजी', 'माँ', 'बेटा', 'बेटी', 'पोता', 'पोती', 'प्यार', 'ससुराल', 'दादी', 'दादा',
    // Kannada
    'ಮದುವೆ', 'ಕುಟುಂಬ', 'ಗಂಡ', 'ಹೆಂಡತಿ', 'ತಾಯಿ', 'ತಂದೆ', 'ಅಜ್ಜ', 'ಅಜ್ಜಿ', 'ಮಕ್ಕಳು', 'ಮಗ', 'ಮಗಳು', 'ಮೊಮ್ಮಕ್ಕಳು', 'ಪ್ರೀತಿ', 'ಸಂಬಂಧ',
    // Tamil
    'திருமணம்', 'குடும்பம்', 'கணவர்', 'மனைவி', 'அம்மா', 'அப்பா', 'தாத்தா', 'பாட்டி', 'பிள்ளைகள்', 'மகன்', 'மகள்', 'பேரன்', 'பேத்தி', 'அன்பு',
  ],

  Values: [
    // English
    'lesson', 'value', 'principle', 'faith', 'believe', 'trust', 'honest', 'integrity', 'patience', 'kindness', 'forgive', 'grudge', 'pride', 'wisdom',
    // Hindi
    'संस्कार', 'सीख', 'सबक', 'मूल्य', 'धैर्य', 'सच्चाई', 'ईमानदारी', 'माफी', 'घमंड', 'विश्वास', 'सहनशीलता', 'धर्म', 'प्रेम',
    // Kannada
    'ಮೌಲ್ಯ', 'ಸಂಸ್ಕಾರ', 'ಪಾಠ', 'ತಾಳ್ಮೆ', 'ಪ್ರಾಮಾಣಿಕತೆ', 'ಕ್ಷಮೆ', 'ನಂಬಿಕೆ', 'ಧರ್ಮ', 'ಬುದ್ಧಿ', 'ಶಾಂತಿ', 'ಪ್ರೀತಿ',
    // Tamil
    'நெறி', 'பண்பு', 'ஒழுக்கம்', 'பொறுமை', 'உண்மை', 'மன்னிப்பு', 'நம்பிக்கை', 'அறம்', 'அமைதி', 'அறிவுரை',
  ],

  Recipes: [
    // English
    'recipe', 'cook', 'kitchen', 'food', 'dish', 'bake', 'ingredient', 'stove', 'garlic', 'tomato', 'sauce', 'gravy', 'meal', 'taste', 'flavor', 'spice',
    // Hindi
    'रसोई', 'व्यंजन', 'खाना', 'मिठाई', 'हलवा', 'लड्डू', 'मसाला', 'स्वाद', 'पकाना', 'घी', 'सब्जी', 'चाय', 'पकवान',
    // Kannada
    'ಅಡುಗೆ', 'ಪಾಕವಿಧಾನ', 'ಊಟ', 'ಮೈಸೂರು ಪಾಕ್', 'ತುಪ್ಪ', 'ಸಿಹಿ', 'ಮಸಾಲೆ', 'ರುಚಿ', 'ಪಾಕ', 'ಬಾಣಲೆ', 'ಹಬ್ಬದ ಊಟ',
    // Tamil
    'சமையல்', 'உணவு', 'சுவை', 'சாப்பாடு', 'மசாலா', 'நெய்', 'இனிப்பு', 'பாயாசம்', 'குழம்பு', 'கைமணம்',
  ],

  Advice: [
    // English
    'advice', 'tell you', 'remember', 'important', 'never forget', 'journey', 'heritage', 'ancestor', 'generation', 'pass down', 'courage', 'strength',
    // Hindi
    'सलाह', 'उपदेश', 'याद रखना', 'धरोहर', 'पीढ़ी', 'हिम्मत', 'बुजुर्ग', 'मार्गदर्शन', 'कहना', 'सिखाया',
    // Kannada
    'ಸಲಹೆ', 'ಕಿವಿಮಾತು', 'ನೆನಪಿರಲಿ', 'ಪರಂಪರೆ', 'ಪೀಳಿಗೆ', 'ಧೈರ್ಯ', 'ಹಿರಿಯರು', 'ಬುದ್ಧಿವಾದ', 'ಮಾರ್ಗದರ್ಶನ',
    // Tamil
    'அறிவுரை', 'வழிகாட்டல்', 'நினைவில் கொள்', 'மரபு', 'தலைமுறை', 'தைரியம்', 'பெரியவர்கள்', 'முக்கியம்',
  ],
};

/**
 * Tag a transcript with the most relevant theme using multilingual keyword matching.
 * Works across English, Hindi, Kannada, and Tamil. Runs 100% on-device.
 */
export function tagTheme(transcript: string, _language?: Language): Theme {
  const lower = transcript.toLowerCase();
  const scores: Record<Theme, number> = {
    Childhood: 0,
    Career: 0,
    Family: 0,
    Values: 0,
    Recipes: 0,
    Advice: 0,
  };

  for (const [theme, keywords] of Object.entries(MULTILINGUAL_THEME_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw.toLowerCase())) {
        scores[theme as Theme] += 1;
      }
    }
  }

  let best: Theme = 'Family';
  let bestScore = 0;
  for (const [theme, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      best = theme as Theme;
    }
  }

  return best;
}

/**
 * Start live transcription using Web Speech API with selected language locale.
 * Locales: English (en-IN), Hindi (hi-IN), Kannada (kn-IN), Tamil (ta-IN).
 * Handles mixed-language speech gracefully without blocking.
 */
export function startLiveTranscription(
  onInterim: (text: string) => void,
  onFinal: (text: string) => void,
  onError: (error: string) => void,
  language: Language = 'en',
): { stop: () => void } {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser.');
    return { stop: () => {} };
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  // Set locale based on chosen language
  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === language);
  recognition.lang = langConfig ? langConfig.locale : 'en-IN';

  let finalTranscript = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript + ' ';
      } else {
        interim += result[0].transcript;
      }
    }
    onInterim(finalTranscript + interim);
  };

  recognition.onerror = (event: any) => {
    if (event.error === 'not-allowed') {
      onError('Microphone permission was not granted.');
    } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
      // Don't hard-crash on minor speech engine warnings for mixed languages
      console.warn('[OnDevice Speech Warning]:', event.error);
    }
  };

  recognition.onend = () => {
    onFinal(finalTranscript.trim());
  };

  try {
    recognition.start();
  } catch (e) {
    // Already active
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch (e) {}
    },
  };
}
