/**
 * translations.ts — Multilingual i18n dictionary
 *
 * Supports English (en), Hindi (hi), Kannada (kn), and Tamil (ta).
 */

import { Language, Theme } from '../types';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  nav: {
    record: string;
    family: string;
    ask: string;
    memoir: string;
  };
  themes: Record<Theme | 'All', string>;
  capture: {
    title: string;
    subtitle: string;
    voiceBtn: string;
    videoBtn: string;
    sparkTipPrefix: string;
    shuffle: string;
    next: string;
    listening: string;
    doneSpeaking: string;
    liveTranscriptionBadge: string;
    onDeviceComplete: string;
    autoTaggedTheme: string;
    transcriptLabel: string;
    manualTypePrompt: string;
    preferToType: string;
    rerecord: string;
    saveToArchive: string;
    savedTitle: string;
    savedMessage: string;
    recordAnother: string;
    sendToLaptop: string;
    bridgeNote: string;
    takeYourTime: string;
  };
  family: {
    archiveTitle: string;
    memoriesPreserved: string;
    recordBtn: string;
    noStoriesTitle: string;
    noStoriesDesc: string;
    recordFirstBtn: string;
    voice: string;
    video: string;
  };
  ask: {
    title: string;
    subtitle: string;
    welcomeTitle: string;
    welcomeDesc: string;
    suggestedHeading: string;
    inputPlaceholder: string;
    synthesizing: string;
    archivalSynthesis: string;
    source: string;
    playOriginalClip: string;
    askHerNext: string;
    playingOriginal: string;
    close: string;
    suggestedPrompts: string[];
  };
  memoir: {
    title: string;
    subtitle: string;
    regenerate: string;
    curating: string;
    printPdf: string;
    preface: string;
    tableOfContents: string;
    storiesCount: string;
    chapter: string;
    curatingNote: string;
    endNote: string;
  };
  drive: {
    backupBtn: string;
    modalTitle: string;
    modalDesc: string;
    startBackup: string;
    backingUp: string;
    downloadMedia: string;
    cancel: string;
    close: string;
    privacyNote: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  en: {
    appName: 'Inheritance',
    appSubtitle: 'Preserving Family Voices',
    nav: {
      record: 'Record',
      family: 'Family',
      ask: 'Ask',
      memoir: 'Memoir',
    },
    themes: {
      All: 'All',
      Childhood: 'Childhood',
      Career: 'Career',
      Family: 'Family',
      Values: 'Values',
      Recipes: 'Recipes',
      Advice: 'Advice',
    },
    capture: {
      title: 'Capture Booth',
      subtitle: "Record authentic memories, one story at a time",
      voiceBtn: 'Voice',
      videoBtn: 'Video',
      sparkTipPrefix: 'Helpful spark:',
      shuffle: 'Shuffle',
      next: 'Next',
      listening: 'Listening...',
      doneSpeaking: 'Done Speaking',
      liveTranscriptionBadge: 'Live Speech-to-Text (On-Device)',
      onDeviceComplete: 'On-Device Processing Complete',
      autoTaggedTheme: 'Auto-tagged theme:',
      transcriptLabel: 'Transcript (editable):',
      manualTypePrompt: 'Write your memory here...',
      preferToType: 'Prefer to write or type instead?',
      rerecord: 'Re-record',
      saveToArchive: 'Save to Archive',
      savedTitle: 'Memory Saved!',
      savedMessage: 'Story added to the family archive on-device.',
      recordAnother: 'Record Another Story',
      sendToLaptop: 'Send to Laptop for Deeper Processing',
      bridgeNote: 'Office Kit bridge — offline sync',
      takeYourTime: 'Take your time. Tap a button and speak whenever ready.',
    },
    family: {
      archiveTitle: "'s Living Archive",
      memoriesPreserved: 'memories preserved on-device',
      recordBtn: 'Record',
      noStoriesTitle: 'No stories yet',
      noStoriesDesc: 'Start recording to build your living family archive.',
      recordFirstBtn: 'Record First Memory',
      voice: 'Voice',
      video: 'Video',
    },
    ask: {
      title: 'Ask the Archive',
      subtitle: 'Strictly grounded in recorded family transcripts',
      welcomeTitle: 'Ask about Memories & Stories',
      welcomeDesc: 'Every answer is synthesized strictly from recorded voice and video transcripts. Never hallucinated.',
      suggestedHeading: 'Suggested Questions',
      inputPlaceholder: 'Ask a question about family memories...',
      synthesizing: 'Searching transcripts & synthesizing...',
      archivalSynthesis: 'Archival Synthesis',
      source: 'Source:',
      playOriginalClip: 'Play Original Clip',
      askHerNext: 'Ask her next:',
      playingOriginal: 'Playing Original Source:',
      close: 'Close',
      suggestedPrompts: [
        'How did Grandmother and Grandpa Arthur meet?',
        "What is the secret to Nonna's Sunday gravy?",
        'What advice does she have about marriage and grudges?',
        'What was her first job and first paycheck?',
      ],
    },
    memoir: {
      title: 'Heirloom Memoir Book',
      subtitle: 'AI-curated printed keepsake compiled from authentic transcripts',
      regenerate: 'Regenerate',
      curating: 'Curating...',
      printPdf: 'Print / Save PDF',
      preface: 'Preface & Archival Note',
      tableOfContents: 'Table of Contents',
      storiesCount: 'stories',
      chapter: 'Chapter',
      curatingNote: 'Formatting chapters, table of contents, and golden pull quotes.',
      endNote: 'Preserved with love in the Inheritance Living Family Archive',
    },
    drive: {
      backupBtn: "Back up to your family's Google Drive",
      modalTitle: 'Personal Google Drive Backup',
      modalDesc: "Saves original audio (.wav), video (.webm), and formatted Heirloom Book (.html) directly into your Google Drive.",
      startBackup: 'Save Audio & Video to Google Drive',
      backingUp: 'Uploading Media to Drive...',
      downloadMedia: 'Download Raw Audio (.wav), Video (.webm) & Memoir (.html)',
      cancel: 'Cancel',
      close: 'Close',
      privacyNote: 'Files upload directly to your personal Drive • Zero server storage',
    },
  },

  hi: {
    appName: 'विरासत (Inheritance)',
    appSubtitle: 'पारिवारिक आवाज़ों और यादों का संग्रह',
    nav: {
      record: 'रिकॉर्ड',
      family: 'परिवार',
      ask: 'पूछें',
      memoir: 'संस्मरण',
    },
    themes: {
      All: 'सभी',
      Childhood: 'बचपन',
      Career: 'करियर व काम',
      Family: 'परिवार',
      Values: 'संस्कार व मूल्य',
      Recipes: 'रसोई व व्यंजन',
      Advice: 'सलाह व सीख',
    },
    capture: {
      title: 'स्मृति रिकॉर्डर (Capture Booth)',
      subtitle: 'बुजुर्गों की अनमोल यादें और किस्से सहजता से रिकॉर्ड करें',
      voiceBtn: 'ऑडियो',
      videoBtn: 'वीडियो',
      sparkTipPrefix: 'याद दिलाने के लिए सुझाव:',
      shuffle: 'बदलें (Shuffle)',
      next: 'अगला प्रश्न',
      listening: 'सुन रहे हैं...',
      doneSpeaking: 'रिकॉर्डिंग समाप्त करें',
      liveTranscriptionBadge: 'ऑन-डिवाइस लाइव ट्रांसक्रिप्शन',
      onDeviceComplete: 'डिवाइस पर प्रोसेसिंग पूर्ण',
      autoTaggedTheme: 'पहचाना गया विषय:',
      transcriptLabel: 'लिखित प्रतिलिपि (संपादित करें):',
      manualTypePrompt: 'अपनी याद यहाँ लिखें...',
      preferToType: 'क्या आप बोलकर नहीं, लिखकर दर्ज करना चाहते हैं?',
      rerecord: 'पुनः रिकॉर्ड करें',
      saveToArchive: 'पारिवारिक धरोहर में सहेजें',
      savedTitle: 'याद सुरक्षित हो गई!',
      savedMessage: 'कहानी बिना इंटरनेट सीधे डिवाइस पर सहेज ली गई है।',
      recordAnother: 'एक और कहानी रिकॉर्ड करें',
      sendToLaptop: 'गहन संपादन हेतु लैपटॉप पर भेजें',
      bridgeNote: 'ऑफिस किट ब्रिज — सुरक्षित ऑफलाइन सिंक',
      takeYourTime: 'आराम से सोचें। जब भी तैयार हों, बटन दबाकर बोलें।',
    },
    family: {
      archiveTitle: 'की जीवित धरोहर',
      memoriesPreserved: 'यादें डिवाइस पर सुरक्षित',
      recordBtn: 'नया जोड़ें',
      noStoriesTitle: 'अभी कोई कहानी नहीं है',
      noStoriesDesc: 'पारिवारिक इतिहास सहेजने के लिए पहली रिकॉर्डिंग शुरू करें।',
      recordFirstBtn: 'पहली याद रिकॉर्ड करें',
      voice: 'ऑडियो',
      video: 'वीडियो',
    },
    ask: {
      title: 'धरोहर से पूछें (Ask Archive)',
      subtitle: 'केवल रिकॉर्ड किए गए वास्तविक संस्मरणों पर आधारित उत्तर',
      welcomeTitle: 'पारिवारिक संस्मरणों से प्रश्न पूछें',
      welcomeDesc: 'हर उत्तर केवल रिकॉर्ड किए गए ऑडियो और वीडियो से दिया जाता है। कोई मनगढ़ंत बात नहीं।',
      suggestedHeading: 'सुझाए गए प्रश्न',
      inputPlaceholder: 'पारिवारिक यादों के बारे में कुछ भी पूछें...',
      synthesizing: 'संस्मरणों में खोज रहे हैं...',
      archivalSynthesis: 'धरोहर से प्राप्त उत्तर',
      source: 'स्रोत:',
      playOriginalClip: 'मूल रिकॉर्डिंग सुनें',
      askHerNext: 'अगली बार उनसे यह पूछें:',
      playingOriginal: 'मूल स्रोत चल रहा है:',
      close: 'बंद करें',
      suggestedPrompts: [
        'दादी और दादाजी पहली बार कैसे मिले थे?',
        'खानदानी रसोई की खास रेसिपी का क्या राज़ है?',
        'शादी और जीवन के बारे में उनकी क्या सलाह है?',
        'उनकी पहली नौकरी और पहली तनख्वाह की क्या कहानी है?',
      ],
    },
    memoir: {
      title: 'पारिवारिक संस्मरण पुस्तक',
      subtitle: 'वास्तविक रिकॉर्डिंग्स से संकलित सुंदर मुद्रण योग्य पुस्तक',
      regenerate: 'पुनः संकलित करें',
      curating: 'संकलन जारी...',
      printPdf: 'प्रिंट / PDF सहेजें',
      preface: 'प्रस्तावना एवं संग्रह परिचय',
      tableOfContents: 'विषय सूची (अनुक्रमणिका)',
      storiesCount: 'कहानियाँ',
      chapter: 'अध्याय',
      curatingNote: 'अध्यायों, उद्धरणों और विषय सूची का निर्माण हो रहा है।',
      endNote: 'Inheritance पारिवारिक धरोहर में प्रेमपूर्वक सुरक्षित',
    },
    drive: {
      backupBtn: 'अपने परिवार के गूगल ड्राइव पर बैकअप लें',
      modalTitle: 'व्यक्तिगत गूगल ड्राइव बैकअप',
      modalDesc: 'मूल ऑडियो (.wav), वीडियो (.webm) और पुस्तक (.html) सीधे आपके गूगल ड्राइव में सुरक्षित करता है।',
      startBackup: 'गूगल ड्राइव में सुरक्षित करें',
      backingUp: 'ड्राइव पर अपलोड हो रहा है...',
      downloadMedia: 'ऑडियो (.wav), वीडियो (.webm) व पुस्तक डाउनलोड करें',
      cancel: 'रद्द करें',
      close: 'बंद करें',
      privacyNote: 'फाइलें सीधे आपके निजी ड्राइव में जाती हैं • हमारा कोई सर्वर एक्सेस नहीं',
    },
  },

  kn: {
    appName: 'ಪರಂಪರೆ (Inheritance)',
    appSubtitle: 'ಕುಟುಂಬದ ದನಿ ಮತ್ತು ನೆನಪುಗಳ ಸಂಗ್ರಹ',
    nav: {
      record: 'ರೆಕಾರ್ಡ್',
      family: 'ಕುಟುಂಬ',
      ask: 'ಕೇಳಿ',
      memoir: 'ನೆನಪುಗಳು',
    },
    themes: {
      All: 'ಎಲ್ಲವೂ',
      Childhood: 'ಬಾಲ್ಯದ ದಿನಗಳು',
      Career: 'ಉದ್ಯೋಗ & ಕೆಲಸ',
      Family: 'ಕುಟುಂಬ',
      Values: 'ಜೀವನ ಮೌಲ್ಯಗಳು',
      Recipes: 'ಅಡುಗೆ & ರುಚಿ',
      Advice: 'ಕಿವಿಮಾತು & ಅನುಭವ',
    },
    capture: {
      title: 'ನೆನಪಿನ ಧ್ವನಿಮುದ್ರಣ (Capture Booth)',
      subtitle: 'ಹಿರಿಯರ ಅಮೂಲ್ಯ ಅನುಭವ ಹಾಗೂ ನೆನಪುಗಳನ್ನು ಸುಲಭವಾಗಿ ಮುದ್ರಿಸಿಕೊಳ್ಳಿ',
      voiceBtn: 'ಧ್ವನಿ (Audio)',
      videoBtn: 'ವೀಡಿಯೊ (Video)',
      sparkTipPrefix: 'ನೆನಪಿಗೆ ಸುಳಿವು:',
      shuffle: 'ಬೇರೆ ಪ್ರಶ್ನೆ (Shuffle)',
      next: 'ಮುಂದಿನ ಪ್ರಶ್ನೆ',
      listening: 'ಆಲಿಸುತ್ತಿದೆ...',
      doneSpeaking: 'ರೆಕಾರ್ಡಿಂಗ್ ಮುಕ್ತಾಯ',
      liveTranscriptionBadge: 'ಲೈವ್ ಸ್ಪೀಚ್-ಟು-ಟೆಕ್ಸ್ಟ್ (ಆನ್-ಡಿವೈಸ್)',
      onDeviceComplete: 'ಡಿವೈಸ್‌ನಲ್ಲಿ ಪ್ರಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
      autoTaggedTheme: 'ಗುರುತಿಸಿದ ವಿಷಯ:',
      transcriptLabel: 'ಲಿಖಿತ ರೂಪ (ಬದಲಾಯಿಸಬಹುದು):',
      manualTypePrompt: 'ನಿಮ್ಮ ನೆನಪನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...',
      preferToType: 'ಟೈಪ್ ಮಾಡಲು ಬಯಸುವಿರಾ?',
      rerecord: 'ಮತ್ತೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
      saveToArchive: 'ಸಂಗ್ರಹಕ್ಕೆ ಸೇರಿಸಿ',
      savedTitle: 'ನೆನಪು ಸುರಕ್ಷಿತವಾಗಿದೆ!',
      savedMessage: 'ಕಥೆಯನ್ನು ಡಿವೈಸ್‌ನಲ್ಲಿ ಯಾವುದೇ ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ.',
      recordAnother: 'ಮತ್ತೊಂದು ಕಥೆ ರೆಕಾರ್ಡ್ ಮಾಡಿ',
      sendToLaptop: 'ಲ್ಯಾಪ್ಟಾಪ್‌ಗೆ ಕಳುಹಿಸಿ',
      bridgeNote: 'ಆಫೀಸ್ ಕಿಟ್ ಬ್ರಿಡ್ಜ್ — ಆಫ್‌ಲೈನ್ ಸಿಂಕ್',
      takeYourTime: 'ನಿಧಾನವಾಗಿ ಮಾತನಾಡಿ. ಸಿದ್ಧವಾದಾಗ ಬಟನ್ ಒತ್ತಿ ಪ್ರಾರಂಭಿಸಿ.',
    },
    family: {
      archiveTitle: 'ಅವರ ಅಮೂಲ್ಯ ನೆನಪುಗಳು',
      memoriesPreserved: 'ನೆನಪುಗಳು ಡಿವೈಸ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿವೆ',
      recordBtn: 'ಹೊಸ ನೆನಪು',
      noStoriesTitle: 'ಇನ್ನೂ ಯಾವುದೇ ಕಥೆಗಳಿಲ್ಲ',
      noStoriesDesc: 'ಕುಟುಂಬದ ಪರಂಪರೆಯನ್ನು ಉಳಿಸಲು ಮೊದಲ ರೆಕಾರ್ಡಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ.',
      recordFirstBtn: 'ಮೊದಲ ನೆನಪನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ',
      voice: 'ಧ್ವನಿ',
      video: 'ವೀಡಿಯೊ',
    },
    ask: {
      title: 'ಆರ್ಕೈವ್‌ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ (Ask Archive)',
      subtitle: 'ದಾಖಲಾದ ಅಧಿಕೃತ ಕಥೆಗಳ ಆಧಾರದ ಮೇಲಷ್ಟೇ ಉತ್ತರ',
      welcomeTitle: 'ಕುಟುಂಬದ ಇತಿಹಾಸದ ಬಗ್ಗೆ ಕೇಳಿ',
      welcomeDesc: 'ಪ್ರತಿಯೊಂದು ಉತ್ತರವನ್ನು ಕೇವಲ ಧ್ವನಿ ಮತ್ತು ವೀಡಿಯೊ ಪ್ರತಿಲಿಪಿಗಳಿಂದ ಮಾತ್ರ ನೀಡಲಾಗುತ್ತದೆ.',
      suggestedHeading: 'ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗಳು',
      inputPlaceholder: 'ಅಜ್ಜಿಯ ನೆನಪುಗಳ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...',
      synthesizing: 'ಪ್ರತಿಲಿಪಿಗಳಲ್ಲಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
      archivalSynthesis: 'ಸಂಗ್ರಹದಿಂದ ದೊರೆತ ಉತ್ತರ',
      source: 'ಮೂಲ:',
      playOriginalClip: 'ಮೂಲ ಧ್ವನಿ/ವೀಡಿಯೊ ಕೇಳಿ',
      askHerNext: 'ಮುಂದೆ ಅವರನ್ನು ಹೀಗೆ ಕೇಳಿ:',
      playingOriginal: 'ಮೂಲ ರೆಕಾರ್ಡಿಂಗ್ ಚಾಲನೆಯಲ್ಲಿದೆ:',
      close: 'ಮುಚ್ಚಿ',
      suggestedPrompts: [
        'ಅಜ್ಜ ಮತ್ತು ಅಜ್ಜಿ ಮೊದಲ ಬಾರಿಗೆ ಹೇಗೆ ಭೇಟಿಯಾದರು?',
        'ಮನೆಯ ವಿಶೇಷ ಅಡುಗೆ ರೆಸಿಪಿಯ ರಹಸ್ಯವೇನು?',
        'ಮದುವೆ ಮತ್ತು ಜೀವನದ ಬಗ್ಗೆ ಅವರ ಸಲಹೆ ಏನು?',
        'ಅವರ ಮೊದಲ ಕೆಲಸ ಮತ್ತು ಮೊದಲ ಸಂಬಳದ ಕಥೆ ಏನು?',
      ],
    },
    memoir: {
      title: 'ಪರಂಪರೆ ಸ್ಮರಣ ಪುಸ್ತಕ',
      subtitle: 'ನಿಜವಾದ ಕಥೆಗಳಿಂದ ರಚಿಸಲಾದ ಸುಂದರ ಮುದ್ರಣ ಪುಸ್ತಕ',
      regenerate: 'ಮತ್ತೆ ರಚಿಸಿ',
      curating: 'ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',
      printPdf: 'ಪ್ರಿಂಟ್ / PDF ಉಳಿಸಿ',
      preface: 'ಮುನ್ನುಡಿ ಮತ್ತು ವಿವರಣೆ',
      tableOfContents: 'ಪರಿವಿಡಿ',
      storiesCount: 'ಕಥೆಗಳು',
      chapter: 'ಅಧ್ಯಾಯ',
      curatingNote: 'ಅಧ್ಯಾಯಗಳು ಮತ್ತು ಪ್ರಮುಖ ಉಲ್ಲೇಖಗಳನ್ನು ರಚಿಸಲಾಗುತ್ತಿದೆ.',
      endNote: 'Inheritance ಕುಟುಂಬ ಪರಂಪರೆಯಲ್ಲಿ ಪ್ರೀತಿಯಿಂದ ಸಂರಕ್ಷಿಸಲಾಗಿದೆ',
    },
    drive: {
      backupBtn: 'ಕುಟುಂಬದ ಗೂಗಲ್ ಡ್ರೈವ್‌ಗೆ ಬ್ಯಾಕಪ್ ಮಾಡಿ',
      modalTitle: 'ವೈಯಕ್ತಿಕ ಗೂಗಲ್ ಡ್ರೈವ್ ಬ್ಯಾಕಪ್',
      modalDesc: 'ಆಡಿಯೋ (.wav), ವೀಡಿಯೋ (.webm) ಮತ್ತು ಸ್ಮರಣ ಪುಸ್ತಕವನ್ನು (.html) ನೇರವಾಗಿ ನಿಮ್ಮ ಗೂಗಲ್ ಡ್ರೈವ್‌ಗೆ ಉಳಿಸುತ್ತದೆ.',
      startBackup: 'ಗೂಗಲ್ ಡ್ರೈವ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ',
      backingUp: 'ಡ್ರೈವ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      downloadMedia: 'ಆಡಿಯೋ, ವೀಡಿಯೋ ಮತ್ತು ಪುಸ್ತಕವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      close: 'ಮುಚ್ಚಿ',
      privacyNote: 'ಫೈಲ್‌ಗಳು ನೇರವಾಗಿ ನಿಮ್ಮ ಖಾಸಗಿ ಡ್ರೈವ್‌ಗೆ ಸೇರುತ್ತವೆ • ಯಾವುದೇ ಸರ್ವರ್ ಸಂಗ್ರಹವಿಲ್ಲ',
    },
  },

  ta: {
    appName: 'மரபுரிமை (Inheritance)',
    appSubtitle: 'குடும்பக் குரல்கள் மற்றும் நினைவுகளின் பெட்டகம்',
    nav: {
      record: 'பதிவு',
      family: 'குடும்பம்',
      ask: 'கேளுங்கள்',
      memoir: 'நினைவுகள்',
    },
    themes: {
      All: 'அனைத்தும்',
      Childhood: 'குழந்தைப் பருவம்',
      Career: 'தொழில் & வேலை',
      Family: 'குடும்பம்',
      Values: 'வாழ்க்கை நெறிகள்',
      Recipes: 'பாரம்பரிய சமையல்',
      Advice: 'அறிவுரை & அனுபவம்',
    },
    capture: {
      title: 'நினைவுப் பதிவுக்கூடம் (Capture Booth)',
      subtitle: 'பெரியவர்களின் குரல் மற்றும் வீடியோ நினைவுகளைப் பதிவு செய்யுங்கள்',
      voiceBtn: 'குரல் (Audio)',
      videoBtn: 'வீடியோ (Video)',
      sparkTipPrefix: 'நினைவூட்டும் குறிப்பு:',
      shuffle: 'மாற்று (Shuffle)',
      next: 'அடுத்த கேள்வி',
      listening: 'கேட்கிறது...',
      doneSpeaking: 'பதிவை முடிக்கவும்',
      liveTranscriptionBadge: 'நேரடி உரைமாற்றம் (On-Device)',
      onDeviceComplete: 'சாதனத்தில் செயல்முறை முடிந்தது',
      autoTaggedTheme: 'கண்டறியப்பட்ட தலைப்பு:',
      transcriptLabel: 'உரை வடிவம் (திருத்தலாம்):',
      manualTypePrompt: 'உங்கள் நினைவை இங்கே எழுதுங்கள்...',
      preferToType: 'டைப் செய்ய விரும்புகிறீர்களா?',
      rerecord: 'மீண்டும் பதிவுசெய்',
      saveToArchive: 'பெட்டகத்தில் சேமி',
      savedTitle: 'நினைவு சேமிக்கப்பட்டது!',
      savedMessage: 'இணையம் இன்றி நேரடியாக சாதனத்தில் சேமிக்கப்பட்டது.',
      recordAnother: 'மற்றொரு கதையைப் பதிவு செய்',
      sendToLaptop: 'மடிக்கணினிக்கு அனுப்பு',
      bridgeNote: 'ஆபீஸ் கிட் பிரிட்ஜ் — ஆஃப்லைன் சேமிப்பு',
      takeYourTime: 'பொறுமையாகப் பேசுங்கள். தயாரானதும் பொத்தானை அழுத்தவும்.',
    },
    family: {
      archiveTitle: 'அவர்களின் பொக்கிஷம்',
      memoriesPreserved: 'நினைவுகள் சாதனத்தில் சேமிக்கப்பட்டுள்ளன',
      recordBtn: 'புதிய பதிவு',
      noStoriesTitle: 'இன்னும் கதைகள் இல்லை',
      noStoriesDesc: 'குடும்ப வரலாற்றைப் பாதுகாக்க முதல் பதிவைத் தொடங்குங்கள்.',
      recordFirstBtn: 'முதல் நினைவைப் பதிவு செய்க',
      voice: 'குரல்',
      video: 'வீடியோ',
    },
    ask: {
      title: 'பெட்டகத்திடம் கேளுங்கள் (Ask Archive)',
      subtitle: 'பதிவுசெய்யப்பட்ட உண்மை நினைவுகளிலிருந்து மட்டுமே பதில்கள்',
      welcomeTitle: 'குடும்ப நினைவுகள் குறித்து கேளுங்கள்',
      welcomeDesc: 'ஒவ்வொரு பதிலும் பதிவு செய்யப்பட்ட குரல் மற்றும் வீடியோ பதிவுகளிலிருந்து மட்டுமே வழங்கப்படுகிறது.',
      suggestedHeading: 'பரிந்துரைக்கப்பட்ட கேள்விகள்',
      inputPlaceholder: 'பாட்டியின் நினைவுகளைப் பற்றி ஏதேனும் கேளுங்கள்...',
      synthesizing: 'பதிவுகளில் தேடுகிறது...',
      archivalSynthesis: 'பெட்டகத்தின் பதில்',
      source: 'ஆதாரம்:',
      playOriginalClip: 'அசல் குரல்/வீடியோவைக் கேட்க',
      askHerNext: 'அடுத்த முறை அவரிடம் இதைக் கேளுங்கள்:',
      playingOriginal: 'அசல் பதிவு ஒலிக்கிறது:',
      close: 'மூடு',
      suggestedPrompts: [
        'தாத்தாவும் பாட்டியும் முதன்முதலில் எப்படி சந்தித்தார்கள்?',
        'பாரம்பரிய சமையல் குறிப்பின் ரகசியம் என்ன?',
        'திருமணம் மற்றும் வாழ்க்கை பற்றிய அவர்களின் அறிவுரை என்ன?',
        'அவர்களின் முதல் வேலை மற்றும் முதல் சம்பள கதை என்ன?',
      ],
    },
    memoir: {
      title: 'பாரம்பரிய நினைவுப் புத்தகம்',
      subtitle: 'உண்மையான பதிவுகளிலிருந்து தொகுக்கப்பட்ட அழகிய புத்தகம்',
      regenerate: 'மீண்டும் தொகுக்க',
      curating: 'தொகுக்கப்படுகிறது...',
      printPdf: 'அச்சிடு / PDF சேமி',
      preface: 'முன்னுரை மற்றும் ஆவணக் குறிப்பு',
      tableOfContents: 'பொருளடக்கம்',
      storiesCount: 'கதைகள்',
      chapter: 'அத்தியாயம்',
      curatingNote: 'அத்தியாயங்கள் மற்றும் பொன்மொழிகள் தொகுக்கப்படுகின்றன.',
      endNote: 'Inheritance குடும்பப் பெட்டகத்தில் அன்புடன் பாதுகாக்கப்பட்டது',
    },
    drive: {
      backupBtn: 'குடும்ப கூகிள் டிரைவில் காப்புப் பிரதி எடுக்க',
      modalTitle: 'தனிப்பட்ட கூகிள் டிரைவ் காப்புப் பிரதி',
      modalDesc: 'ஆடியோ (.wav), வீடியோ (.webm) மற்றும் நினைவு புத்தகத்தை (.html) நேரடியாக உங்கள் கூகிள் டிரைவில் சேமிக்கிறது.',
      startBackup: 'கூகிள் டிரைவில் பதிவேற்றவும்',
      backingUp: 'டிரைவில் பதிவேற்றப்படுகிறது...',
      downloadMedia: 'ஆடியோ, வீடியோ & புத்தகத்தைப் பதிவிறக்க',
      cancel: 'ரத்து செய்',
      close: 'மூடு',
      privacyNote: 'கோப்புகள் உங்கள் தனிப்பட்ட டிரைவில் மட்டுமே பதிவேறும் • எந்த சேவையகத்திலும் சேமிக்கப்படாது',
    },
  },
};
