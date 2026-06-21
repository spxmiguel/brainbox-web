export async function sendMessage(req) {
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
    }
    return res.json();
}
export const LLM_LABELS = {
    gemini: { label: "Gemini", color: "#60a5fa" },
    gemini_fallback: { label: "Gemini (fallback)", color: "#93c5fd" },
    claude: { label: "Claude", color: "#a78bfa" },
    openai: { label: "OpenAI", color: "#4ade80" },
};
export function getLLMLabel(key) {
    return LLM_LABELS[key] ?? { label: key, color: "#94a3b8" };
}
