import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Default configuration from firebase-applet-config.json
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBMnKHlGAkM8K-KRQW9_C559-EXFK_mow8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "project-0e4f9daa-edf9-4546-bf7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "project-0e4f9daa-edf9-4546-bf7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "project-0e4f9daa-edf9-4546-bf7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "363892117746",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:363892117746:web:ae1e82635fa9c630fe006b",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-bravocup-6d322511-c35e-4d92-9d99-6db3c37a2216",
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore with specified databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot per Firebase skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore offline or waiting for initial connection...");
    }
  }
}
testConnection();
