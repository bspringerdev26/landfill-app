// src/services/firebase.ts
// Firebase client initialization for the Vite app.

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// NOTE: For a prototype, it's okay to keep config here.
// Later we'll move these to .env and use import.meta.env.

const firebaseConfig = {
  apiKey: "AIzaSyDMV75nPaYKrzFqlDo0xiFKX1_8x0ze9FM",
  authDomain: "landfill-app.firebaseapp.com",
  projectId: "landfill-app",
  storageBucket: "landfill-app.firebasestorage.app",
  messagingSenderId: "14633967919",
  appId: "1:14633967919:web:8abad8528bcf758f7e01da"
};


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Real timestamps, easy to store + display + export
export function nowIso() {
  return new Date().toISOString();
}

