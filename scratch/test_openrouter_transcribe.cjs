async function testOpenRouterTranscription() {
  const OPENROUTER_KEY = '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';

  // Let's create a real WAV header buffer
  function makeSampleWav(seconds = 1) {
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

  const base64Wav = makeSampleWav(1).toString('base64');
  const dataUrl = `data:audio/wav;base64,${base64Wav}`;

  const models = ['google/gemini-2.5-flash', 'google/gemini-2.0-flash-001', 'meta-llama/llama-3.2-11b-vision-instruct'];

  for (const model of models) {
    console.log(`Testing OpenRouter model: ${model}...`);
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Transcribe this recording verbatim.' },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }]
      })
    });
    console.log(`Status for ${model}:`, res.status);
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  }
}
testOpenRouterTranscription().catch(console.error);
