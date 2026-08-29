const fs = require('fs');

async function testVoiceClone() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';
  
  // Create a dummy WAV/MP3 buffer for testing voice clone add
  // A minimal valid 1 sec WAV file
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + 8000 * 2, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // Mono
  header.writeUInt32LE(8000, 24); // Sample rate
  header.writeUInt32LE(16000, 28); // Byte rate
  header.writeUInt16LE(2, 32); // Block align
  header.writeUInt16LE(16, 34); // Bits per sample
  header.write('data', 36);
  header.writeUInt32LE(16000, 40);

  const pcmData = Buffer.alloc(16000);
  for (let i = 0; i < 8000; i++) {
    const val = Math.sin(2 * Math.PI * 440 * (i / 8000)) * 10000;
    pcmData.writeInt16LE(Math.floor(val), i * 2);
  }
  const wavBuffer = Buffer.concat([header, pcmData]);
  
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });

  const formData = new FormData();
  formData.append('name', `Test Clone ${Date.now()}`);
  formData.append('description', 'Test clone for voice');
  formData.append('files', blob, 'sample.wav');

  console.log('Sending voice add request to ElevenLabs...');
  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_KEY
    },
    body: formData
  });

  const status = res.status;
  const body = await res.text();
  console.log('Status:', status);
  console.log('Body:', body);

  // Let's also check existing voices on this account
  const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const voicesData = await voicesRes.json();
  console.log('Available Voices count:', voicesData.voices ? voicesData.voices.length : 0);
  if (voicesData.voices) {
    console.log('Sample voices:', voicesData.voices.slice(0, 8).map(v => ({ id: v.voice_id, name: v.name, category: v.category, labels: v.labels })));
  }

  // Let's also check user subscription info
  const userRes = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const userData = await userRes.json();
  console.log('Subscription Info:', JSON.stringify(userData, null, 2));
}

testVoiceClone().catch(console.error);
