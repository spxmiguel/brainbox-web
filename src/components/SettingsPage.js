import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { getUserSettings, upsertUserSettings } from "../lib/supabase";
export default function SettingsPage({ user, onClose }) {
    const [settings, setSettings] = useState({});
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        getUserSettings(user.id).then(({ data }) => {
            if (data)
                setSettings(data);
        });
    }, [user.id]);
    async function handleSave() {
        setLoading(true);
        await upsertUserSettings(user.id, settings);
        setSaved(true);
        setLoading(false);
        setTimeout(() => setSaved(false), 2000);
    }
    function Field({ label, description, field, placeholder, }) {
        return (_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium", children: label }), _jsx("p", { className: "text-xs mt-0.5", style: { color: "var(--muted)" }, children: description })] }), _jsx("input", { type: "password", value: settings[field] ?? "", onChange: (e) => setSettings((s) => ({ ...s, [field]: e.target.value || undefined })), placeholder: placeholder, className: "w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors", style: {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                    } })] }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center p-4", style: { background: "var(--bg)" }, children: _jsxs("div", { className: "w-full max-w-md space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Configura\u00E7\u00F5es" }), _jsx("button", { onClick: onClose, className: "text-sm px-3 py-1.5 rounded-lg", style: { color: "var(--muted)", border: "1px solid var(--border)" }, children: "\u2190 Voltar" })] }), _jsxs("div", { className: "glass rounded-2xl p-6 space-y-5", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-1", style: { color: "var(--accent-light)" }, children: "API Keys" }), _jsx("p", { className: "text-xs", style: { color: "var(--muted)" }, children: "Adicione ao menos a Gemini Key (gratuita no Google AI Studio) para usar o BrainBox." })] }), _jsx(Field, { label: "Gemini API Key", description: "Google AI Studio \u2014 gratuito. Padr\u00E3o para todos.", field: "gemini_key", placeholder: "AIza..." }), _jsx(Field, { label: "Claude API Key", description: "Anthropic \u2014 usado em planejamento e tarefas complexas.", field: "claude_key", placeholder: "sk-ant-..." }), _jsx(Field, { label: "OpenAI API Key", description: "GPT-4o-mini \u2014 usado em c\u00F3digo e debugging.", field: "openai_key", placeholder: "sk-..." }), _jsx("button", { onClick: handleSave, disabled: loading, className: "w-full py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50", style: { background: "var(--accent)", color: "white" }, children: saved ? "Salvo!" : loading ? "Salvando..." : "Salvar" })] }), _jsxs("div", { className: "glass rounded-2xl p-4 text-xs space-y-1", style: { color: "var(--muted)" }, children: [_jsx("p", { className: "font-medium", style: { color: "var(--text)" }, children: "Como funciona o orquestrador" }), _jsx("p", { children: "\u2022 C\u00F3digo/debug \u2192 OpenAI (GPT-4o-mini)" }), _jsx("p", { children: "\u2022 Planejamento/arquitetura \u2192 Claude (Haiku)" }), _jsx("p", { children: "\u2022 Matem\u00E1tica/mockup/geral \u2192 Gemini Flash 2.0" }), _jsx("p", { children: "\u2022 Sem key \u2192 erro (ao menos Gemini \u00E9 obrigat\u00F3rio)" })] })] }) }));
}
