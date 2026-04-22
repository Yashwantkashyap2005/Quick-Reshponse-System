// src/services/firebase.js
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDV4Y8PAv1t-DSkdmCN8QmPsjZ4MEbp7u4',
  authDomain: 'quick-response-emergency-app.firebaseapp.com',
  projectId: 'quick-response-emergency-app',
  storageBucket: 'quick-response-emergency-app.firebasestorage.app',
  messagingSenderId: '628358348990',
  appId: '1:628358348990:web:83c09940a2c0c829f5deef',
  measurementId: 'G-5FBFDWP2TX',
};

// Prevent re-initialization on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Safe auth initialization (avoids "already initialized" crash on hot reload)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
