import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("target_role, current_role, company")
    .eq("id", user.id)
    .single();

  let body: { resume: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.resume?.trim()) {
    return Response.json({ error: "Resume text is required" }, { status: 400 });
  }

  const targetRole = profile?.target_role ?? "a senior engineering role";
  const company = profile?.company ? ` at ${profile.company}` : "";

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are a senior technical recruiter and career coach. Analyse resumes and give honest, actionable gap analysis.`,
    prompt: `The candidate wants to become a "${targetRole}"${company}.

Here is their resume:
---
${body.resume.trim()}
---

Provide a structured gap analysis with these sections:

## ✅ Strengths
List 3-5 things on their resume that are already aligned with the target role.

## ⚠️ Critical Gaps
List the most important missing skills, experiences, or credentials that would prevent them from getting this role. Be specific.

## 📋 Quick Wins
List 3-5 things they can add or improve on their resume right now (certifications, projects, keywords, phrasing).

## 🗺️ Roadmap Alignment
Explain how their current Ascend roadmap milestones address (or don't address) the gaps you found.

Be direct, specific, and encouraging. No fluff.`,
  });

  return result.toTextStreamResponse();
}
