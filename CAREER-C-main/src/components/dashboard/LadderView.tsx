"use client";

import { AnimatePresence, motion } from "framer-motion";
import { RungCard } from "./RungCard";
import type { RungWithProgress } from "@/types";

interface LadderViewProps {
  rungs: RungWithProgress[];
  targetRole: string;
  currentRole?: string;
  company?: string;
  completedCount: number;
  totalCount: number;
}

export function LadderView({
  rungs,
  targetRole,
  currentRole,
  company,
  completedCount,
  totalCount,
}: LadderViewProps) {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        {currentRole && (
          <p className="text-sm text-muted-foreground">
            {currentRole}
            {company ? ` · ${company}` : ""}
            {" → "}
          </p>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{targetRole}</h1>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {totalCount} milestones completed
          </span>
          <span className="font-medium text-foreground">{pct}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Rungs */}
      <div className="space-y-4">
        <AnimatePresence>
          {rungs.map((rung, index) => (
            <motion.div
              key={rung.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.06 }}
            >
              <RungCard rung={rung} index={index + 1} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
