// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDr9jt6BLwmsEZ93lGPpcpgpQPtoILwFx4",
  authDomain: "govardhan-a98c0.firebaseapp.com",
  projectId: "govardhan-a98c0",
  storageBucket: "govardhan-a98c0.appspot.com",  // ✅ fix ".app" → ".appspot.com"
  messagingSenderId: "316361100801",
  appId: "1:316361100801:web:184a7b1325252e13573a00",
  measurementId: "G-3C3VF5VJN5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth + provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
