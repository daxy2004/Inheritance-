async function testCloneCycle() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';

  // 1. Fetch voices
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const data = await res.json();
  const custom = data.voices.filter(v => v.category === 'cloned');
  console.log(`Cloned count: ${custom.length}/10`);

  if (custom.length >= 8) {
    // Sort by created_at ascending
    custom.sort((a, b) => (a.created_at_unix || 0) - (b.created_at_unix || 0));
    const oldest = custom[0];
    console.log(`Deleting oldest voice slot to free space: ID: ${oldest.voice_id} ("${oldest.name}")`);
    const delRes = await fetch(`https://api.elevenlabs.io/v1/voices/${oldest.voice_id}`, {
      method: 'DELETE',
      headers: { 'xi-api-key': ELEVENLABS_KEY }
    });
    console.log(`Delete status: ${delRes.status}`);
  }

  // 2. Now add a new voice clone
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + 8000 * 2, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24);
  header.writeUInt32LE(16000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(16000, 40);

  const pcmData = Buffer.alloc(16000);
  for (let i = 0; i < 8000; i++) {
    const val = Math.sin(2 * Math.PI * 220 * (i / 8000)) * 12000;
    pcmData.writeInt16LE(Math.floor(val), i * 2);
  }
  const wavBuffer = Buffer.concat([header, pcmData]);
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });

  const formData = new FormData();
  formData.append('name', `Clone Test ${Date.now()}`);
  formData.append('description', 'Auto-managed test clone');
  formData.append('files', blob, 'sample.wav');

  const addRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_KEY },
    body: formData
  });

  const addData = await addRes.json();
  console.log('Add Result:', addData);

  if (addData.voice_id) {
    console.log(`Successfully created instant voice clone with ID: ${addData.voice_id}`);
    // Synthesize in Kannada
    const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${addData.voice_id}`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: 'ನನ್ನ ಪ್ರೀತಿಯ ಕುಟುಂಬಕ್ಕೆ ನನ್ನ ನಮಸ್ಕಾರಗಳು. ಇದು ನನ್ನ ಧ್ವನಿ.',
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.50,
          similarity_boost: 0.85
        }
      })
    });
    console.log(`TTS synthesis in cloned voice: status ${ttsRes.status}`);
  }
}

testCloneCycle().catch(console.error);
