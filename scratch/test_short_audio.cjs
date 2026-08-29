async function testShortAudio() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';

  // 1. Test 0.5s audio (too short)
  const sampleRate = 16000;
  const numSamples = sampleRate * 0.5;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * 2, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(numSamples * 2, 40);

  const pcmData = Buffer.alloc(numSamples * 2);
  const wavBuffer = Buffer.concat([header, pcmData]);
  const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });

  const fd = new FormData();
  fd.append('name', 'Too Short Voice');
  fd.append('files', wavBlob, 'short.wav');

  const res = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': ELEVENLABS_KEY },
    body: fd
  });
  console.log('Short audio result:', res.status, await res.text());
}
testShortAudio().catch(console.error);
