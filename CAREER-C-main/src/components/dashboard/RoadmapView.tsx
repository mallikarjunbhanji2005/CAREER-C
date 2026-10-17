"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, BookOpen, CalendarDays, ListChecks,
  CheckCircle2, Lock, Zap, ExternalLink, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { MilestoneNote } from "./MilestoneNote";
import type { RungWithProgress, TechEvent, RungStatus } from "@/types";

interface RoadmapViewProps {
  rungs: RungWithProgress[];
  targetRole: string;
  currentRole?: string;
  company?: string;
}

const eventTypeColors: Record<TechEvent["type"], string> = {
  conference: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  hackathon: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  meetup: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  community: "bg-green-500/20 text-green-400 border-green-500/30",
  competition: "bg-red-500/20 text-red-400 border-red-500/30",
};

const statusIcon: Record<RungStatus, React.ReactNode> = {
  completed: <CheckCircle2 className="size-4 text-green-400" />,
  active: <Zap className="size-4 text-blue-400" />,
  locked: <Lock className="size-3.5 text-muted-foreground" />,
};

export function RoadmapView({ rungs, targetRole, currentRole, company }: RoadmapViewProps) {
  const [openId, setOpenId] = useState<string | null>(
    rungs.find((r) => r.progress.status === "active")?.id ?? null
  );
  const [regenerating, setRegenerating] = useState(false);
  const router = useRouter();

  async function handleRegenerate() {
    if (!confirm("This will replace your current roadmap and reset all progress. Continue?")) return;
    setRegenerating(true);
    router.push("/onboarding");
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        {currentRole && (
          <p className="text-sm text-muted-foreground">
            {currentRole}{company ? ` · ${company}` : ""} →
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight">{targetRole}</h1>
        <p className="text-sm text-muted-foreground">
          Your personalised roadmap — follow each milestone in order.
        </p>
      </div>

      {/* Regenerate */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="gap-1.5 text-muted-foreground"
        >
          <RefreshCw className={cn("size-3.5", regenerating && "animate-spin")} />
          Regenerate roadmap
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative space-y-4">
        {/* Vertical line */}
        <div className="absolute left-[22px] top-8 bottom-8 w-px bg-border" />

        {rungs.map((rung, index) => {
          const status = rung.progress.status;
          const isOpen = openId === rung.id;
          const canOpen = status !== "locked";

          return (
            <motion.div
              key={rung.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.06 }}
              className={cn("relative pl-12", status === "locked" && "opacity-50")}
            >
              {/* Step dot */}
              <div className={cn(
                "absolute left-0 top-4 flex size-[46px] items-center justify-center rounded-full border-2 bg-background text-sm font-bold",
                status === "completed" && "border-green-500 text-green-400",
                status === "active" && "border-blue-500 text-blue-400",
                status === "locked" && "border-border text-muted-foreground",
              )}>
                {status === "completed" ? "✓" : index + 1}
              </div>

              {/* Card */}
              <div className={cn(
                "rounded-xl border border-border bg-card overflow-hidden",
                status === "completed" && "ring-1 ring-green-500/30",
                status === "active" && "ring-1 ring-blue-500/30",
              )}>
                {/* Header row */}
                <button
                  className="w-full text-left px-5 py-4 flex items-center gap-3"
                  onClick={() => canOpen && setOpenId(isOpen ? null : rung.id)}
                  disabled={!canOpen}
                >
                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{rung.title}</span>
                      <span className={cn(
                        "flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
                        status === "completed" && "bg-green-500/20 text-green-400 border-green-500/30",
                        status === "active" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                        status === "locked" && "bg-muted text-muted-foreground border-border",
                      )}>
                        {statusIcon[status]}
                        {status === "completed" ? "Done" : status === "active" ? "Current" : "Locked"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{rung.description}</p>
                  </div>
                  {canOpen && (
                    <ChevronDown className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180"
                    )} />
                  )}
                </button>

                {/* Expanded */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-5 py-5 space-y-6">

                        {/* Weekly actions */}
                        {rung.weekly_actions?.length > 0 && (
                          <Section icon={<ListChecks className="size-4" />} title="Action Plan">
                            <ol className="space-y-2">
                              {rung.weekly_actions.map((action, i) => (
                                <li key={i} className="flex gap-3 text-sm">
                                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                                    {i + 1}
                                  </span>
                                  <span className="text-foreground">{action}</span>
                                </li>
                              ))}
                            </ol>
                          </Section>
                        )}

                        {/* Learning resources */}
                        {rung.learning_resources?.length > 0 && (
                          <Section icon={<BookOpen className="size-4" />} title="Learning Resources">
                            <ul className="space-y-1.5">
                              {rung.learning_resources.map((res, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                                  {res.startsWith("http") ? (
                                    <a href={res} target="_blank" rel="noopener noreferrer"
                                      className="text-primary underline underline-offset-4 hover:opacity-80 break-all flex items-center gap-1">
                                      {res} <ExternalLink className="size-3 shrink-0" />
                                    </a>
                                  ) : (
                                    <span className="text-foreground">{res}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </Section>
                        )}

                        {/* Tech events */}
                        {rung.tech_events?.length > 0 && (
                          <Section icon={<CalendarDays className="size-4" />} title="Events & Communities to Join">
                            <div className="space-y-3">
                              {rung.tech_events.map((event, i) => (
                                <div key={i} className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <a href={event.url} target="_blank" rel="noopener noreferrer"
                                      className="font-medium text-sm text-foreground hover:text-primary flex items-center gap-1">
                                      {event.name} <ExternalLink className="size-3" />
                                    </a>
                                    <span className={cn(
                                      "rounded-full border px-2 py-0.5 text-xs font-medium capitalize",
                                      eventTypeColors[event.type]
                                    )}>
                                      {event.type}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{event.relevance}</p>
                                </div>
                              ))}
                            </div>
                          </Section>
                        )}

                        {/* Notes */}
                        <MilestoneNote rungId={rung.id} />

                        {/* CTA */}
                        {status === "active" && (
                          <Link
                            href={`/verify/${rung.id}`}
                            className={cn(buttonVariants({ size: "sm" }), "w-full justify-center")}
                          >
                            Take the Verification Test →
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
