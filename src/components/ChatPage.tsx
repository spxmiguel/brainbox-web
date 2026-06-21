import { useState, useEffect, useRef, useCallback } from "react";
import type { User } from "firebase/auth";
import type { Message, UserSettings } from "../types";
import { sendMessage, getLLMLabel } from "../lib/llm";
import { saveMessage, getMessages, clearMessages, getUserSettings, isFirebaseConfigured } from "../lib/firebase";

interface Props {
  user: User;
  onOpenSettings: () => void;
  onSignOut: () => void;
}

export default function ChatPage({ user, onOpenSettings, onSignOut }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    loadSettings();
  }, [user.uid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function loadMessages() {
    setMessages(getMessages(user.uid, 100) as Message[]);
  }

  function loadSettings() {
    setSettings(getUserSettings(user.uid) as UserSettings);
  }

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    saveMessage(user.uid, "user", text);

    try {
      const res = await sendMessage({
        input: text,
        claude_key: settings.claude_key,
        openai_key: settings.openai_key,
        gemini_key: settings.gemini_key,
      });

      const botMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: res.content,
        llm_used: res.llm_used,
        category: res.category,
        created_at: new Date().toISOString(),
      };
      setMessages((m) => [...m, botMsg]);
      saveMessage(user.uid, "assistant", res.content, res.llm_used, res.category);
    } catch (e) {
      const err = e instanceof Error ? e.message : "Erro desconhecido";
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Erro: ${err}`,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, settings, user.uid]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleClear() {
    clearMessages(user.uid);
    setMessages([]);
  }

  const isLocal = !isFirebaseConfigured();
  const hasNoKeys = !settings.gemini_key && !settings.claude_key && !settings.openai_key;

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="glass flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="font-semibold gradient-text">BrainBox</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              Limpar
            </button>
          )}
          <button
            onClick={onOpenSettings}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            ⚙ Config
          </button>
          {!isLocal && (
            <button
              onClick={onSignOut}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
            >
              Sair
            </button>
          )}
        </div>
      </header>

      {/* No-key warning banner */}
      {hasNoKeys && (
        <div
          className="px-4 py-2 text-xs text-center shrink-0"
          style={{ background: "rgba(234,179,8,0.15)", color: "#eab308", borderBottom: "1px solid rgba(234,179,8,0.3)" }}
        >
          Configure sua{" "}
          <button onClick={onOpenSettings} className="underline font-semibold">
            Gemini API Key
          </button>{" "}
          em Config para usar o BrainBox
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-20">
            <div className="text-4xl">🧠</div>
            <h2 className="text-xl font-semibold gradient-text">BrainBox pronto</h2>
            <p className="text-sm max-w-xs" style={{ color: "var(--muted)" }}>
              Pergunte qualquer coisa. O orquestrador escolhe a melhor IA automaticamente.
            </p>
            {isLocal && (
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                Modo local — histórico salvo no navegador
              </p>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "text-white"
                  : "glass"
              }`}
              style={
                msg.role === "user"
                  ? { background: "var(--accent)" }
                  : undefined
              }
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.llm_used && (
                <div className="mt-2 flex items-center gap-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: `${getLLMLabel(msg.llm_used).color}22`,
                      color: getLLMLabel(msg.llm_used).color,
                      border: `1px solid ${getLLMLabel(msg.llm_used).color}44`,
                    }}
                  >
                    {getLLMLabel(msg.llm_used).label}
                  </span>
                  {msg.category && (
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      · {msg.category}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-light)", animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-light)", animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: "var(--accent-light)", animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="glass border-t px-4 py-3 shrink-0" style={{ borderColor: "var(--border)" }}>
        <div className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Digite sua mensagem... (Enter para enviar)"
            rows={1}
            className="flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 shrink-0"
            style={{ background: "var(--accent)", color: "white" }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
