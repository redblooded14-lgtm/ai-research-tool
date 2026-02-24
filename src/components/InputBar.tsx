import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface InputBarProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const InputBar: React.FC<InputBarProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  return (
    <div className="flex items-end gap-2 p-3 border-t border-border bg-card/80 backdrop-blur-sm">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a research question…"
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none bg-background border border-input rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 placeholder:text-muted-foreground disabled:opacity-50 transition-shadow"
        aria-label="Research question input"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="h-10 w-10 rounded-xl gradient-bg text-primary-foreground flex items-center justify-center disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};

export default InputBar;
