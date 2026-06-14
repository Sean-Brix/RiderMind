import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK once at startup
admin.initializeApp();

setGlobalOptions({
  maxInstances: 10,
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 60
});

// Import Express app after Admin is initialized
import app from './app.js';

export const api = onRequest({ invoker: 'public' }, app);
