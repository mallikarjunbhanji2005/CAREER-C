"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  TrendingUp, Map, BarChart2, FileText,
  Briefcase, GraduationCap, LogOut, Plus, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MainMenuProps {
  email: string;
  targetRole?: string;
  currentRole?: string;
  hasRoadmap: boolean;
  completedCount: number;
  totalCount: number;
}

const menuItems = [
  {
    label: "Roadmap",
    description: "Your step-by-step career plan",
    href: "/dashboard/roadmap",
    icon: Map,
    gradient: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20 hover:border-blue-500/40",
    iconColor: "text-blue-400",
    glow: "hover:shadow-blue-500/10",
    requiresRoadmap: true,
  },
  {
    label: "Progress",
    description: "Track milestones & test results",
    href: "/dashboard/progress",
    icon: BarChart2,
    gradient: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/20 hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
    glow: "hover:shadow-emerald-500/10",
    requiresRoadmap: true,
  },
  {
    label: "Resume Gap",
    description: "Find what's missing on your resume",
    href: "/tools/resume",
    icon: FileText,
    gradient: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/20 hover:border-violet-500/40",
    iconColor: "text-violet-400",
    glow: "hover:shadow-violet-500/10",
    requiresRoadmap: false,
  },
  {
    label: "JD Matcher",
    description: "See how ready you are for a role",
    href: "/tools/jd-match",
    icon: Briefcase,
    gradient: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20 hover:border-amber-500/40",
    iconColor: "text-amber-400",
    glow: "hover:shadow-amber-500/10",
    requiresRoadmap: false,
  },
  {
    label: "Interview Prep",
    description: "Practice with an AI coach",
    href: "/tools/interview-prep",
    icon: GraduationCap,
    gradient: "from-cyan-500/20 to-cyan-600/5",
    border: "border-cyan-500/20 hover:border-cyan-500/40",
    iconColor: "text-cyan-400",
    glow: "hover:shadow-cyan-500/10",
    requiresRoadmap: false,
  },
];

export function MainMenu({ email, targetRole, currentRole, hasRoadmap, completedCount, totalCount }: MainMenuProps) {
  const router = useRouter();

  useEffect(() => {
    async function handleUnload() {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/sign-in");
  }

  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const name = email.split("@")[0];

  return (
    <div className="min-h-screen bg-grid relative overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 flex flex-col min-h-screen">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/30">
              <TrendingUp className="size-4 text-primary" />
            </div>
            <span className="font-bold tracking-tight">Ascend</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-sm text-muted-foreground mb-1">Good to see you,</p>
          <h1 className="text-3xl font-bold tracking-tight text-gradient capitalize">{name}</h1>
          {hasRoadmap && targetRole && (
            <p className="text-sm text-muted-foreground mt-2">
              <span className="text-foreground/60">{currentRole}</span>
              <span className="mx-2 text-primary">→</span>
              <span className="text-foreground font-medium">{targetRole}</span>
            </p>
          )}
        </motion.div>

        {/* Progress card */}
        {hasRoadmap && totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{completedCount} of {totalCount} milestones</span>
              <span className="font-semibold text-primary">{pct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary glow-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              />
            </div>
            {pct === 0 && (
              <p className="text-xs text-muted-foreground">Complete your first milestone to start tracking progress</p>
            )}
          </motion.div>
        )}

        {/* Build roadmap CTA */}
        {!hasRoadmap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.08 }}
            className="mb-6"
          >
            <Link
              href="/onboarding"
              className="group flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 hover:bg-primary/15 hover:border-primary/50 transition-all glow-primary"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
                  <Plus className="size-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Build your roadmap</p>
                  <p className="text-xs text-muted-foreground">Get a personalised AI career plan</p>
                </div>
              </div>
              <ArrowRight className="size-4 text-primary opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </motion.div>
        )}

        {/* Menu grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          {menuItems.map((item, i) => {
            const Icon = item.icon;
            const disabled = item.requiresRoadmap && !hasRoadmap;

            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                {disabled ? (
                  <div className={cn(
                    "flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-4 opacity-30 cursor-not-allowed h-full",
                    item.gradient, item.border
                  )}>
                    <Icon className={cn("size-5", item.iconColor)} />
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex flex-col gap-3 rounded-2xl border bg-gradient-to-br p-4 transition-all duration-200 h-full",
                      "hover:scale-[1.02] hover:shadow-xl",
                      item.gradient, item.border, item.glow
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={cn("size-5", item.iconColor)} />
                      <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/40 mt-8"
        >
          Session ends when you close this tab
        </motion.p>
      </div>
    </div>
  );
}
