import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBp5BQLEql2OI-QW95IqOqclhz_pYe6RDo",
  authDomain: "share-circle-156b7.firebaseapp.com",
  projectId: "share-circle-156b7",
  storageBucket: "share-circle-156b7.firebasestorage.app",
  messagingSenderId: "150383616420",
  appId: "1:150383616420:web:6767b0412b1484f8722131",
  measurementId: "G-VLP44N2GCV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export modular auth functions to ensure consistent module resolution across the app
export { 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
};
