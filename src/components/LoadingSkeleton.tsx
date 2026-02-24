import React from "react";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="flex gap-3 animate-slide-up" role="status" aria-label="Loading response">
      <div className="w-8 h-8 rounded-full gradient-bg flex-shrink-0 animate-pulse-glow" />
      <div className="flex-1 space-y-3 py-1">
        <div className="space-y-2">
          <div
            className="h-4 rounded-md bg-muted"
            style={{
              width: "92%",
              background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.08) 50%, hsl(var(--muted)) 75%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 1.5s ease-in-out infinite",
            }}
          />
          <div
            className="h-4 rounded-md bg-muted"
            style={{
              width: "78%",
              background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.08) 50%, hsl(var(--muted)) 75%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 1.5s ease-in-out infinite 0.1s",
            }}
          />
          <div
            className="h-4 rounded-md bg-muted"
            style={{
              width: "65%",
              background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.08) 50%, hsl(var(--muted)) 75%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 1.5s ease-in-out infinite 0.2s",
            }}
          />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-7 w-24 rounded-full bg-muted"
              style={{
                background: "linear-gradient(90deg, hsl(var(--muted)) 25%, hsl(var(--muted-foreground) / 0.08) 50%, hsl(var(--muted)) 75%)",
                backgroundSize: "200% 100%",
                animation: `skeleton-shimmer 1.5s ease-in-out infinite ${0.3 + i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
