// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:  process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  storageBucket:  process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  messagingSenderId:  process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  appId:  process.env.NEXT_PUBLIC_FIREBASE_API_KEY
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export {auth}