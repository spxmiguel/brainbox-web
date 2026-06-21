import { createClient } from "@supabase/supabase-js";
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = () => Boolean(supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    supabaseAnonKey.length > 20 &&
    supabaseAnonKey !== "placeholder");
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");
const LS_MESSAGES = "bb_messages";
const LS_SETTINGS = "bb_settings";
export async function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
    });
}
export async function signInAnonymously() {
    if (!isSupabaseConfigured())
        return { data: null, error: null };
    return supabase.auth.signInAnonymously();
}
export async function signOut() {
    if (!isSupabaseConfigured())
        return { data: null, error: null };
    return supabase.auth.signOut();
}
export async function getUser() {
    if (!isSupabaseConfigured())
        return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
}
export async function saveMessage(_userId, role, content, llm_used, category) {
    if (!isSupabaseConfigured()) {
        const msgs = JSON.parse(localStorage.getItem(LS_MESSAGES) || "[]");
        msgs.push({ id: crypto.randomUUID(), role, content, llm_used, category, created_at: new Date().toISOString() });
        localStorage.setItem(LS_MESSAGES, JSON.stringify(msgs));
        return { data: null, error: null };
    }
    return supabase.from("memories").insert({ user_id: _userId, role, content, llm_used, category });
}
export async function getMessages(_userId, limit = 50) {
    if (!isSupabaseConfigured()) {
        const msgs = JSON.parse(localStorage.getItem(LS_MESSAGES) || "[]");
        return { data: msgs.slice(-limit), error: null };
    }
    return supabase
        .from("memories")
        .select("*")
        .eq("user_id", _userId)
        .order("created_at", { ascending: true })
        .limit(limit);
}
export async function clearMessages(_userId) {
    if (!isSupabaseConfigured()) {
        localStorage.removeItem(LS_MESSAGES);
        return { data: null, error: null };
    }
    return supabase.from("memories").delete().eq("user_id", _userId);
}
export async function getUserSettings(_userId) {
    if (!isSupabaseConfigured()) {
        const data = JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}");
        return { data, error: null };
    }
    return supabase.from("user_settings").select("*").eq("user_id", _userId).single();
}
export async function upsertUserSettings(_userId, settings) {
    if (!isSupabaseConfigured()) {
        localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
        return { data: null, error: null };
    }
    return supabase.from("user_settings").upsert({ user_id: _userId, ...settings, updated_at: new Date().toISOString() });
}
