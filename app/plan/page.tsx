import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, generations } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import PlanForm from "./plan-form";

const FREE_TIER_LIMIT = 3;

export default async function PlanPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user] = await db.select().from(users).where(eq(users.clerkId, userId)).limit(1);
  const isAdmin = user?.isAdmin ?? false;

  if (isAdmin) {
    return <PlanForm remaining={FREE_TIER_LIMIT} />;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const used = await db
    .selectDistinct({ destination: generations.destination })
    .from(generations)
    .where(and(eq(generations.userId, userId), gte(generations.createdAt, startOfMonth)));

  const remaining = Math.max(0, FREE_TIER_LIMIT - used.length);

  return <PlanForm remaining={remaining} />;
}
