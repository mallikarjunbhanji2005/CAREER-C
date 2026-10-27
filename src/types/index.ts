import type { RungSchemaType } from "@/lib/schemas/roadmap";

export type { TechEvent } from "@/lib/schemas/roadmap";

export type RungStatus = "locked" | "active" | "completed";

// Rung = the fields from your roadmap schema (id, title, description,
// weekly_actions, learning_resources, verification_criteria, tech_events)
// plus the database columns.
export interface Rung extends RungSchemaType {
  ladder_id?: string;
  order_index?: number;
}

export interface Ladder {
  id: string;
  title?: string;
  description?: string | null;
  rungs: Rung[];
}

export interface ProgressRecord {
  id: string;
  user_id: string;
  rung_id: string;
  status: RungStatus;
  verification_transcript?: string | null;
}

export interface RungWithProgress extends Rung {
  progress: ProgressRecord;
}

export interface VerificationVerdict {
  verdict: "pass" | "fail";
  summary: string;
}