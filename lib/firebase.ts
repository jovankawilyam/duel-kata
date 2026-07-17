import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { Firestore, getFirestore, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function initFirebase() {
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
  return { app, auth, db };
}

export function getDb() {
  if (!db) initFirebase();
  return db!;
}

export function getAuthInstance() {
  if (!auth) initFirebase();
  return auth!;
}

export async function signInUser() {
  const a = getAuthInstance();
  if (!a.currentUser) {
    await signInAnonymously(a);
  }
  return a.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void) {
  const a = getAuthInstance();
  return onAuthStateChanged(a, callback);
}

export function getRoomRef(roomId: string) {
  return doc(getDb(), "artifacts", "default-app-id", "public", "data", "rooms", roomId);
}
