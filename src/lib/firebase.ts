import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously as fbSignInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

export const isFirebaseConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== "placeholder"
  );

const app = isFirebaseConfigured()
  ? initializeApp(firebaseConfig)
  : null;

export const auth = app ? getAuth(app) : null;

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  if (!auth) return { user: null, error: new Error("Firebase não configurado") };
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (e) {
    return { user: null, error: e as Error };
  }
}

export async function signInAnonymously() {
  if (!auth) return { user: null, error: new Error("Firebase não configurado") };
  try {
    const result = await fbSignInAnonymously(auth);
    return { user: result.user, error: null };
  } catch (e) {
    return { user: null, error: e as Error };
  }
}

export async function signOut() {
  if (!auth) return;
  return fbSignOut(auth);
}

export function onAuth(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// localStorage persistence for messages/settings
const LS_MESSAGES = "bb_messages";
const LS_SETTINGS = "bb_settings";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  llm_used?: string;
  category?: string;
  created_at: string;
}

export interface UserSettings {
  gemini_key?: string;
  claude_key?: string;
  openai_key?: string;
}

export function saveMessage(
  _userId: string,
  role: "user" | "assistant",
  content: string,
  llm_used?: string,
  category?: string
) {
  const msgs: Message[] = JSON.parse(localStorage.getItem(LS_MESSAGES) || "[]");
  msgs.push({ id: crypto.randomUUID(), role, content, llm_used, category, created_at: new Date().toISOString() });
  localStorage.setItem(LS_MESSAGES, JSON.stringify(msgs));
}

export function getMessages(_userId: string, limit = 100): Message[] {
  const msgs: Message[] = JSON.parse(localStorage.getItem(LS_MESSAGES) || "[]");
  return msgs.slice(-limit);
}

export function clearMessages(_userId: string) {
  localStorage.removeItem(LS_MESSAGES);
}

export function getUserSettings(_userId: string): UserSettings {
  return JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}");
}

export function upsertUserSettings(_userId: string, settings: UserSettings) {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
}
