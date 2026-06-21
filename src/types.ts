export type LLMKey = "gemini" | "claude" | "openai";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  llm_used?: string;
  category?: string;
  created_at: string;
}

export interface UserSettings {
  claude_key?: string;
  openai_key?: string;
  gemini_key?: string;
}

export interface ChatRequest {
  input: string;
  user_id?: string;
  claude_key?: string;
  openai_key?: string;
  gemini_key?: string;
}

export interface ChatResponse {
  content: string;
  llm_used: string;
  category: string;
}
