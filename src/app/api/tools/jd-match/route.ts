import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import type { Ladder, ProgressRecord } from "@/types";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { jd: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.jd?.trim()) {
    return Response.json({ error: "Job description is required" }, { status: 400 });
  }

  // Load ladder + progress for context
  const { data: ladderRow } = await supabase
    .from("ladders").select("career_path_json")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single();

  const { data: progressRows } = await supabase
    .from("user_progress").select("*").eq("user_id", user.id);

  const ladder = ladderRow?.career_path_json as Ladder | undefined;
  const progressMap = new Map<string, ProgressRecord>(
    (progressRows ?? []).map((p: ProgressRecord) => [p.rung_id, p])
  );

  const roadmapContext = ladder
    ? ladder.rungs.map((r) => {
        const status = progressMap.get(r.id)?.status ?? "locked";
        return `- [${status.toUpperCase()}] ${r.title}: ${r.description}`;
      }).join("\n")
    : "No roadmap available.";

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: `You are a senior technical recruiter helping candidates understand how ready they are for specific job postings.`,
    prompt: `Here is the job description:
---
${body.jd.trim()}
---

Here is the candidate's current roadmap progress:
---
${roadmapContext}
---

Provide a structured match report:

## 🎯 Match Score
Give an honest percentage match (0-100%) and a one-line summary of why.

## ✅ Requirements You Already Meet
List specific JD requirements that their completed or active milestones cover.

## ❌ Requirements You're Missing
List specific JD requirements not covered by their roadmap yet.

## 💡 What to Do Before Applying
Give 3-5 concrete actions they should take (from their roadmap or outside it) before applying.

## ⏱️ Readiness Timeline
Based on their current progress, estimate how many weeks/months until they'd be a strong candidate.

Be honest and specific. Reference actual milestone names from their roadmap.`,
  });

  return result.toTextStreamResponse();
}
