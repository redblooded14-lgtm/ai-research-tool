import { ChatMessage, AIResponse, APIError } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

interface SendMessageParams {
  messages: Array<{ role: string; content: string }>;
}

async function fetchWithRetry(
  messages: Array<{ role: string; content: string }>,
  attempt = 0
): Promise<AIResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("research", {
      body: { messages },
    });

    if (error) {
      throw new Error(error.message || "Request failed");
    }

    // Check for API error response
    if (data?.error) {
      const apiError = data.error as APIError;
      // Don't retry on 402 or client errors
      if (apiError.code === "PAYMENT_REQUIRED" || apiError.code === "INVALID_REQUEST") {
        throw new Error(apiError.message);
      }
      // Retry on transient errors
      if (attempt < MAX_RETRIES - 1 && (apiError.code === "RATE_LIMIT" || apiError.code === "AI_ERROR")) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        return fetchWithRetry(messages, attempt + 1);
      }
      throw new Error(apiError.message);
    }

    return data as AIResponse;
  } catch (err) {
    if (attempt < MAX_RETRIES - 1) {
      const isTransient =
        err instanceof Error &&
        (err.message.includes("timeout") ||
          err.message.includes("network") ||
          err.message.includes("502") ||
          err.message.includes("503"));

      if (isTransient) {
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
        return fetchWithRetry(messages, attempt + 1);
      }
    }
    throw err;
  }
}

export async function sendResearchMessage(
  params: SendMessageParams
): Promise<AIResponse> {
  return fetchWithRetry(params.messages);
}
