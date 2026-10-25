import { z } from "zod";

export const TechEventSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["conference", "hackathon", "meetup", "community", "competition"]),
  url: z.string().min(1),
  relevance: z.string().min(1),
});

export const RungSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  weekly_actions: z.array(z.string().min(1)).min(3).max(6),
  learning_resources: z.array(z.string().min(1)).min(3).max(5),
  verification_criteria: z.array(z.string().min(1)).min(3).max(5),
  tech_events: z.array(TechEventSchema).min(1).max(3),
});

export const LadderSchema = z.object({
  rungs: z.array(RungSchema).min(5).max(7),
});

export type TechEvent = z.infer<typeof TechEventSchema>;
export type RungSchemaType = z.infer<typeof RungSchema>;
export type LadderSchemaType = z.infer<typeof LadderSchema>;
