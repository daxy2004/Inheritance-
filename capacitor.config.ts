import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.inheritance.familyarchive',
  appName: 'Inheritance',
  webDir: 'dist',
  plugins: {
    GoogleAuth: {
      clientId: '249104411965-5sa7u1mojbjejsqnp5fkrma77hu01mkr.apps.googleusercontent.com',
      serverClientId: '249104411965-5sa7u1mojbjejsqnp5fkrma77hu01mkr.apps.googleusercontent.com',
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file'],
    },
  },
};

export default config;
