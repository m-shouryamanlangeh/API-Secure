// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL - keeps user logged in even after browser is closed
// This is the "Remember Me" functionality
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Auth persistence set to LOCAL - user will stay logged in");
  })
  .catch((error) => {
    console.error("❌ Error setting auth persistence:", error);
  });

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Export initialized services
export { app, auth, db, googleProvider };

