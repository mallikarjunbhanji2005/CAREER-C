"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { useStreamingResponse } from "@/hooks/useStreamingResponse";
import { FileText, Loader2 } from "lucide-react";

export function ResumeGapTool() {
  const [resume, setResume] = useState("");
  const { content, loading, error, stream, reset } = useStreamingResponse();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resume.trim()) return;
    await stream("/api/tools/resume-gap", { resume });
  }

  const hasResult = content.length > 0;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Resume Gap Analyzer</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Paste your resume and get an honest gap analysis against your target role.
        </p>
      </div>

      {!hasResult ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="resume" className="text-sm font-medium text-foreground">
              Your Resume
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              rows={16}
              disabled={loading}
              placeholder="Paste your full resume text here…"
              className="w-full rounded-lg border border-border bg-input/30 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none font-mono"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={loading || !resume.trim()} className="w-full" size="lg">
            {loading ? (
              <><Loader2 className="size-4 animate-spin" /> Analysing…</>
            ) : (
              "Analyse My Resume"
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
            <Button variant="outline" size="sm" onClick={() => { reset(); setResume(""); }}>
              Analyse another resume
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
