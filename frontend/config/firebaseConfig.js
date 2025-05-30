// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBssejJz6Z8KxumRxGJfU04usPsARSehR8",
  authDomain: "washwise-firebase.firebaseapp.com",
  projectId: "washwise-firebase",
  storageBucket: "washwise-firebase.firebasestorage.app",
  messagingSenderId: "812257084410",
  appId: "1:812257084410:web:5ee30ca0272d2d1e8a5a43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Add and export Firestore
export const db = getFirestore(app);