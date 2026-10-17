"use client";

import { useMilestoneNote } from "@/hooks/useMilestoneNote";
import { StickyNote } from "lucide-react";

interface MilestoneNoteProps {
  rungId: string;
}

export function MilestoneNote({ rungId }: MilestoneNoteProps) {
  const { content, handleChange, saved, saving } = useMilestoneNote(rungId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <StickyNote className="size-3.5" />
          My Notes
        </div>
        <span className="text-xs text-muted-foreground">
          {saving ? "Saving…" : saved ? "Saved" : "Unsaved"}
        </span>
      </div>
      <textarea
        value={content}
        onChange={(e) => handleChange(e.target.value)}
        rows={4}
        placeholder="Jot down what you learned, questions you have, or things to revisit…"
        className="w-full rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
      />
    </div>
  );
}
