"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, BookOpen, CheckCircle2, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import type { RungWithProgress, RungStatus } from "@/types";

interface RungCardProps {
  rung: RungWithProgress;
  index: number;
}

const statusConfig: Record<RungStatus, { label: string; icon: React.ReactNode; cardClass: string; badgeClass: string }> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="size-4 text-green-400" />,
    cardClass: "ring-2 ring-green-500/40 shadow-[0_0_20px_0_rgba(34,197,94,0.15)]",
    badgeClass: "bg-green-500/20 text-green-400 border border-green-500/30",
  },
  active: {
    label: "In Progress",
    icon: <Zap className="size-4 text-blue-400" />,
    cardClass: "ring-2 ring-blue-500/30",
    badgeClass: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  },
  locked: {
    label: "Locked",
    icon: <Lock className="size-3.5 text-muted-foreground" />,
    cardClass: "opacity-50",
    badgeClass: "bg-muted text-muted-foreground border border-border",
  },
};

export function RungCard({ rung, index }: RungCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = rung.progress.status;
  const cfg = statusConfig[status];

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card transition-all duration-200",
        cfg.cardClass
      )}
    >
      {/* Main row */}
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => status !== "locked" && setExpanded((v) => !v)}
        disabled={status === "locked"}
        aria-expanded={expanded}
      >
        {/* Step number */}
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
          {index}
        </span>

        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{rung.title}</h3>
            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.badgeClass)}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{rung.description}</p>
        </div>

        {status !== "locked" && (
          <ChevronDown
            className={cn(
              "mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Expanded content */}
      {expanded && status !== "locked" && (
        <div className="border-t border-border px-5 py-4 space-y-5">
          {/* Learning resources */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="size-3.5" />
              Learning Resources
            </div>
            <ul className="space-y-1.5">
              {rung.learning_resources.map((res, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {res.startsWith("http") ? (
                    <a
                      href={res}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-4 hover:opacity-80 break-all"
                    >
                      {res}
                    </a>
                  ) : (
                    <span>{res}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* What you'll be tested on */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <CheckCircle2 className="size-3.5" />
              What you&apos;ll be tested on
            </div>
            <ul className="space-y-1.5">
              {rung.verification_criteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1 text-xs font-mono text-muted-foreground/60">{i + 1}.</span>
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          {status === "active" && (
            <Link
              href={`/verify/${rung.id}`}
              className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
            >
              Start Verification Test
            </Link>
          )}

          {status === "completed" && (
            <p className="text-center text-sm text-green-400 font-medium">
              ✓ You&apos;ve passed this milestone
            </p>
          )}
        </div>
      )}
    </div>
  );
}
