import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert AI Research Assistant. When asked, produce a concise, well-structured answer followed by key highlights and follow-up suggestions. ALWAYS output valid JSON only, in this exact schema: { "text":"...","highlights":[{"term":"...","startIndex":n,"endIndex":m,"category":"entity|number|term"}],"followups":["...","..."] }. The "text" field should contain your full answer. For highlights, identify 3-8 key terms from the text and provide their exact character offsets. Categories: "entity" for proper nouns/organizations/people, "number" for statistics/dates/quantities, "term" for important technical terms. Provide 2-4 relevant follow-up questions in "followups". If you cannot answer, return text with a short note and empty highlights/followups. Output ONLY the JSON object, no markdown, no explanation.`;

function extractFallbackHighlights(text: string) {
  const highlights: Array<{ term: string; startIndex: number; endIndex: number; category: string }> = [];
  // Simple heuristic: find capitalized phrases and numbers
  const patterns = [
    { regex: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g, category: "entity" },
    { regex: /\b\d[\d,.]+%?\b/g, category: "number" },
    { regex: /\b[A-Z]{2,}\b/g, category: "entity" },
  ];

  for (const { regex, category } of patterns) {
    let match;
    while ((match = regex.exec(text)) !== null && highlights.length < 8) {
      highlights.push({
        term: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        category,
      });
    }
  }

  return highlights;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: { message: "Invalid request: messages array required", code: "INVALID_REQUEST" } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: { message: "AI service not configured", code: "CONFIG_ERROR" } }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
      { role: "user", content: "Remember: respond ONLY with the JSON object, no markdown fences, no extra text." },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: { message: "Rate limit exceeded. Please wait a moment and try again.", code: "RATE_LIMIT" } }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: { message: "AI credits depleted. Please add credits to continue.", code: "PAYMENT_REQUIRED" } }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: { message: "AI service temporarily unavailable", code: "AI_ERROR" } }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsed;
    try {
      // Strip markdown fences if present
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI JSON, using fallback. Raw:", rawContent);
      // Fallback: use raw text with heuristic highlights
      const text = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = {
        text,
        highlights: extractFallbackHighlights(text),
        followups: ["Can you elaborate on this?", "What are the key takeaways?"],
      };
    }

    // Validate highlights
    if (!Array.isArray(parsed.highlights)) {
      parsed.highlights = extractFallbackHighlights(parsed.text || "");
    }
    if (!Array.isArray(parsed.followups)) {
      parsed.followups = [];
    }

    const result = {
      text: parsed.text || rawContent,
      highlights: parsed.highlights.slice(0, 10),
      followups: parsed.followups.slice(0, 4),
      usage: aiResult.usage || undefined,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Research endpoint error:", e);
    return new Response(
      JSON.stringify({ error: { message: e instanceof Error ? e.message : "Unknown error", code: "INTERNAL_ERROR" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
