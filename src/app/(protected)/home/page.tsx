import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MainMenu } from "@/components/layout/MainMenu";
import type { Ladder, ProgressRecord } from "@/types";

export default async function HomePage() {
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

  const hasRoadmap = !!ladderRow;
  let completedCount = 0;
  let totalCount = 0;

  if (ladderRow) {
    const ladder = ladderRow.career_path_json as Ladder;
    totalCount = ladder.rungs.length;

    const { data: progressRows } = await supabase
      .from("user_progress").select("status").eq("user_id", user.id);

    completedCount = (progressRows ?? []).filter(
      (p: Pick<ProgressRecord, "status">) => p.status === "completed"
    ).length;
  }

  return (
    <MainMenu
      email={user.email ?? ""}
      targetRole={profile?.target_role}
      currentRole={profile?.current_role}
      hasRoadmap={hasRoadmap}
      completedCount={completedCount}
      totalCount={totalCount}
    />
  );
}
