import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import type { UserSettings } from "../types";
import { getUserSettings, upsertUserSettings } from "../lib/supabase";

interface Props {
  user: User;
  onClose: () => void;
}

export default function SettingsPage({ user, onClose }: Props) {
  const [settings, setSettings] = useState<UserSettings>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserSettings(user.id).then(({ data }) => {
      if (data) setSettings(data as UserSettings);
    });
  }, [user.id]);

  async function handleSave() {
    setLoading(true);
    await upsertUserSettings(user.id, settings);
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  }

  function Field({
    label,
    description,
    field,
    placeholder,
  }: {
    label: string;
    description: string;
    field: keyof UserSettings;
    placeholder: string;
  }) {
    return (
      <div className="space-y-1.5">
        <div>
          <label className="text-sm font-medium">{label}</label>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{description}</p>
        </div>
        <input
          type="password"
          value={settings[field] ?? ""}
          onChange={(e) => setSettings((s) => ({ ...s, [field]: e.target.value || undefined }))}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Configurações</h2>
          <button
            onClick={onClose}
            className="text-sm px-3 py-1.5 rounded-lg"
            style={{ color: "var(--muted)", border: "1px solid var(--border)" }}
          >
            ← Voltar
          </button>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--accent-light)" }}>
              API Keys
            </h3>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              Adicione ao menos a Gemini Key (gratuita no Google AI Studio) para usar o BrainBox.
            </p>
          </div>

          <Field
            label="Gemini API Key"
            description="Google AI Studio — gratuito. Padrão para todos."
            field="gemini_key"
            placeholder="AIza..."
          />
          <Field
            label="Claude API Key"
            description="Anthropic — usado em planejamento e tarefas complexas."
            field="claude_key"
            placeholder="sk-ant-..."
          />
          <Field
            label="OpenAI API Key"
            description="GPT-4o-mini — usado em código e debugging."
            field="openai_key"
            placeholder="sk-..."
          />

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-sm transition-all disabled:opacity-50"
            style={{ background: "var(--accent)", color: "white" }}
          >
            {saved ? "Salvo!" : loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

        <div className="glass rounded-2xl p-4 text-xs space-y-1" style={{ color: "var(--muted)" }}>
          <p className="font-medium" style={{ color: "var(--text)" }}>Como funciona o orquestrador</p>
          <p>• Código/debug → OpenAI (GPT-4o-mini)</p>
          <p>• Planejamento/arquitetura → Claude (Haiku)</p>
          <p>• Matemática/mockup/geral → Gemini Flash 2.0</p>
          <p>• Sem key → erro (ao menos Gemini é obrigatório)</p>
        </div>
      </div>
    </div>
  );
}
