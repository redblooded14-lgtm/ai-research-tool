import React, { useState } from "react";
import ChatModal from "@/components/ChatModal";
import { Sparkles, Search, Zap, BookOpen, ArrowRight } from "lucide-react";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-foreground">ResearchAI</span>
        </div>
        <button
          onClick={() => setChatOpen(true)}
          className="gradient-bg text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          aria-label="Open Research Assistant"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Research</span>
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl text-center space-y-8">
          {/* Glow orb */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full gradient-bg opacity-20 blur-2xl animate-pulse-glow" />
            <div className="relative w-24 h-24 rounded-2xl gradient-bg flex items-center justify-center glow-shadow">
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground">
              AI-Powered
              <br />
              <span className="gradient-text">Research Assistant</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Ask any question and get structured answers with highlighted key terms, 
              follow-up suggestions, and exportable results.
            </p>
          </div>

          <button
            onClick={() => setChatOpen(true)}
            className="inline-flex items-center gap-3 gradient-bg text-primary-foreground px-8 py-4 rounded-2xl text-base font-semibold hover:opacity-90 transition-opacity glow-shadow group"
            aria-label="Start researching"
          >
            <Search className="w-5 h-5" />
            Start Researching
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            {[
              {
                icon: <Search className="w-5 h-5" />,
                title: "Smart Highlights",
                desc: "Key entities, numbers, and terms are automatically highlighted",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "Follow-up Chips",
                desc: "AI suggests related questions to deepen your research",
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                title: "Export Results",
                desc: "Copy, download as text, or save as PDF with highlights",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-xl bg-card border border-border card-shadow text-left space-y-2 hover:border-primary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-xs text-muted-foreground border-t border-border/50">
        Built with Lovable · Powered by Gemini Flash
      </footer>

      {/* Chat Modal */}
      <ChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
