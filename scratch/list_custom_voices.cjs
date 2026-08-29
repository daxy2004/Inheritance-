async function listCustomVoices() {
  const ELEVENLABS_KEY = 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48';
  const res = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': ELEVENLABS_KEY }
  });
  const data = await res.json();
  const custom = data.voices.filter(v => v.category === 'cloned');
  console.log(`Found ${custom.length} custom cloned voices:`);
  for (const v of custom) {
    console.log(`- ID: ${v.voice_id} | Name: "${v.name}" | Date: ${v.created_at_unix || 'unknown'}`);
  }
}
listCustomVoices().catch(console.error);
