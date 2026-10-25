import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerificationChat } from "@/components/verify/VerificationChat";
import type { Ladder, ProgressRecord } from "@/types";

interface VerifyPageProps {
  params: Promise<{ rung_id: string }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { rung_id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: ladderRow } = await supabase
    .from("ladders")
    .select("career_path_json")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!ladderRow) {
    redirect("/onboarding");
  }

  const ladder = ladderRow.career_path_json as Ladder;
  const rung = ladder.rungs.find((r) => r.id === rung_id);

  if (!rung) {
    redirect("/dashboard");
  }

  const { data: progressRow } = await supabase
    .from("user_progress")
    .select("status")
    .eq("user_id", user.id)
    .eq("rung_id", rung_id)
    .single();

  const status = (progressRow as ProgressRecord | null)?.status ?? "locked";

  if (status === "locked") {
    redirect("/dashboard");
  }

  const allRungIds = ladder.rungs.map((r) => r.id);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 h-[calc(100vh-3.5rem)] flex flex-col">
      <VerificationChat rung={rung} allRungIds={allRungIds} />
    </main>
  );
}
