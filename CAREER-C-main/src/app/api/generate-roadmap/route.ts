import { createClient } from "@/lib/supabase/server";
import { generateRoadmap } from "@/lib/ai/roadmap";
import { LadderSchema } from "@/lib/schemas/roadmap";

export async function POST(request: Request) {
  // Check session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { currentRole, targetRole, company } = body as Record<string, unknown>;

  if (!currentRole || typeof currentRole !== "string" || !currentRole.trim()) {
    return Response.json(
      { error: "currentRole is required" },
      { status: 400 }
    );
  }

  if (!targetRole || typeof targetRole !== "string" || !targetRole.trim()) {
    return Response.json({ error: "targetRole is required" }, { status: 400 });
  }

  const companyStr = typeof company === "string" ? company.trim() : undefined;

  // Update profile with role info
  await supabase
    .from("profiles")
    .update({
      target_role: targetRole.trim(),
      current_role: currentRole.trim(),
      company: companyStr ?? "",
    })
    .eq("id", user.id);

  // Generate roadmap via AI
  let rawLadder: unknown;
  try {
    rawLadder = await generateRoadmap(currentRole.trim(), targetRole.trim(), companyStr);
  } catch (err) {
    console.error("[generate-roadmap] AI generation error:", err);
    return Response.json(
      { error: "Roadmap generation failed", detail: String(err) },
      { status: 500 }
    );
  }

  // Zod-validate the result
  const parsed = LadderSchema.safeParse(rawLadder);
  if (!parsed.success) {
    console.error("[generate-roadmap] Schema validation error:", parsed.error);
    return Response.json(
      { error: "Roadmap generation failed", detail: parsed.error.message },
      { status: 500 }
    );
  }

  const ladder = parsed.data;

  // Insert ladder row
  const { data: ladderRow, error: ladderError } = await supabase
    .from("ladders")
    .insert({ user_id: user.id, career_path_json: ladder })
    .select("id")
    .single();

  if (ladderError || !ladderRow) {
    return Response.json(
      { error: "Failed to save ladder" },
      { status: 500 }
    );
  }

  // Insert user_progress rows — first rung active, rest locked
  const progressRows = ladder.rungs.map((rung, index) => ({
    user_id: user.id,
    rung_id: rung.id,
    status: index === 0 ? "active" : "locked",
  }));

  const { error: progressError } = await supabase
    .from("user_progress")
    .insert(progressRows);

  if (progressError) {
    return Response.json(
      { error: "Failed to initialize progress" },
      { status: 500 }
    );
  }

  return Response.json({ ladder });
}
