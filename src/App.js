import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { supabase, signOut, isSupabaseConfigured } from "./lib/supabase";
import AuthPage from "./components/AuthPage";
import ChatPage from "./components/ChatPage";
import SettingsPage from "./components/SettingsPage";
const LOCAL_USER = {
    id: "local",
    is_anonymous: true,
    app_metadata: {},
    user_metadata: {},
    aud: "local",
    created_at: new Date().toISOString(),
};
export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("chat");
    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setUser(LOCAL_USER);
            setLoading(false);
            return;
        }
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user ?? null);
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });
        return () => sub.subscription.unsubscribe();
    }, []);
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: "var(--bg)" }, children: _jsx("div", { className: "text-2xl animate-pulse", children: "\uD83E\uDDE0" }) }));
    }
    if (!user)
        return _jsx(AuthPage, {});
    if (view === "settings") {
        return _jsx(SettingsPage, { user: user, onClose: () => setView("chat") });
    }
    return (_jsx("div", { style: { height: "100dvh", display: "flex", flexDirection: "column" }, children: _jsx(ChatPage, { user: user, onOpenSettings: () => setView("settings"), onSignOut: isSupabaseConfigured() ? signOut : () => { } }) }));
}
