import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GithubAuthProvider, signInWithPopup, setPersistence, browserSessionPersistence, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc, collection, addDoc, deleteDoc, query, orderBy, getDocFromServer, enableIndexedDbPersistence } from 'firebase/firestore';

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

// Enable offline persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });
}

export const githubProvider = new GithubAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signInAnonymously,
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  getDocFromServer
};
