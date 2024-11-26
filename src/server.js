import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase config


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore
const db = getFirestore(app);

export { db };
