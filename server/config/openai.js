const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_MODEL = 'sarvam-105b';

async function safeGenerate(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch('https://api.sarvam.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-subscription-key': SARVAM_API_KEY,
        },
        body: JSON.stringify({
          model: SARVAM_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 2048,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Sarvam API ${resp.status}: ${text}`);
      }
      const json = await resp.json();
      const content = json.choices?.[0]?.message?.content;
      console.log('Sarvam raw response:', JSON.stringify(json).slice(0, 500));
      return content || null;
    } catch (error) {
      const isQuota = error.message?.includes('429') || error.message?.includes('quota');
      if (isQuota && i < retries - 1) {
        const wait = Math.pow(2, i + 1) * 1000;
        console.error(`Sarvam quota error, retrying in ${wait}ms (attempt ${i + 1}/${retries})`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      console.error('Sarvam error:', error.message);
      return null;
    }
  }
}

export { safeGenerate };
