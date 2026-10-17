import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { LadderSchema } from "@/lib/schemas/roadmap";
import type { Ladder } from "@/types";

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });

export async function generateRoadmap(
  currentRole: string,
  targetRole: string,
  company?: string
): Promise<Ladder> {
  const companyContext = company
    ? `The candidate works at or is targeting: "${company}". Tailor every rung to that company's tech stack, culture, and industry.`
    : "";

  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: `You are a senior engineering career coach. Return ONLY valid JSON, no markdown, no explanation.

Build a career roadmap for: "${currentRole}" → "${targetRole}"
${companyContext}

Return this exact JSON structure with 5 rungs:
{
  "rungs": [
    {
      "id": "rung_1",
      "title": "short milestone title",
      "description": "2-3 sentences on what this covers and why it matters",
      "weekly_actions": ["Week 1: action", "Week 2: action", "Week 3: action"],
      "learning_resources": ["Book or course name", "Another resource", "https://example.com"],
      "verification_criteria": ["Scenario-based criterion 1", "Criterion 2", "Criterion 3"],
      "tech_events": [
        {
          "name": "Event Name",
          "type": "conference",
          "url": "https://example.com",
          "relevance": "One sentence on why this helps for this milestone"
        }
      ]
    }
  ]
}

Rules:
- Exactly 5 rungs, ordered foundational to advanced
- tech_events type must be one of: conference, hackathon, meetup, community, competition
- 1-2 tech_events per rung
- 3 weekly_actions per rung
- 3 learning_resources per rung  
- 3 verification_criteria per rung
- Return ONLY the JSON object, nothing else`,
  });

  // Strip any accidental markdown fences
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  const result = LadderSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("AI returned unexpected structure. Please try again.");
  }

  return result.data as Ladder;
}
