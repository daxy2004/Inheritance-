async function testFormats() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';

  // 1. Check current voices
  const listRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const listData = await listRes.json();
  const cloned = listData.voices.filter(v => v.category === 'cloned');
  console.log(`Current cloned voices (${cloned.length}/10):`);
  cloned.forEach(v => console.log(`  - ${v.voice_id}: "${v.name}"`));

  // 2. Test uploading a 5-second PCM WAV file
  const sampleRate = 16000;
  const numSamples = sampleRate * 5;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * 2, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(numSamples * 2, 40);

  const pcmData = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i++) {
    // Generate vocal-like complex harmonic wave (male/elder pitch ~130Hz with harmonics)
    const f0 = 130;
    const s1 = Math.sin(2 * Math.PI * f0 * (i / sampleRate));
    const s2 = 0.5 * Math.sin(2 * Math.PI * (f0 * 2) * (i / sampleRate));
    const s3 = 0.25 * Math.sin(2 * Math.PI * (f0 * 3) * (i / sampleRate));
    const sample = (s1 + s2 + s3) / 1.75 * 14000;
    pcmData.writeInt16LE(Math.floor(sample), i * 2);
  }
  const wavBuffer = Buffer.concat([header, pcmData]);
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

  console.log('\n--- Testing Add Voice with WAV (5s audio) ---');
  const fdWav = new FormData();
  fdWav.append('name', `Harmonic Voice ${Date.now().toString().slice(-4)}`);
  fdWav.append('description', 'Test 5s harmonic audio sample');
  fdWav.append('files', wavBlob, 'sample.wav');

  const addWavRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_KEY },
    body: fdWav
  });
  const addWavData = await addWavRes.json();
  console.log('WAV Add Status:', addWavRes.status, addWavData);

  if (addWavData.voice_id) {
    const vId = addWavData.voice_id;
    console.log(`Voice successfully cloned: ${vId}`);

    // Let's test TTS with different similarity_boost and stability
    console.log('\n--- Testing TTS on Cloned Voice in English ---');
    const ttsEn = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of my cloned voice speaking to you.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.95,
          style: 0.40,
          use_speaker_boost: true
        }
      })
    });
    console.log('TTS English Status:', ttsEn.status, 'size:', (await ttsEn.arrayBuffer()).byteLength);

    console.log('\n--- Testing TTS on Cloned Voice in Kannada ---');
    const ttsKn = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${vId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'ನನ್ನ ಪ್ರೀತಿಯ ಕುಟುಂಬಕ್ಕೆ ನಮಸ್ಕಾರ, ಇದು ನನ್ನದೇ ಧ್ವನಿ.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.35,
          similarity_boost: 0.95,
          style: 0.40,
          use_speaker_boost: true
        }
      })
    });
    console.log('TTS Kannada Status:', ttsKn.status, 'size:', (await ttsKn.arrayBuffer()).byteLength);
  }
}

testFormats().catch(console.error);
