import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment in priority order without logging contents
const devVarsPath = path.resolve(__dirname, '../.dev.vars');
const backendEnvPath = path.resolve(__dirname, '../.env');
const rootEnvPath = path.resolve(__dirname, '../../.env');

if (fs.existsSync(devVarsPath)) {
  dotenv.config({ path: devVarsPath });
}
if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
}
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}

async function checkGemini() {
  const modelName = process.env.MODEL_NAME || 'gemini-2.5-flash';
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here' || apiKey === 'your-key-here') {
    console.log(`Model: ${modelName}`);
    console.log(`Status: 401 Unauthorized`);
    console.log(`GEMINI_API_KEY is not set in environment or backend/.dev.vars`);
    process.exit(1);
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'ping' }] }]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`Model: ${modelName}`);
    console.log(`Status: ${res.status}`);

    if (res.ok) {
      console.log('OK');
      process.exit(0);
    } else {
      const errorJson: any = await res.json().catch(() => null);
      let rawMsg = errorJson?.error?.message || res.statusText || 'Request failed';
      const sanitizedMsg = rawMsg.replace(/key=[^&\s]+/gi, 'key=REDACTED');
      console.log(sanitizedMsg);
      process.exit(1);
    }
  } catch (err: any) {
    console.log(`Model: ${modelName}`);
    if (err.name === 'AbortError' || err.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message?.includes('timeout')) {
      console.log(`Status: Timeout`);
      console.log('Connection timed out reaching Google Gemini API endpoint.');
    } else {
      console.log(`Status: Network Error`);
      console.log(err.message || 'Network fetch failed');
    }
    process.exit(1);
  }
}

checkGemini();
