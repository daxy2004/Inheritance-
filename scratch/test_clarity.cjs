async function testVoiceClarity() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';

  const vRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const vData = await vRes.json();
  const cloned = vData.voices.filter(v => v.category === 'cloned');
  console.log('Available cloned voices:', cloned.map(v => ({ id: v.voice_id, name: v.name })));

  if (cloned.length > 0) {
    const vId = cloned[cloned.length - 1].voice_id;
    console.log(`Testing crisp voice settings on voice ID: ${vId}`);

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'ನಮಸ್ಕಾರ, ನನ್ನ ಮಾತುಗಳು ಈಗ ಸ್ಪಷ್ಟವಾಗಿ ಮತ್ತು ಶುದ್ಧವಾಗಿ ಕೇಳಿಸುತ್ತಿವೆ.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.70,
          similarity_boost: 0.85,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    });
    console.log('Clarity test status:', res.status, 'audio bytes:', (await res.arrayBuffer()).byteLength);
  }
}
testVoiceClarity().catch(console.error);
