import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from "react";
import { sendMessage, getLLMLabel } from "../lib/llm";
import { saveMessage, getMessages, clearMessages, getUserSettings, isSupabaseConfigured } from "../lib/supabase";
export default function ChatPage({ user, onOpenSettings, onSignOut }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({});
    const bottomRef = useRef(null);
    useEffect(() => {
        loadMessages();
        loadSettings();
    }, [user.id]);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    async function loadMessages() {
        const { data } = await getMessages(user.id, 100);
        if (data)
            setMessages(data);
    }
    async function loadSettings() {
        const { data } = await getUserSettings(user.id);
        if (data)
            setSettings(data);
    }
    const send = useCallback(async () => {
        const text = input.trim();
        if (!text || loading)
            return;
        setInput("");
        const userMsg = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
        };
        setMessages((m) => [...m, userMsg]);
        setLoading(true);
        await saveMessage(user.id, "user", text);
        try {
            const res = await sendMessage({
                input: text,
                claude_key: settings.claude_key,
                openai_key: settings.openai_key,
                gemini_key: settings.gemini_key,
            });
            const botMsg = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: res.content,
                llm_used: res.llm_used,
                category: res.category,
                created_at: new Date().toISOString(),
            };
            setMessages((m) => [...m, botMsg]);
            await saveMessage(user.id, "assistant", res.content, res.llm_used, res.category);
        }
        catch (e) {
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
        }
        finally {
            setLoading(false);
        }
    }, [input, loading, settings, user.id]);
    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }
    async function handleClear() {
        await clearMessages(user.id);
        setMessages([]);
    }
    const isLocal = !isSupabaseConfigured();
    const hasNoKeys = !settings.gemini_key && !settings.claude_key && !settings.openai_key;
    return (_jsxs("div", { className: "flex flex-col h-full", style: { background: "var(--bg)" }, children: [_jsxs("header", { className: "glass flex items-center justify-between px-4 py-3 border-b shrink-0", style: { borderColor: "var(--border)" }, children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-lg", children: "\uD83E\uDDE0" }), _jsx("span", { className: "font-semibold gradient-text", children: "BrainBox" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [messages.length > 0 && (_jsx("button", { onClick: handleClear, className: "text-xs px-3 py-1.5 rounded-lg transition-colors", style: { color: "var(--muted)", border: "1px solid var(--border)" }, children: "Limpar" })), _jsx("button", { onClick: onOpenSettings, className: "text-xs px-3 py-1.5 rounded-lg transition-colors", style: { color: "var(--muted)", border: "1px solid var(--border)" }, children: "\u2699 Config" }), !isLocal && (_jsx("button", { onClick: onSignOut, className: "text-xs px-3 py-1.5 rounded-lg transition-colors", style: { color: "var(--muted)", border: "1px solid var(--border)" }, children: "Sair" }))] })] }), hasNoKeys && (_jsxs("div", { className: "px-4 py-2 text-xs text-center shrink-0", style: { background: "rgba(234,179,8,0.15)", color: "#eab308", borderBottom: "1px solid rgba(234,179,8,0.3)" }, children: ["Configure sua", " ", _jsx("button", { onClick: onOpenSettings, className: "underline font-semibold", children: "Gemini API Key" }), " ", "em Config para usar o BrainBox"] })), _jsxs("div", { className: "flex-1 overflow-y-auto px-4 py-4 space-y-4", children: [messages.length === 0 && (_jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center space-y-3 py-20", children: [_jsx("div", { className: "text-4xl", children: "\uD83E\uDDE0" }), _jsx("h2", { className: "text-xl font-semibold gradient-text", children: "BrainBox pronto" }), _jsx("p", { className: "text-sm max-w-xs", style: { color: "var(--muted)" }, children: "Pergunte qualquer coisa. O orquestrador escolhe a melhor IA automaticamente." }), isLocal && (_jsx("p", { className: "text-xs", style: { color: "var(--muted)" }, children: "Modo local \u2014 hist\u00F3rico salvo no navegador" }))] })), messages.map((msg) => (_jsx("div", { className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`, children: _jsxs("div", { className: `max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user"
                                ? "text-white"
                                : "glass"}`, style: msg.role === "user"
                                ? { background: "var(--accent)" }
                                : undefined, children: [_jsx("p", { className: "text-sm whitespace-pre-wrap leading-relaxed", children: msg.content }), msg.llm_used && (_jsxs("div", { className: "mt-2 flex items-center gap-1", children: [_jsx("span", { className: "text-xs px-2 py-0.5 rounded-full", style: {
                                                background: `${getLLMLabel(msg.llm_used).color}22`,
                                                color: getLLMLabel(msg.llm_used).color,
                                                border: `1px solid ${getLLMLabel(msg.llm_used).color}44`,
                                            }, children: getLLMLabel(msg.llm_used).label }), msg.category && (_jsxs("span", { className: "text-xs", style: { color: "var(--muted)" }, children: ["\u00B7 ", msg.category] }))] }))] }) }, msg.id))), loading && (_jsx("div", { className: "flex justify-start", children: _jsx("div", { className: "glass rounded-2xl px-4 py-3", children: _jsxs("div", { className: "flex gap-1 items-center", children: [_jsx("span", { className: "w-2 h-2 rounded-full animate-bounce", style: { background: "var(--accent-light)", animationDelay: "0ms" } }), _jsx("span", { className: "w-2 h-2 rounded-full animate-bounce", style: { background: "var(--accent-light)", animationDelay: "150ms" } }), _jsx("span", { className: "w-2 h-2 rounded-full animate-bounce", style: { background: "var(--accent-light)", animationDelay: "300ms" } })] }) }) })), _jsx("div", { ref: bottomRef })] }), _jsx("div", { className: "glass border-t px-4 py-3 shrink-0", style: { borderColor: "var(--border)" }, children: _jsxs("div", { className: "flex gap-2 items-end", children: [_jsx("textarea", { value: input, onChange: (e) => setInput(e.target.value), onKeyDown: handleKey, placeholder: "Digite sua mensagem... (Enter para enviar)", rows: 1, className: "flex-1 resize-none rounded-xl px-4 py-3 text-sm outline-none transition-colors", style: {
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid var(--border)",
                                color: "var(--text)",
                                maxHeight: "120px",
                            }, onInput: (e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = Math.min(el.scrollHeight, 120) + "px";
                            } }), _jsx("button", { onClick: send, disabled: !input.trim() || loading, className: "px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 shrink-0", style: { background: "var(--accent)", color: "white" }, children: "\u2192" })] }) })] }));
}
