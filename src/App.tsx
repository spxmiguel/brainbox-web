import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase, signOut } from "./lib/supabase";
import AuthPage from "./components/AuthPage";
import ChatPage from "./components/ChatPage";
import SettingsPage from "./components/SettingsPage";

type View = "chat" | "settings";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("chat");

  useEffect(() => {
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
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-2xl animate-pulse">🧠</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (view === "settings") {
    return <SettingsPage user={user} onClose={() => setView("chat")} />;
  }

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column" }}>
      <ChatPage
        user={user}
        onOpenSettings={() => setView("settings")}
        onSignOut={signOut}
      />
    </div>
  );
}
