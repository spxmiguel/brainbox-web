import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { signInWithGoogle, signInAnonymously } from "../lib/supabase";
export default function AuthPage() {
    const [loading, setLoading] = useState(null);
    const [error, setError] = useState(null);
    async function handleGoogle() {
        setLoading("google");
        setError(null);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setLoading(null);
        }
    }
    async function handleAnon() {
        setLoading("anon");
        setError(null);
        const { error } = await signInAnonymously();
        if (error) {
            setError(error.message);
            setLoading(null);
        }
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4", style: { background: "var(--bg)" }, children: _jsxs("div", { className: "w-full max-w-sm space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "text-5xl mb-4", children: "\uD83E\uDDE0" }), _jsx("h1", { className: "text-3xl font-bold gradient-text", children: "BrainBox" }), _jsx("p", { className: "text-sm", style: { color: "var(--muted)" }, children: "Seu Jarvis pessoal \u2014 multi-IA, orquestrado" })] }), _jsxs("div", { className: "glass rounded-2xl p-6 space-y-4", children: [_jsxs("button", { onClick: handleGoogle, disabled: loading !== null, className: "w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50", style: { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }, children: [loading === "google" ? (_jsx("span", { className: "animate-spin", children: "\u27F3" })) : (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 18 18", fill: "none", children: [_jsx("path", { d: "M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z", fill: "#4285F4" }), _jsx("path", { d: "M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z", fill: "#34A853" }), _jsx("path", { d: "M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z", fill: "#FBBC05" }), _jsx("path", { d: "M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z", fill: "#EA4335" })] })), "Entrar com Google"] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "flex-1 h-px", style: { background: "var(--border)" } }), _jsx("span", { className: "text-xs", style: { color: "var(--muted)" }, children: "ou" }), _jsx("div", { className: "flex-1 h-px", style: { background: "var(--border)" } })] }), _jsx("button", { onClick: handleAnon, disabled: loading !== null, className: "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm", style: { color: "var(--muted)", border: "1px solid var(--border)" }, children: loading === "anon" ? "Entrando..." : "Continuar sem conta" }), error && (_jsx("p", { className: "text-xs text-red-400 text-center", children: error }))] }), _jsx("p", { className: "text-xs text-center", style: { color: "var(--muted)" }, children: "Sem conta, hist\u00F3rico n\u00E3o \u00E9 salvo na nuvem" })] }) }));
}
