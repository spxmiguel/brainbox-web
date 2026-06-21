import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuth, signOut, isFirebaseConfigured } from "./lib/firebase";
import AuthPage from "./components/AuthPage";
import ChatPage from "./components/ChatPage";
import SettingsPage from "./components/SettingsPage";

type View = "chat" | "settings";

const LOCAL_USER = {
  uid: "local",
  isAnonymous: true,
  email: null,
  displayName: null,
} as unknown as User;

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("chat");

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setUser(LOCAL_USER);
      setLoading(false);
      return;
    }

    const unsub = onAuth((u) => {
      setUser(u);
      setLoading(false);
    });

    return unsub;
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
        onSignOut={isFirebaseConfigured() ? signOut : () => {}}
      />
    </div>
  );
}
