import type { VercelRequest, VercelResponse } from "@vercel/node";

interface ChatRequest {
  input: string;
  claude_key?: string;
  openai_key?: string;
  gemini_key?: string;
}

function classify(input: string): { llm: string; category: string } {
  const lower = input.toLowerCase();

  if (
    lower.includes("mockup") ||
    lower.includes("wireframe") ||
    lower.includes("tive uma ideia") ||
    lower.includes("cria um design")
  ) {
    return { llm: "gemini", category: "mockup" };
  }
  if (
    lower.includes("código") ||
    lower.includes("codigo") ||
    lower.includes("função") ||
    lower.includes("bug") ||
    lower.includes("script") ||
    lower.includes("debug") ||
    lower.includes("refatora") ||
    lower.includes("program")
  ) {
    return { llm: "openai", category: "code" };
  }
  if (
    lower.includes("plan") ||
    lower.includes("arquitetura") ||
    lower.includes("estrategia") ||
    lower.includes("estratégia") ||
    lower.includes("implementa") ||
    lower.includes("cria projeto") ||
    lower.includes("desenvolve")
  ) {
    return { llm: "claude", category: "planning" };
  }
  if (
    lower.includes("calcul") ||
    lower.includes("integral") ||
    lower.includes("equação") ||
    lower.includes("matemat") ||
    lower.includes("resolv")
  ) {
    return { llm: "gemini", category: "math" };
  }

  return { llm: "gemini", category: "general" };
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "(sem resposta)";
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude error: ${res.status}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "(sem resposta)";
}

async function callOpenAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "(sem resposta)";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { input, claude_key, openai_key, gemini_key } = req.body as ChatRequest;

  if (!input?.trim()) return res.status(400).json({ error: "Input required" });

  const { llm, category } = classify(input);

  const sharedGemini = process.env.GEMINI_API_KEY;
  const sharedClaude = process.env.CLAUDE_API_KEY;
  const sharedOpenAI = process.env.OPENAI_API_KEY;

  try {
    let content: string;
    let llm_used = llm;

    if (llm === "claude" && (claude_key || sharedClaude)) {
      content = await callClaude(input, (claude_key || sharedClaude)!);
    } else if (llm === "openai" && (openai_key || sharedOpenAI)) {
      content = await callOpenAI(input, (openai_key || sharedOpenAI)!);
    } else {
      // Always fallback to Gemini (free tier key from env)
      const key = gemini_key || sharedGemini;
      if (!key) {
        return res.status(503).json({
          error: "Nenhuma API key configurada. Adicione uma Gemini key em Configurações.",
        });
      }
      content = await callGemini(input, key);
      llm_used = "gemini";
    }

    return res.status(200).json({ content, llm_used, category });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);

    // Retry with Gemini on any LLM failure
    const key = gemini_key || sharedGemini;
    if (key && llm !== "gemini") {
      try {
        const content = await callGemini(input, key);
        return res.status(200).json({ content, llm_used: "gemini_fallback", category });
      } catch {
        // fall through
      }
    }

    return res.status(500).json({ error: msg });
  }
}
