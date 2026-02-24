export interface Highlight {
  term: string;
  startIndex: number;
  endIndex: number;
  category: "entity" | "number" | "term";
}

export interface AIResponse {
  text: string;
  highlights: Highlight[];
  followups: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  highlights?: Highlight[];
  followups?: string[];
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

export interface APIError {
  message: string;
  code: string;
}
