import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA_-gxHUt8qaW8cadq38FuqcgK3Va9Jo3E",
    authDomain: "t-o-d-o-217c3.firebaseapp.com",
    projectId: "t-o-d-o-217c3",
    storageBucket: "t-o-d-o-217c3.firebasestorage.app",
    messagingSenderId: "916024712670",
    appId: "1:916024712670:web:ac7658c20c9a30f7ff914f",
    measurementId: "G-JC5NX8PCE2"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore
const db = getFirestore(app);

export { db };
