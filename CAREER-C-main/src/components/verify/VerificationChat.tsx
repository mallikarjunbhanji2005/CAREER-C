"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageList } from "./MessageList";
import { VerdictBanner } from "./VerdictBanner";
import { useVerificationChat } from "@/hooks/useVerificationChat";
import { useProgressUpdate } from "@/hooks/useProgressUpdate";
import type { Rung } from "@/types";

interface VerificationChatProps {
  rung: Rung;
  allRungIds: string[];
}

export function VerificationChat({ rung, allRungIds }: VerificationChatProps) {
  const [input, setInput] = useState("");
  const progressSavedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, streamingContent, status, verdict, parseError, sendMessage, reset } =
    useVerificationChat({ rungId: rung.id });

  const { updateProgress, isUpdating } = useProgressUpdate({
    rungId: rung.id,
    allRungIds,
  });

  // Save progress when a pass verdict is received
  useEffect(() => {
    if (verdict?.verdict === "pass" && !progressSavedRef.current) {
      progressSavedRef.current = true;
      updateProgress(messages);
    }
  }, [verdict, messages, updateProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming") return;
    setInput("");
    await sendMessage(text);
    inputRef.current?.focus();
  };

  const handleRetry = () => {
    progressSavedRef.current = false;
    reset();
  };

  const isInputDisabled = status === "streaming" || verdict !== null || isUpdating;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 shrink-0">
        <h1 className="font-semibold text-foreground">{rung.title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{rung.description}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList messages={messages} streamingContent={streamingContent} />
      </div>

      {/* Verdict banner */}
      {verdict && (
        <div className="px-4 pb-4 shrink-0">
          <VerdictBanner verdict={verdict} onRetry={handleRetry} />
        </div>
      )}

      {/* Parse error */}
      {parseError && !verdict && (
        <div className="px-4 pb-2 shrink-0">
          <p className="text-sm text-red-400">
            Something went wrong.{" "}
            <button className="underline" onClick={handleRetry}>
              Retry
            </button>
          </p>
        </div>
      )}

      {/* Input */}
      {!verdict && (
        <form
          onSubmit={handleSubmit}
          className="flex gap-2 border-t border-border px-4 py-3 shrink-0"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isInputDisabled}
            placeholder={
              status === "streaming" ? "AI is responding…" : "Type your answer…"
            }
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <Button type="submit" size="sm" disabled={isInputDisabled || !input.trim()}>
            Send
          </Button>
        </form>
      )}
    </div>
  );
}
