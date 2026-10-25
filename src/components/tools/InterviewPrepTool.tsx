"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageList } from "@/components/verify/MessageList";
import { GraduationCap, RefreshCw } from "lucide-react";
import type { ChatMessage } from "@/components/verify/MessageBubble";

// Reuse the same streaming chat pattern but pointed at interview-prep endpoint
function useInterviewChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState("");
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const abortRef = useRef<AbortController | null>(null);

  let idCounter = 0;
  const nextId = () => `msg_${++idCounter}_${Date.now()}`;

  const sendMessage = useCallback(async (text: string, topic?: string) => {
    if (status === "streaming") return;

    const userMsg: ChatMessage = { id: nextId(), role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setStreamingContent("");
    setStatus("streaming");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/tools/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          topic,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No body");

      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamingContent(acc);
      }

      setMessages((prev) => [...prev, { id: nextId(), role: "assistant", content: acc }]);
      setStreamingContent("");
      setStatus("idle");
    } catch (err) {
      if ((err as Error).name !== "AbortError") setStatus("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingContent("");
    setStatus("idle");
  }, []);

  return { messages, streamingContent, status, sendMessage, reset };
}

const TOPICS = ["System Design", "Behavioural", "Coding Concepts", "Leadership", "Architecture"];

export function InterviewPrepTool() {
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, streamingContent, status, sendMessage, reset } = useInterviewChat();

  async function handleStart(topic: string) {
    setStarted(true);
    await sendMessage(`Let's start with ${topic} questions. Ask me the first question.`, topic);
    inputRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || status === "streaming") return;
    setInput("");
    await sendMessage(text);
    inputRef.current?.focus();
  }

  function handleReset() {
    reset();
    setStarted(false);
    setInput("");
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="size-5 text-primary" />
          <div>
            <h1 className="font-semibold text-foreground">Interview Prep</h1>
            <p className="text-xs text-muted-foreground">Practice questions tailored to your roadmap</p>
          </div>
        </div>
        {started && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1.5">
            <RefreshCw className="size-3.5" /> New session
          </Button>
        )}
      </div>

      {!started ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Choose a topic to start a practice session. The AI will ask questions based on your roadmap progress and give feedback on your answers.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleStart(topic)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Or type a custom topic below and press Enter</p>
          <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) handleStart(input.trim()); }}
            className="flex gap-2 w-full max-w-sm">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Custom topic…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm" disabled={!input.trim()}>Start</Button>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto min-h-0">
            <MessageList messages={messages} streamingContent={streamingContent} />
          </div>
          <form onSubmit={handleSubmit}
            className="flex gap-2 border-t border-border px-4 py-3 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status === "streaming"}
              placeholder={status === "streaming" ? "AI is responding…" : "Your answer…"}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <Button type="submit" size="sm" disabled={status === "streaming" || !input.trim()}>
              Send
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
