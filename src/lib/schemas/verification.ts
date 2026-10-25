import { z } from "zod";

export const VerdictSchema = z.object({
  verdict: z.enum(["pass", "fail"]),
  summary: z.string().min(1),
});

export type VerdictSchemaType = z.infer<typeof VerdictSchema>;
