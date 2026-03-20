import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { generations, users } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

const client = new Anthropic();
const FREE_TIER_LIMIT = 3;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { destination, startDate, endDate, interests, refinement } = await req.json();

  if (!destination) {
    return new Response("destination is required", { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  const isAdmin = user?.isAdmin ?? false;

  if (!isAdmin) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Check if this destination was already generated this month (free regeneration)
    const existingGeneration = await db
      .select()
      .from(generations)
      .where(
        and(
          eq(generations.userId, userId),
          eq(sql`lower(${generations.destination})`, destination.toLowerCase()),
          gte(generations.createdAt, startOfMonth)
        )
      )
      .limit(1);

    const isRegeneration = existingGeneration.length > 0;

    if (!isRegeneration) {
      // Count distinct destinations this month
      const result = await db
        .selectDistinct({ destination: generations.destination })
        .from(generations)
        .where(and(eq(generations.userId, userId), gte(generations.createdAt, startOfMonth)));

      if (result.length >= FREE_TIER_LIMIT) {
        return new Response(
          JSON.stringify({ error: "quota_exceeded", used: result.length, limit: FREE_TIER_LIMIT }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }

      // Record this generation
      await db.insert(generations).values({ userId, destination });
    }
  }

  const dateRange =
    startDate && endDate
      ? `from ${startDate} to ${endDate}`
      : startDate
        ? `starting ${startDate}`
        : "";

  const interestLine =
    interests?.trim() ? `\nTraveler interests: ${interests}` : "";

  const refinementLine =
    refinement?.trim() ? `\n\nAdditional instructions for this version: ${refinement}` : "";

  const prompt = `Create a detailed day-by-day travel itinerary for ${destination}${dateRange ? ` ${dateRange}` : ""}.${interestLine}

For each day include:
- Morning, afternoon, and evening activities
- Specific places, landmarks, or restaurants worth visiting
- Any practical tips (best time to visit, booking needed, etc.)

Format the output in Markdown:
- Use ## for each day header (e.g. ## Day 1 — Arrival & City Center)
- Use ### for Morning, Afternoon, Evening sections
- Use bullet points for activities and tips
- Bold (**) important names, places, or restaurants

Keep it practical and specific.${refinementLine}`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system:
      "You are a travel itinerary assistant. When the user provides a destination, silently interpret it as best you can — including misspellings, alternate spellings, or names in other languages (e.g. 'Islandia' → Iceland, 'Espagne' → Spain). Never comment on the spelling, never ask for clarification, never explain your interpretation. Go straight into the itinerary.",
    messages: [{ role: "user", content: prompt }],
  });

  const readable = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
