import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return new Response("Webhook secret not configured", { status: 500 });

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  let event: WebhookEvent;
  try {
    event = new Webhook(secret).verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  if (event.type === "user.created") {
    const { id, email_addresses } = event.data;
    const email = email_addresses[0]?.email_address ?? "";
    await db.insert(users).values({ clerkId: id, email }).onConflictDoNothing();
  }

  return new Response(null, { status: 200 });
}
