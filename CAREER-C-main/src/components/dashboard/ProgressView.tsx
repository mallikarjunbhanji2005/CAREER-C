"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Lock, Trophy, Flame, Target, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { RungWithProgress } from "@/types";

interface ProgressViewProps {
  rungs: RungWithProgress[];
  targetRole: string;
  currentRole?: string;
}

function getEncouragement(completed: number, total: number): { message: string; sub: string } {
  const pct = completed / total;
  if (completed === 0)
    return { message: "Every expert was once a beginner.", sub: "Start your first milestone — you've got this." };
  if (pct < 0.25)
    return { message: "Great start! Momentum is everything.", sub: "You've taken the hardest step: beginning." };
  if (pct < 0.5)
    return { message: "You're building real traction.", sub: "Keep the streak going — consistency beats intensity." };
  if (pct < 0.75)
    return { message: "Past the halfway mark — impressive.", sub: "Most people quit before here. You didn't." };
  if (pct < 1)
    return { message: "Almost there. The finish line is in sight.", sub: "Push through — the last stretch defines you." };
  return { message: "You did it. 🎉", sub: `You've completed the full roadmap to ${""}.` };
}

export function ProgressView({ rungs, targetRole, currentRole }: ProgressViewProps) {
  const completed = rungs.filter((r) => r.progress.status === "completed").length;
  const total = rungs.length;
  const active = rungs.find((r) => r.progress.status === "active");
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const { message, sub } = getEncouragement(completed, total);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Progress</h1>
        {currentRole && (
          <p className="text-sm text-muted-foreground mt-1">
            {currentRole} → {targetRole}
          </p>
        )}
      </div>

      {/* Encouragement card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-primary/5 px-6 py-5 space-y-1"
      >
        <p className="font-semibold text-foreground text-lg">{message}</p>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={<Trophy className="size-5 text-yellow-400" />} value={completed} label="Completed" />
        <StatCard icon={<Flame className="size-5 text-orange-400" />} value={total - completed} label="Remaining" />
        <StatCard icon={<Target className="size-5 text-primary" />} value={`${pct}%`} label="Overall" />
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{completed} of {total} milestones</span>
          <span>{pct}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Next up CTA */}
      {active && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 px-5 py-4 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">Up next</p>
            <p className="font-medium text-foreground">{active.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-1">{active.description}</p>
          </div>
          <Link
            href={`/verify/${active.id}`}
            className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-1")}
          >
            Test now <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* Milestone list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Milestones</h2>
        {rungs.map((rung, index) => {
          const status = rung.progress.status;
          return (
            <motion.div
              key={rung.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4",
                status === "locked" && "opacity-40"
              )}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                {status === "completed" && <CheckCircle2 className="size-5 text-green-400" />}
                {status === "active" && <Clock className="size-5 text-blue-400" />}
                {status === "locked" && <Lock className="size-5 text-muted-foreground" />}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">{rung.title}</span>
                  <span className={cn(
                    "rounded-full border px-2 py-0.5 text-xs font-medium",
                    status === "completed" && "bg-green-500/20 text-green-400 border-green-500/30",
                    status === "active" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                    status === "locked" && "bg-muted text-muted-foreground border-border",
                  )}>
                    {status === "completed" ? "Passed" : status === "active" ? "In Progress" : "Locked"}
                  </span>
                </div>

                {/* Transcript snippet for completed */}
                {status === "completed" && rung.progress.verification_transcript && (
                  <p className="text-xs text-muted-foreground line-clamp-2 italic">
                    &ldquo;{rung.progress.verification_transcript.split("\n").pop()}&rdquo;
                  </p>
                )}

                {status === "active" && (
                  <p className="text-sm text-muted-foreground">
                    Ready to test?{" "}
                    <Link href={`/verify/${rung.id}`} className="text-primary underline underline-offset-4">
                      Start verification →
                    </Link>
                  </p>
                )}
              </div>

              {/* Step number */}
              <span className="shrink-0 text-xs text-muted-foreground font-mono">
                {String(index + 1).padStart(2, "0")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 flex flex-col items-center gap-1 text-center">
      {icon}
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
