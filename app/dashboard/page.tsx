import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { db } from "@/db";
import { trips, generations } from "@/db/schema";
import { eq, desc, and, gte } from "drizzle-orm";

const FREE_TIER_LIMIT = 3;

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [user, userTrips, generationsThisMonth] = await Promise.all([
    currentUser(),
    db
      .select()
      .from(trips)
      .where(eq(trips.userId, userId))
      .orderBy(desc(trips.createdAt)),
    db
      .selectDistinct({ destination: generations.destination })
      .from(generations)
      .where(and(eq(generations.userId, userId), gte(generations.createdAt, startOfMonth))),
  ]);

  const usedThisMonth = generationsThisMonth.length;
  const remaining = Math.max(0, FREE_TIER_LIMIT - usedThisMonth);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Waypoint
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.firstName ? `Hi, ${user.firstName}` : "Welcome"}
            </span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Trips</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {remaining === 0 ? (
                <span className="text-red-500 font-medium">0 trips left this month</span>
              ) : (
                <span>{remaining} free trip{remaining === 1 ? "" : "s"} left this month</span>
              )}
            </span>
            <Link
              href="/plan"
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              + New Trip
            </Link>
          </div>
        </div>

        {userTrips.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="text-4xl mb-4">🌍</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No trips yet
            </h2>
            <p className="text-gray-500 text-sm max-w-xs mb-6">
              Create your first trip and let AI plan the perfect itinerary for you.
            </p>
            <Link
              href="/plan"
              className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Plan your first trip
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTrips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition-all group"
              >
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-black">
                  {trip.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{trip.destination}</p>
                {(trip.startDate || trip.endDate) && (
                  <p className="text-xs text-gray-400">
                    {trip.startDate
                      ? new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                    {trip.startDate && trip.endDate ? " – " : ""}
                    {trip.endDate
                      ? new Date(trip.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : ""}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  Saved{" "}
                  {new Date(trip.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
