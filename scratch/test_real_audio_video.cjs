async function testRealVideoAudio() {
  const GEMINI_KEY = 'AQ.Ab8RN6IsdVsmE_j3o30fPiyRDnvj5HkNQFljZrXRnwjU_iznGQ';
  const OPENROUTER_KEY = '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';

  // Let's create a real WAV header buffer
  function makeSampleWav(seconds = 2) {
    const sampleRate = 16000;
    const numSamples = sampleRate * seconds;
    const buffer = Buffer.alloc(44 + numSamples * 2);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + numSamples * 2, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16);
    buffer.writeUInt16LE(1, 20);
    buffer.writeUInt16LE(1, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2, 28);
    buffer.writeUInt16LE(2, 32);
    buffer.writeUInt16LE(16, 34);
    buffer.write('data', 36);
    buffer.writeUInt32LE(numSamples * 2, 40);
    for (let i = 0; i < numSamples; i++) {
      buffer.writeInt16LE(Math.sin(i / 10) * 1000, 44 + i * 2);
    }
    return buffer;
  }

  const wavBuf = makeSampleWav(2);
  const base64Wav = wavBuf.toString('base64');

  console.log('Testing gemini-3.6-flash...');
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Transcribe this audio verbatim' },
          { inlineData: { mimeType: 'audio/wav', data: base64Wav } }
        ]
      }]
    })
  });
  console.log('Gemini 3.6 flash audio response:', res.status);
  const data = await res.json();
  console.log('Data:', JSON.stringify(data, null, 2));

  console.log('\nTesting video/mp4 MIME type on gemini-3.6-flash...');
  const resVideo = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: 'Transcribe this speech verbatim' },
          { inlineData: { mimeType: 'video/mp4', data: base64Wav } }
        ]
      }]
    })
  });
  console.log('Gemini 3.6 flash video/mp4 response:', resVideo.status);
  console.log('Video error/data:', await resVideo.text());
}
testRealVideoAudio().catch(console.error);
