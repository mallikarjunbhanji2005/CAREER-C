export interface TechEvent {
  name: string;
  type: "conference" | "hackathon" | "meetup" | "community" | "competition";
  url: string;
  relevance: string;
}

export interface Rung {
  id: string;
  title: string;
  description: string;
  weekly_actions: string[];
  learning_resources: string[];
  verification_criteria: string[];
  tech_events: TechEvent[];
}

export interface Ladder {
  rungs: Rung[];
}

export type RungStatus = "locked" | "active" | "completed";

export interface ProgressRecord {
  id: string;
  user_id: string;
  rung_id: string;
  status: RungStatus;
  verification_transcript: string | null;
  completed_at?: string | null;
}

export interface Profile {
  id: string;
  username: string;
  target_role: string;
  current_role: string;
  company: string;
}

export interface VerificationVerdict {
  verdict: "pass" | "fail";
  summary: string;
}

export interface RungWithProgress extends Rung {
  progress: ProgressRecord;
}
