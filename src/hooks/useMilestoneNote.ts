"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useMilestoneNote(rungId: string) {
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    fetch(`/api/notes?rung_id=${rungId}`)
      .then((r) => r.json())
      .then((d: { content?: string }) => setContent(d.content ?? ""))
      .catch(() => {});
  }, [rungId]);

  const save = useCallback(async (text: string) => {
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rung_id: rungId, content: text }),
      });
      setSaved(true);
    } catch {
      // silent — will retry on next change
    } finally {
      setSaving(false);
    }
  }, [rungId]);

  const handleChange = useCallback((text: string) => {
    setContent(text);
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(text), 1200);
  }, [save]);

  return { content, handleChange, saved, saving };
}
