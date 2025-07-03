/**
 * Configure Firebase and export Firestore database instance.
 * Replace placeholders in firebaseConfig with your Firebase project credentials.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { FIREBASE_SENDER_ID } from './.env';
import { FIREBASE_PROJECT_ID } from './.env';
import { FIREBASE_AUTH_DOMAIN } from './.env';
import { FIREBASE_STORAGE_BUCKET } from './.env';
import { FIREBASE_DATABASE_URL } from './.env';
import { FIREBASE_APP_ID } from './.env';
import { FIREBASE_API_KEY } from './.env';

// TODO: Replace the following with your Firebase project configuration
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  databaseURL: FIREBASE_DATABASE_URL,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };