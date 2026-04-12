import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCud6Qkzf_A2pazSKvyZFbDSs_1Mr-Safs",
  authDomain: "nexora-lms-free.firebaseapp.com",
  projectId: "nexora-lms-free",
  storageBucket: "nexora-lms-free.firebasestorage.app",
  messagingSenderId: "561753225750",
  appId: "1:561753225750:web:352c5db0b0b5f84c6d1337",
  measurementId: "G-6H67V5NKQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
