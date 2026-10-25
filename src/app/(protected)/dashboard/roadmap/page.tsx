import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RoadmapView } from "@/components/dashboard/RoadmapView";
import type { Ladder, RungWithProgress, ProgressRecord } from "@/types";

export default async function RoadmapPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("target_role, current_role, company")
    .eq("id", user.id)
    .single();

  const { data: ladderRow } = await supabase
    .from("ladders")
    .select("career_path_json")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!ladderRow) redirect("/onboarding");

  const ladder = ladderRow.career_path_json as Ladder;

  const { data: progressRows } = await supabase
    .from("user_progress").select("*").eq("user_id", user.id);

  const progressMap = new Map<string, ProgressRecord>(
    (progressRows ?? []).map((p: ProgressRecord) => [p.rung_id, p])
  );

  const rungs: RungWithProgress[] = ladder.rungs.map((rung) => ({
    ...rung,
    progress: progressMap.get(rung.id) ?? {
      id: "", user_id: user.id, rung_id: rung.id, status: "locked", verification_transcript: null,
    },
  }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <RoadmapView
        rungs={rungs}
        targetRole={profile?.target_role ?? "Your Career Goal"}
        currentRole={profile?.current_role}
        company={profile?.company}
      />
    </main>
  );
}
