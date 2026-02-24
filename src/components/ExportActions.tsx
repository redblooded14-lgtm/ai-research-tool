import React from "react";
import { ChatMessage } from "@/types/chat";
import { Copy, FileText, FileDown, X } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ExportActionsProps {
  messages: ChatMessage[];
  sessionId: string;
}

function formatMessagesAsText(messages: ChatMessage[]): string {
  const lines = [
    `AI Research Assistant — Session ${new Date().toISOString()}`,
    `Session ID: ${messages.length > 0 ? "session" : "empty"}`,
    "═".repeat(50),
    "",
  ];

  for (const msg of messages) {
    if (msg.role === "system") continue;
    const role = msg.role === "user" ? "YOU" : "ASSISTANT";
    const time = msg.timestamp.toLocaleTimeString();
    lines.push(`[${time}] ${role}:`);
    lines.push(msg.content);
    if (msg.highlights && msg.highlights.length > 0) {
      lines.push(`  Key terms: ${msg.highlights.map((h) => h.term).join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

const ExportActions: React.FC<ExportActionsProps> = ({ messages, sessionId }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatMessagesAsText(messages));
      toast.success("Conversation copied to clipboard");
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleTxt = () => {
    const text = formatMessagesAsText(messages);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `research-${sessionId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded as .txt");
  };

  const handlePdf = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(88, 28, 135); // Deep violet
    doc.text("AI Research Assistant", margin, y);
    y += 8;

    // Metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Date: ${new Date().toLocaleDateString()} | Session: ${sessionId.slice(0, 8)} | Model: Gemini Flash`, margin, y);
    y += 10;

    // Separator
    doc.setDrawColor(88, 28, 135);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    for (const msg of messages) {
      if (msg.role === "system") continue;

      // Check page break
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      const isUser = msg.role === "user";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(isUser ? 0 : 88, isUser ? 128 : 28, isUser ? 128 : 135);
      doc.text(isUser ? "You" : "Research Assistant", margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);

      const lines = doc.splitTextToSize(msg.content, maxWidth);
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5;
      }

      // Highlights as colored text
      if (msg.highlights && msg.highlights.length > 0) {
        y += 2;
        doc.setFontSize(8);
        doc.setTextColor(0, 150, 150); // Cyan
        const terms = `Key terms: ${msg.highlights.map((h) => h.term).join(", ")}`;
        const termLines = doc.splitTextToSize(terms, maxWidth);
        for (const tl of termLines) {
          if (y > 280) { doc.addPage(); y = 20; }
          doc.text(tl, margin, y);
          y += 4;
        }
      }

      y += 6;
    }

    doc.save(`research-${sessionId.slice(0, 8)}.pdf`);
    toast.success("Downloaded as PDF");
  };

  if (messages.filter((m) => m.role !== "system").length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleCopy}
        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Copy conversation to clipboard"
        title="Copy to clipboard"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={handleTxt}
        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Download as text file"
        title="Download .txt"
      >
        <FileText className="w-4 h-4" />
      </button>
      <button
        onClick={handlePdf}
        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Download as PDF"
        title="Download PDF"
      >
        <FileDown className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ExportActions;
