"use client";

import { useState, useCallback, useRef } from "react";
import { VerdictSchema } from "@/lib/schemas/verification";
import type { VerificationVerdict } from "@/types";
import type { ChatMessage } from "@/components/verify/MessageBubble";

interface UseVerificationChatOptions {
  rungId: string;
}

interface UseVerificationChatReturn {
  messages: ChatMessage[];
  streamingContent: string;
  status: "idle" | "streaming" | "done" | "error";
  verdict: VerificationVerdict | null;
  parseError: boolean;
  sendMessage: (text: string) => Promise<void>;
  reset: () => void;
}

let idCounter = 0;
function nextId() {
  return `msg_${++idCounter}_${Date.now()}`;
}

export function useVerificationChat({
  rungId,
}: UseVerificationChatOptions): UseVerificationChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [verdict, setVerdict] = useState<VerificationVerdict | null>(null);
  const [parseError, setParseError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      if (status === "streaming" || verdict !== null) return;

      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        content: text,
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setStreamingContent("");
      setStatus("streaming");

      // Build model messages for the API (role + content only)
      const modelMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      abortRef.current = new AbortController();

      try {
        const response = await fetch(`/api/verify/${rungId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: modelMessages }),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamingContent(accumulated);
        }

        // Finalize: move streaming content into messages
        const assistantMessage: ChatMessage = {
          id: nextId(),
          role: "assistant",
          content: accumulated,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");

        // Attempt to parse as verdict
        try {
          const parsed = VerdictSchema.parse(JSON.parse(accumulated.trim()));
          setVerdict(parsed);
          setStatus("done");
        } catch {
          // Not a verdict — normal message, keep going
          setStatus("idle");
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setParseError(true);
        setStatus("error");
      }
    },
    [messages, rungId, status, verdict]
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingContent("");
    setStatus("idle");
    setVerdict(null);
    setParseError(false);
  }, []);

  return { messages, streamingContent, status, verdict, parseError, sendMessage, reset };
}
