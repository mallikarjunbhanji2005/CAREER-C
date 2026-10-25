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
    return Response.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { currentRole, targetRole, company } =
    body as Record<string, unknown>;

  if (
    !currentRole ||
    typeof currentRole !== "string" ||
    !currentRole.trim()
  ) {
    return Response.json(
      { error: "currentRole is required" },
      { status: 400 }
    );
  }

  if (
    !targetRole ||
    typeof targetRole !== "string" ||
    !targetRole.trim()
  ) {
    return Response.json(
      { error: "targetRole is required" },
      { status: 400 }
    );
  }

  const companyStr =
    typeof company === "string" ? company.trim() : undefined;

  // Update profile with role information
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      target_role: targetRole.trim(),
      current_role: currentRole.trim(),
      company: companyStr ?? "",
    })
    .eq("id", user.id);

  if (profileError) {
    console.error(
      "[generate-roadmap] Profile update error:",
      profileError
    );
  }

  // Generate roadmap using AI
  let rawLadder: unknown;

  try {
    rawLadder = await generateRoadmap(
      currentRole.trim(),
      targetRole.trim(),
      companyStr
    );
  } catch (err) {
    console.error(
      "[generate-roadmap] AI generation error:",
      err
    );

    return Response.json(
      {
        error: "Roadmap generation failed",
        detail:
          err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }

  // Validate the generated roadmap
  const parsed = LadderSchema.safeParse(rawLadder);

  if (!parsed.success) {
    console.error(
      "[generate-roadmap] Schema validation error:",
      parsed.error
    );

    return Response.json(
      {
        error: "Roadmap generation failed",
        detail: parsed.error.message,
      },
      { status: 500 }
    );
  }

  const ladder = parsed.data;

  // Save roadmap to Supabase
  const { data: ladderRow, error: ladderError } = await supabase
    .from("ladders")
    .insert({
      user_id: user.id,
      career_path_json: ladder,
    })
    .select("id")
    .single();

  if (ladderError || !ladderRow) {
    console.error(
      "[generate-roadmap] Supabase save error:",
      ladderError
    );

    return Response.json(
      {
        error: "Failed to save ladder",
        detail:
          ladderError?.message ?? "No ladder row returned",
      },
      { status: 500 }
    );
  }

  // Initialize progress: first rung active, others locked
  const progressRows = ladder.rungs.map((rung, index) => ({
    user_id: user.id,
    rung_id: rung.id,
    status: index === 0 ? "active" : "locked",
  }));

  const { error: progressError } = await supabase
    .from("user_progress")
    .insert(progressRows);

  if (progressError) {
    console.error(
      "[generate-roadmap] Progress initialization error:",
      progressError
    );

    return Response.json(
      {
        error: "Failed to initialize progress",
        detail: progressError.message,
      },
      { status: 500 }
    );
  }

  return Response.json({ ladder });
}