import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AQ.Ab8RN6IsdVsmE_j3o30fPiyRDnvj5HkNQFljZrXRnwjU_iznGQ'),
      'process.env.ELEVENLABS_API_KEY': JSON.stringify(env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY || 'sk_6081c86f1f754496fb7694b54fba3ddbad43c89509d27e48'),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || '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'),
      'process.env.HUGGINGFACE_API_KEY': JSON.stringify(env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY || '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'),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '249104411965-5sa7u1mojbjejsqnp5fkrma77hu01mkr.apps.googleusercontent.com'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
