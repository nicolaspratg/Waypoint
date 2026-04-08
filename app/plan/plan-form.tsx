"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { DateRangePicker } from "./date-range-picker";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { saveTrip } from "./actions";

function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-xl">
          ✈️
        </div>
        <h2 className="text-lg font-semibold text-gray-900">You've used all 3 free trips</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Upgrade to Pro for unlimited trip generation. Your free quota resets at the start of next month.
        </p>
        <button className="w-full bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
          Upgrade to Pro
        </button>
        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

export default function PlanForm({ remaining }: { remaining: number }) {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interests, setInterests] = useState("");
  const [itinerary, setItinerary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [showRefine, setShowRefine] = useState(false);
  const [refinement, setRefinement] = useState("");
  const [showPaywall, setShowPaywall] = useState(remaining === 0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (remaining === 0) setShowPaywall(true);
  }, [remaining]);

  async function generate(refinementText = "") {
    setItinerary("");
    setError("");
    setLoading(true);
    setShowRefine(false);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, startDate, endDate, interests, refinement: refinementText }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        if (res.status === 429) {
          setShowPaywall(true);
        } else {
          const text = await res.text();
          setError(text || "Something went wrong.");
        }
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setItinerary((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setError("Failed to generate itinerary. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (remaining === 0) {
      setShowPaywall(true);
      return;
    }
    setRefinement("");
    await generate();
  }

  function handleStop() {
    abortRef.current?.abort();
    setLoading(false);
  }

  function handleRefineSubmit() {
    generate(refinement);
    setRefinement("");
  }

  function handleSave() {
    startTransition(() =>
      saveTrip({ destination, startDate, endDate, itinerary })
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} />}

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
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Plan a new trip</h1>
          <span className={`text-sm ${remaining === 0 ? "text-red-500 font-medium" : "text-gray-400"}`}>
            {remaining === 0
              ? "0 free trips left this month"
              : `${remaining} free ${remaining === 1 ? "trip" : "trips"} left this month`}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Destination <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Tokyo, Japan"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Interests{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. food, hiking, museums, nightlife"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !destination.trim()}
              className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating…" : "Generate itinerary"}
            </button>
            {loading && (
              <button
                type="button"
                onClick={handleStop}
                className="text-sm font-medium px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
              >
                Stop
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {itinerary && (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6 pb-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Your itinerary
            </h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              <ReactMarkdown>{itinerary}</ReactMarkdown>
            </div>
          </div>
        )}

        {itinerary && !loading && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
            {showRefine && (
              <div className="border-b border-gray-100 px-6 py-4">
                <div className="max-w-3xl mx-auto flex gap-3">
                  <input
                    type="text"
                    value={refinement}
                    onChange={(e) => setRefinement(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && refinement.trim() && handleRefineSubmit()}
                    placeholder="e.g. more budget options, focus on food, less museums…"
                    autoFocus
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors"
                  />
                  <button
                    onClick={handleRefineSubmit}
                    disabled={!refinement.trim()}
                    className="bg-black text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={() => setShowRefine(false)}
                    className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <div className="px-6 py-4">
              <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Ready to save your <span className="font-medium text-gray-800">{destination}</span> trip?
                </p>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => setShowRefine((v) => !v)}
                    className="text-sm font-medium px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-400 transition-colors"
                  >
                    Refine
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="bg-black text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {isPending ? "Saving…" : "Save trip"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && !itinerary && (
          <div className="mt-8 flex items-center gap-3 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            Building your itinerary…
          </div>
        )}
      </main>
    </div>
  );
}
