import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/types/chat";
import { sendResearchMessage } from "@/lib/ai";
import MessageBubble from "./MessageBubble";
import LoadingSkeleton from "./LoadingSkeleton";
import InputBar from "./InputBar";
import ExportActions from "./ExportActions";
import { X, Sparkles, Trash2 } from "lucide-react";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
}

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const STORAGE_KEY = "research-chat-messages";

function loadMessages(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
  } catch {}
  return [];
}

const ChatModal: React.FC<ChatModalProps> = ({ open, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => generateId());

  // Persist messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<number>(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Debounce: 500ms
      const now = Date.now();
      if (now - lastRequestRef.current < 500) return;
      lastRequestRef.current = now;

      const userMsg: ChatMessage = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      try {
        const apiMessages = messages
          .filter((m) => !m.isLoading && !m.error)
          .map((m) => ({ role: m.role, content: m.content }));
        apiMessages.push({ role: "user", content });

        const response = await sendResearchMessage({ messages: apiMessages });

        const assistantMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: response.text,
          highlights: response.highlights,
          followups: response.followups,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: "",
          timestamp: new Date(),
          error: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        };
        setMessages((prev) => [...prev, errorMsg]);
        console.error("Research error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const handleRetry = useCallback(() => {
    // Find last user message and retry
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) {
      // Remove last error message
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.error) return prev.slice(0, -1);
        return prev;
      });
      sendMessage(lastUser.content);
    }
  }, [messages, sendMessage]);

  const handleClear = () => {
    setMessages([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" role="dialog" aria-modal="true" aria-label="Research Assistant">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[85vh] md:h-[80vh] bg-background border border-border rounded-2xl flex flex-col overflow-hidden card-shadow animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-display font-semibold text-foreground">Research Assistant</h2>
              <p className="text-[10px] text-muted-foreground">Powered by AI · Gemini Flash</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ExportActions messages={messages} sessionId={sessionId} />
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Clear conversation"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center glow-shadow">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground">Ask me anything</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  I'll research your question and highlight key findings with follow-up suggestions.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                {[
                  "What are the latest trends in quantum computing?",
                  "Explain CRISPR gene editing",
                  "Compare React vs Vue in 2024",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              onRetry={msg.error ? handleRetry : undefined}
              onFollowUp={sendMessage}
            />
          ))}

          {isLoading && <LoadingSkeleton />}
        </div>

        {/* Input */}
        <InputBar onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default ChatModal;
