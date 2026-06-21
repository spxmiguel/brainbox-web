import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
}

export async function signInAnonymously() {
  return supabase.auth.signInAnonymously();
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function saveMessage(
  userId: string,
  role: "user" | "assistant",
  content: string,
  llm_used?: string,
  category?: string
) {
  return supabase.from("memories").insert({
    user_id: userId,
    role,
    content,
    llm_used,
    category,
  });
}

export async function getMessages(userId: string, limit = 50) {
  return supabase
    .from("memories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(limit);
}

export async function clearMessages(userId: string) {
  return supabase.from("memories").delete().eq("user_id", userId);
}

export async function getUserSettings(userId: string) {
  return supabase.from("user_settings").select("*").eq("user_id", userId).single();
}

export async function upsertUserSettings(userId: string, settings: object) {
  return supabase.from("user_settings").upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() });
}
