// src/services/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// NOTE: In production, put these in .env and use import.meta.env.*
// For now we keep it simple since you're prototyping.

const firebaseConfig = {
  apiKey: "AIzaSyB1Eq43cblT67qqD0pYbGdlqeeEMsOtQXw",
  authDomain: "landfill-app.firebaseapp.com",
  projectId: "landfill-app",
  storageBucket: "landfill-app.firebasestorage.app",
  messagingSenderId: "14633967919",
  appId: "1:14633967919:web:8abad8528bcf758f7e01da",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Simple timestamp helper (real timestamps, easy to store)
export function nowIso() {
  return new Date().toISOString();
}
