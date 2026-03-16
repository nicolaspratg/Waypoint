"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { redirect } from "next/navigation";

export async function saveTrip(data: {
  destination: string;
  startDate: string;
  endDate: string;
  itinerary: string;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const title = data.destination;

  await db.insert(trips).values({
    userId,
    title,
    destination: data.destination,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
    itinerary: data.itinerary,
  });

  redirect("/dashboard");
}
