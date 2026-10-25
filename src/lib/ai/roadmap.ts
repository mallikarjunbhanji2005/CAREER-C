
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { LadderSchema } from "@/lib/schemas/roadmap";
import type { LadderSchemaType } from "@/lib/schemas/roadmap";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function generateRoadmap(
  currentRole: string,
  targetRole: string,
  company?: string
): Promise<LadderSchemaType> {
  const companyContext = company
    ? `The candidate works at or is targeting: "${company}". Tailor every rung to that company's tech stack, culture, and industry.`
    : "";

  const { text } = await generateText({
    model: groq("openai/gpt-oss-120b"),
    prompt: `You are a senior engineering career coach.
Return ONLY a valid JSON object. Do not include markdown fences or explanations.

Build a career roadmap for: "${currentRole}" → "${targetRole}"
${companyContext}

The JSON must follow this structure:
{
  "rungs": [
    {
      "id": "rung_1",
      "title": "short milestone title",
      "description": "2-3 sentences explaining what this covers and why it matters",
      "weekly_actions": ["Week 1: action", "Week 2: action", "Week 3: action"],
      "learning_resources": ["Resource 1", "Resource 2", "Resource 3"],
      "verification_criteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
      "tech_events": [
        {
          "name": "Event Name",
          "type": "conference",
          "url": "https://example.com",
          "relevance": "Explain why this event helps"
        }
      ]
    }
  ]
}

Rules:
- Return exactly 5 rungs, from foundational to advanced.
- Give every rung a unique id: rung_1, rung_2, rung_3, rung_4, rung_5.
- Each rung must contain 3 weekly_actions.
- Each rung must contain 3 learning_resources.
- Each rung must contain 3 verification_criteria.
- Each rung must contain 1-2 tech_events.
- Event type must be one of: conference, hackathon, meetup, community, competition.
- Every field must contain the correct data type.
- Return only the JSON object.`,
  });

  // Remove markdown fences if the AI accidentally includes them.
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error(
      "[generate-roadmap] Invalid AI response:",
      text.slice(0, 1500)
    );
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  // Validate the response against the Zod schema.
  const result = LadderSchema.safeParse(parsed);

  if (!result.success) {
    console.error(
      "[generate-roadmap] Schema validation error:",
      result.error.flatten()
    );
    throw new Error("AI returned unexpected structure. Please try again.");
  }

  return result.data;
}
