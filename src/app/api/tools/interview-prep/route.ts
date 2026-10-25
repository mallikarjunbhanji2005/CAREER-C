import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { createClient } from "@/lib/supabase/server";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import type { Ladder, ProgressRecord } from "@/types";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { messages: ModelMessage[]; topic?: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles").select("target_role, current_role, company").eq("id", user.id).single();

  const { data: ladderRow } = await supabase
    .from("ladders").select("career_path_json")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).single();

  const { data: progressRows } = await supabase
    .from("user_progress").select("*").eq("user_id", user.id);

  const ladder = ladderRow?.career_path_json as Ladder | undefined;
  const progressMap = new Map<string, ProgressRecord>(
    (progressRows ?? []).map((p: ProgressRecord) => [p.rung_id, p])
  );

  const completedRungs = ladder?.rungs.filter(
    (r) => progressMap.get(r.id)?.status === "completed"
  ) ?? [];

  const activeRung = ladder?.rungs.find(
    (r) => progressMap.get(r.id)?.status === "active"
  );

  const targetRole = profile?.target_role ?? "a senior engineering role";
  const company = profile?.company ? ` at ${profile.company}` : "";

  const completedContext = completedRungs.length > 0
    ? `Completed milestones: ${completedRungs.map((r) => r.title).join(", ")}.`
    : "No milestones completed yet.";

  const activeContext = activeRung
    ? `Currently working on: "${activeRung.title}" — ${activeRung.description}`
    : "";

  const topicContext = body.topic ? `The candidate wants to focus on: "${body.topic}".` : "";

  const result = streamText({
    model: groq("openai/gpt-oss-120b"),
    system: `You are a friendly but rigorous technical interview coach helping a candidate prepare for a "${targetRole}" role${company}.

${completedContext}
${activeContext}
${topicContext}

INSTRUCTIONS:
- Ask one interview question at a time based on their roadmap progress and target role
- After they answer, give specific feedback: what was good, what was missing, a model answer
- Then ask the next question or offer to switch topics
- Mix question types: technical, behavioural, system design, situational
- Keep a conversational, coaching tone — not robotic
- If they ask to switch topics or question types, accommodate immediately`,
    messages: body.messages,
  });

  return result.toTextStreamResponse();
}
