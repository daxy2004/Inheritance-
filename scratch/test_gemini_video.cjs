async function testGeminiVideoTranscribe() {
  const GEMINI_KEY = 'AQ.Ab8RN6IsdVsmE_j3o30fPiyRDnvj5HkNQFljZrXRnwjU_iznGQ';

  // Let's test what MIME types Gemini accepts
  const mimes = ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mp4', 'audio/webm', 'audio/wav'];
  console.log('Testing Gemini models with video and audio mimes...');

  for (const mime of mimes) {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
    // Test small 1-second dummy buffer
    const dummy = Buffer.alloc(100).toString('base64');
    const res = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Transcribe this' },
            { inlineData: { mimeType: mime, data: dummy } }
          ]
        }]
      })
    });
    console.log(`MIME: ${mime} -> Status: ${res.status}`);
    if (!res.ok) {
      console.log('Error:', await res.text());
    }
  }
}
testGeminiVideoTranscribe().catch(console.error);
