// Import the functions from the sdk
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signOut,
    signInWithEmailAndPassword,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,updatePassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-auth.js";
import{ 
  getFirestore,
  collection,
  doc,
  getDoc, addDoc,
  setDoc, query, where, getDocs, deleteDoc, updateDoc, Timestamp
 } from "https://www.gstatic.com/firebasejs/9.8.1/firebase-firestore.js";

 import{
  getFunctions,
  httpsCallable 
} from "https://www.gstatic.com/firebasejs/9.8.1/firebase-functions.js";

// The web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHohtoLLqqHrsFu_oO4nN-9i0W00MwqQQ",
  authDomain: "wtig-341a0.firebaseapp.com",
  projectId: "wtig-341a0",
  storageBucket: "wtig-341a0.appspot.com",
  messagingSenderId: "930885499691",
  appId: "1:930885499691:web:b980465a3cd1d63720636e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

//Exporting variables and funtions
export {auth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  db,
  collection,
  doc,
  getDoc,
  setDoc,EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
  functions, httpsCallable,
  query, where, getDocs, addDoc,
  deleteDoc, updateDoc, Timestamp  };
///////////////////////////////////////////////////////////////////////////////////////
