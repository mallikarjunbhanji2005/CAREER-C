import { streamText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/ai/interviewer";
import type { Rung } from "@/types";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  request: Request,
  { params }: { params: Promise<{ rung_id: string }> }
) {
  // Check session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rung_id } = await params;

  // Load the user's ladder from Supabase
  const { data: ladderRow, error: ladderError } = await supabase
    .from("ladders")
    .select("career_path_json")
    .eq("user_id", user.id)
    .single();

  if (ladderError || !ladderRow) {
    return Response.json({ error: "Ladder not found" }, { status: 404 });
  }

  // Find the rung in the career path JSON
  const careerPath = ladderRow.career_path_json as { rungs: Rung[] };
  const rung = careerPath.rungs.find((r: Rung) => r.id === rung_id);

  if (!rung) {
    return Response.json({ error: "Rung not found" }, { status: 404 });
  }

  // Parse request body
  let messages: ModelMessage[];
  try {
    const body = await request.json();
    messages = body.messages as ModelMessage[];
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Build system prompt and stream response
  const systemPrompt = buildSystemPrompt(rung);

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: systemPrompt,
    messages,
  });

  return result.toTextStreamResponse();
}
