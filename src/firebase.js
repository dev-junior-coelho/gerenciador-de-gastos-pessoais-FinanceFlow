

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAqPjNb-wtbBTgx_7k_F9meZ3JlQuE2yUs",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "financeflow-btpbp.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "financeflow-btpbp",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "financeflow-btpbp.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1013466792204",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1013466792204:web:b23052ccbaeb94a97e4929"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
