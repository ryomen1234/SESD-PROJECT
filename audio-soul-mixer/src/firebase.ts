import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration (provided by user)
const firebaseConfig = {
  apiKey: "AIzaSyBvJ4Ccnmo8YBEA-mwV0clkVqO4iFPh9J8",
  authDomain: "sonic-architect-424da.firebaseapp.com",
  projectId: "sonic-architect-424da",
  storageBucket: "sonic-architect-424da.firebasestorage.app",
  messagingSenderId: "43918983143",
  appId: "1:43918983143:web:31eef9e61185ccf4868742",
  measurementId: "G-GZ9BHF3BKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app; 