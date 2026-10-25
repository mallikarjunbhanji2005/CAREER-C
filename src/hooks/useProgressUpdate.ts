"use client";

import { useCallback, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/components/verify/MessageBubble";

interface UseProgressUpdateOptions {
  rungId: string;
  allRungIds: string[];
}

interface UseProgressUpdateReturn {
  updateProgress: (messages: ChatMessage[]) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useProgressUpdate({
  rungId,
  allRungIds,
}: UseProgressUpdateOptions): UseProgressUpdateReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback(
    async (messages: ChatMessage[]) => {
      setIsUpdating(true);
      setError(null);

      const supabase = createClient();
      const transcript = messages
        .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.content}`)
        .join("\n\n");

      try {
        // Mark current rung as completed and save transcript
        const { error: updateError } = await supabase
          .from("user_progress")
          .update({
            status: "completed",
            verification_transcript: transcript,
          })
          .eq("rung_id", rungId);

        if (updateError) throw updateError;

        // Unlock the next rung if one exists
        const currentIndex = allRungIds.indexOf(rungId);
        const nextRungId = allRungIds[currentIndex + 1];

        if (nextRungId) {
          const { error: nextError } = await supabase
            .from("user_progress")
            .update({ status: "active" })
            .eq("rung_id", nextRungId);

          if (nextError) throw nextError;
        }
      } catch (err) {
        setError((err as Error).message ?? "Failed to update progress");
      } finally {
        setIsUpdating(false);
      }
    },
    [rungId, allRungIds]
  );

  return { updateProgress, isUpdating, error };
}
