import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inheritance.familyarchive',
  appName: 'Inheritance',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      serverClientId: process.env.GOOGLE_CLIENT_ID || '',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
    },
  },
};

export default config;
