"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useStreamingResponse } from "@/hooks/useStreamingResponse";
import { Briefcase, Loader2 } from "lucide-react";

export function JdMatchTool() {
  const [jd, setJd] = useState("");
  const { content, loading, error, stream, reset } = useStreamingResponse();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jd.trim()) return;
    await stream("/api/tools/jd-match", { jd });
  }

  const hasResult = content.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Job Description Matcher</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste a job description and see exactly how your current progress maps to it.
        </p>
      </div>

      {!hasResult ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="jd" className="text-sm font-medium text-foreground">
              Job Description
            </label>
            <textarea
              id="jd"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={16}
              disabled={loading}
              placeholder="Paste the full job description here…"
              className="w-full rounded-lg border border-border bg-input/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading || !jd.trim()} className="w-full" size="lg">
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Matching…</>
            ) : (
              "Match Against My Progress"
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card px-6 py-5">
            <MarkdownContent content={content} />
            {loading && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Generating…
              </div>
            )}
          </div>
          {!loading && (
            <Button variant="outline" size="sm" onClick={() => { reset(); setJd(""); }}>
              Match another job
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
