async function testPronunciationImprovements() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';

  // Helper to polish text for speech
  function cleanAndPunctuateForSpeech(text, lang = 'en') {
    let clean = text
      .replace(/[*_#`~>[\]()]/g, '') // remove markdown
      .replace(/[\u0964\u0965]/g, '.') // replace Devanagari danda with period
      .replace(/[;—–]/g, ', ') // replace dashes/semicolons with pause comma
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure space after punctuation for natural breath pacing
    clean = clean.replace(/([.,!?])(?=[^\s])/g, '$1 ');
    return clean;
  }

  const samples = {
    kn: "ನಮ್ಮ ಕುಟುಂಬದ ಪ್ರತಿಯೊಂದು ಕ್ಷಣವೂ, ಬಹಳ ಅಮೂಲ್ಯವಾದದ್ದು. ನಾವು ಒಟ್ಟಿಗೆ ಕಳೆದ ಆ ದಿನಗಳು, ಇಂದಿಗೂ ನನ್ನ ಮನಸ್ಸಿನಲ್ಲಿ ಹಸಿರಾಗಿವೆ.",
    hi: "हमारे परिवार का हर एक पल, बहुत अनमोल है। हमने जो दिन साथ बिताए, वे आज भी मेरे दिल में ताज़ा हैं।",
    ta: "எங்கள் குடும்பத்தின் ஒவ்வொரு தருணமும், மிகவும் பொக்கிஷமானது. நாம் அனைவரும் ஒன்றாக வாழ்ந்த அந்த நாட்கள், இன்றும் என் நினைவில் உள்ளன.",
    en: "Every moment we shared as a family, is deeply precious. Those days we spent together, still remain fresh in my heart."
  };

  const vRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const vData = await vRes.json();
  const voiceId = vData.voices[0]?.voice_id;
  console.log('Testing with voice ID:', voiceId);

  for (const [lang, rawText] of Object.entries(samples)) {
    const speechText = cleanAndPunctuateForSpeech(rawText, lang);
    console.log(`[${lang}] Sending: "${speechText}"`);

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: speechText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.60,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });
    console.log(`[${lang}] Status:`, res.status, 'audio bytes:', (await res.arrayBuffer()).byteLength);
  }
}
testPronunciationImprovements().catch(console.error);
