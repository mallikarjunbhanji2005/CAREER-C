import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const rungId = searchParams.get("rung_id");
  if (!rungId) return Response.json({ error: "rung_id required" }, { status: 400 });

  const { data, error } = await supabase
    .from("milestone_notes")
    .select("content, updated_at")
    .eq("user_id", user.id)
    .eq("rung_id", rungId)
    .single();

  if (error && error.code !== "PGRST116") {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ content: data?.content ?? "", updated_at: data?.updated_at ?? null });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { rung_id: string; content: string };
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }

  const { error } = await supabase
    .from("milestone_notes")
    .upsert({ user_id: user.id, rung_id: body.rung_id, content: body.content },
      { onConflict: "user_id,rung_id" });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
