import React from "react";
import { ChatMessage } from "@/types/chat";
import HighlightedText from "./HighlightedText";
import { AlertCircle, RotateCcw, User, Sparkles } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: () => void;
  onFollowUp?: (question: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onRetry, onFollowUp }) => {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-secondary text-secondary-foreground"
            : "gradient-bg text-primary-foreground"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className={`flex-1 max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`inline-block rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-card text-card-foreground card-shadow border border-border rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <span>{message.content}</span>
          ) : (
            <HighlightedText
              text={message.content}
              highlights={message.highlights || []}
            />
          )}
        </div>

        {/* Error */}
        {message.error && (
          <div className="mt-2 flex items-center gap-2 text-destructive text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4" />
            <span>{message.error}</span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                aria-label="Retry request"
              >
                <RotateCcw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}

        {/* Follow-ups */}
        {message.followups && message.followups.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
            {message.followups.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp?.(q)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                aria-label={`Follow up: ${q}`}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`mt-1 text-[10px] text-muted-foreground ${isUser ? "text-right" : ""}`}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
