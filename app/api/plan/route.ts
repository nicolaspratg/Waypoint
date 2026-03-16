import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@clerk/nextjs/server";

const client = new Anthropic();

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { destination, startDate, endDate, interests } = await req.json();

  if (!destination) {
    return new Response("destination is required", { status: 400 });
  }

  const dateRange =
    startDate && endDate
      ? `from ${startDate} to ${endDate}`
      : startDate
        ? `starting ${startDate}`
        : "";

  const interestLine =
    interests?.trim() ? `\nTraveler interests: ${interests}` : "";

  const prompt = `Create a detailed day-by-day travel itinerary for ${destination}${dateRange ? ` ${dateRange}` : ""}.${interestLine}

For each day include:
- Morning, afternoon, and evening activities
- Specific places, landmarks, or restaurants worth visiting
- Any practical tips (best time to visit, booking needed, etc.)

Keep it practical and specific. Format each day clearly with a "Day N — [Date or Theme]" header.`;

  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
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
