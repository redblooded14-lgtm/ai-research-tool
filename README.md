# ResearchAI — AI-Powered Research Assistant

A conversational research assistant that delivers structured, highlighted answers with follow-up suggestions, built with **Lovable** and powered by **Google Gemini 3 Flash**.

**Live Demo:** [https://deep-seek-assist.lovable.app](https://deep-seek-assist.lovable.app)

---

## Features

- **Conversational AI Research** — Ask any question and receive detailed, structured answers in a chat interface.
- **Smart Highlights** — Key entities (people, organizations), numbers (statistics, dates), and technical terms are automatically identified and visually highlighted in responses.
- **Follow-up Suggestions** — The AI generates 2–4 contextual follow-up questions after each answer to help deepen research.
- **Export Options** — Copy responses to clipboard, download the full conversation as a `.txt` file, or export as a styled PDF with highlights preserved.
- **Session Persistence** — Chat history is saved to `sessionStorage` so conversations survive page refreshes within a session.
- **Error Handling & Retries** — Transient failures (rate limits, timeouts, 502/503 errors) are automatically retried with exponential backoff (up to 3 attempts).
- **Responsive Design** — Fully functional on desktop and mobile with a modal-based chat interface.

---

## AI Model: Why Google Gemini 3 Flash?

### The Platform

This app was built with **Lovable**, an AI-powered development platform. Lovable's own editor is powered by a mix of models including Google Gemini and OpenAI GPT-5 variants, which are continuously refined as new models are released.

### The App's AI Model

For the app's research function, we chose **Google Gemini 3 Flash** (`google/gemini-3-flash-preview`). Here's why:

| Factor | Gemini 3 Flash | Alternatives Considered |
|--------|---------------|------------------------|
| **Speed** | Very fast response times — ideal for a conversational research tool where users expect near-instant answers | GPT-5 / Gemini Pro are more powerful but noticeably slower |
| **Cost** | Low cost per request — sustainable for a demo/portfolio app without heavy usage restrictions | Pro-tier models cost significantly more per token |
| **Quality** | Strong reasoning and structured output — reliably returns well-formed JSON with highlights and follow-ups | Nano/Lite models are cheaper but struggle with structured JSON output |
| **Structured Output** | Excellent at following JSON schema instructions, which is critical for the highlight and follow-up system | Some models require more prompt engineering to produce consistent JSON |

**In short:** Gemini 3 Flash sits in the sweet spot — fast enough for real-time chat, smart enough for structured research output, and affordable enough for sustained use.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui components |
| **Backend** | Lovable Cloud (Supabase Edge Functions) |
| **AI Model** | Google Gemini 3 Flash via Lovable AI Gateway |
| **Export** | jsPDF (PDF), html2canvas (screenshots), Clipboard API |
| **State** | React hooks, sessionStorage for chat persistence |

---

## Project Structure

```
src/
├── components/
│   ├── ChatModal.tsx          # Main chat modal with message handling
│   ├── MessageBubble.tsx      # Individual message display with highlights
│   ├── HighlightedText.tsx    # Text rendering with color-coded highlights
│   ├── InputBar.tsx           # Chat input with validation
│   ├── ExportActions.tsx      # Copy / TXT / PDF export buttons
│   ├── LoadingSkeleton.tsx    # Loading state animation
│   └── ui/                    # shadcn/ui component library
├── lib/
│   └── ai.ts                  # AI client with retry logic
├── types/
│   └── chat.ts                # TypeScript interfaces (ChatMessage, AIResponse, Highlight)
├── pages/
│   └── Index.tsx              # Landing page with hero section
└── integrations/
    └── supabase/              # Auto-generated Supabase client

supabase/
└── functions/
    └── research/
        └── index.ts           # Edge function: proxies AI requests with error handling
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or bun)

### Local Installation

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase project credentials in .env

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

See `.env.example` for required variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anonymous/public key |
| `VITE_SUPABASE_URL` | Your Supabase project URL |

> **Note:** The AI functionality requires the Lovable AI Gateway (`LOVABLE_API_KEY`), which is configured as a server-side secret in the edge function environment — it is **not** exposed in the frontend `.env` file.

---

## How It Works

1. **User sends a question** → InputBar validates (non-empty, trimmed) and passes to ChatModal
2. **ChatModal builds context** → Includes full conversation history for multi-turn awareness
3. **Edge function proxies the request** → Adds system prompt instructing Gemini to return structured JSON
4. **Gemini responds with JSON** → Contains `text`, `highlights` (with character offsets & categories), and `followups`
5. **Frontend renders the response** → HighlightedText color-codes entities/numbers/terms; follow-up chips appear below
6. **User can export** → Full conversation exportable as clipboard text, `.txt` file, or styled PDF

---



---

## License

This project was built as part of a submission. All rights reserved.
