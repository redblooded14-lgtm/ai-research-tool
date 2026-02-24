import React from "react";
import { Highlight } from "@/types/chat";

interface HighlightedTextProps {
  text: string;
  highlights: Highlight[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlights }) => {
  if (!highlights || highlights.length === 0) {
    return <span className="whitespace-pre-wrap">{text}</span>;
  }

  // Sort highlights by startIndex
  const sorted = [...highlights]
    .filter(h => h.startIndex >= 0 && h.endIndex <= text.length && h.startIndex < h.endIndex)
    .sort((a, b) => a.startIndex - b.startIndex);

  // Remove overlapping highlights
  const noOverlap: Highlight[] = [];
  for (const h of sorted) {
    const last = noOverlap[noOverlap.length - 1];
    if (!last || h.startIndex >= last.endIndex) {
      noOverlap.push(h);
    }
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const h of noOverlap) {
    if (h.startIndex > lastIndex) {
      parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex, h.startIndex)}</span>);
    }

    const className =
      h.category === "entity"
        ? "highlight-entity"
        : h.category === "number"
        ? "highlight-number"
        : "highlight-term";

    parts.push(
      <mark key={`h-${h.startIndex}`} className={`${className} font-medium`} title={`${h.category}: ${h.term}`}>
        {text.slice(h.startIndex, h.endIndex)}
      </mark>
    );
    lastIndex = h.endIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }

  return <span className="whitespace-pre-wrap">{parts}</span>;
};

export default HighlightedText;
