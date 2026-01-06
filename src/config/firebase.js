import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, set, get, increment } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// Track video views
export const trackView = async (movieId) => {
  if (!movieId) return;
  try {
    const viewRef = ref(db, `movies/${movieId}/views`);
    await set(viewRef, increment(1));
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Get movie views
export const getViews = async (movieId) => {
  if (!movieId) return 0;
  try {
    const viewRef = ref(db, `movies/${movieId}/views`);
    const snapshot = await get(viewRef);
    return snapshot.val() || 0;
  } catch (error) {
    console.error('Error getting views:', error);
    return 0;
  }
};
// Get user's watch history
export const getWatchHistory = async (userId) => {
  if (!userId) return [];
  try {
    const historyRef = ref(db, `users/${userId}/watchHistory`);
    const snapshot = await get(historyRef);
    return snapshot.val() || [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

// Get user's favorites
export const getFavorites = async (userId) => {
  if (!userId) return [];
  try {
    const favRef = ref(db, `users/${userId}/favorites`);
    const snapshot = await get(favRef);
    return snapshot.val() || [];
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
};
