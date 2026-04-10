import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, updateDoc, collection, addDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA2nknkSraM3rmuAhpCK1_IW2NkF9oYmV0",
  authDomain: "mycv-bae03.firebaseapp.com",
  projectId: "mycv-bae03",
  storageBucket: "mycv-bae03.firebasestorage.app",
  messagingSenderId: "802456543143",
  appId: "1:802456543143:web:d6a409e905c6056801a082"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const githubProvider = new GithubAuthProvider();

export { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy
};
