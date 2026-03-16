import { NavAuth, HeroCTA } from "./_components/NavAuth";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-xl font-bold tracking-tight">Waypoint</span>
        <NavAuth />
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 sm:py-36">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-gray-900 max-w-3xl">
          Plan your next adventure with AI
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl">
          Waypoint turns your travel ideas into detailed, personalized itineraries — in seconds.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <HeroCTA />
          <a
            href="#how-it-works"
            className="font-semibold px-8 py-3 rounded-xl text-base border border-gray-200 hover:border-gray-400 transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Tell us your destination", desc: "Enter where you want to go and your travel dates." },
              { step: "2", title: "AI builds your itinerary", desc: "Our AI crafts a day-by-day plan tailored to your interests." },
              { step: "3", title: "Refine and export", desc: "Tweak your plan and export it to take on the road." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400 border-t border-gray-100">
        © {new Date().getFullYear()} Waypoint. All rights reserved.
      </footer>
    </main>
  );
}
