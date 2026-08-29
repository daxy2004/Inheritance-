async function cleanupOldTestVoices() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const data = await res.json();
  const custom = data.voices.filter(v => v.category === 'cloned');
  console.log(`Currently ${custom.length} cloned voices.`);

  // Delete test voices
  for (const v of custom) {
    if (v.name.includes('Test') || v.name.includes('Clone Test') || v.name.includes('gota') || v.name.includes('Gof') || v.name.includes('Shibi') || v.name.includes('Ujjwal')) {
      console.log(`Deleting ${v.name} (${v.voice_id})...`);
      await fetch(`https://api.elevenlabs.io/v1/voices/${v.voice_id}`, {
        method: 'DELETE',
        headers: { 'xi-api-key': ELEVENLABS_KEY }
      });
    }
  }

  const check = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const checkData = await check.json();
  const remaining = checkData.voices.filter(v => v.category === 'cloned');
  console.log(`Cleaned up! Now ${remaining.length}/10 custom voice slots used.`);
}
cleanupOldTestVoices().catch(console.error);
