import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import { trips } from "@/db/schema";
import { eq } from "drizzle-orm";
import DownloadPdfButton from "./DownloadPdfButton";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { id } = await params;

  const [trip] = await db
    .select()
    .from(trips)
    .where(eq(trips.id, id))
    .limit(1);

  if (!trip || trip.userId !== userId) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Waypoint
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-gray-500 hover:text-black transition-colors"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{trip.title}</h1>
            {(trip.startDate || trip.endDate) && (
              <p className="text-sm text-gray-500 mt-1">
                {trip.startDate
                  ? new Date(trip.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
                {trip.startDate && trip.endDate ? " – " : ""}
                {trip.endDate
                  ? new Date(trip.endDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : ""}
              </p>
            )}
          </div>
          <DownloadPdfButton
            title={trip.title ?? "Itinerary"}
            itinerary={trip.itinerary ?? ""}
            dateRange={
              trip.startDate || trip.endDate
                ? [
                    trip.startDate
                      ? new Date(trip.startDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "",
                    trip.endDate
                      ? new Date(trip.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" – ")
                : undefined
            }
          />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {trip.itinerary}
          </div>
        </div>
      </main>
    </div>
  );
}
