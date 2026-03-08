import BackToTop from "../components/BackToTop";
import Footer from "../components/Footer";
import HamburgerMenu from "../components/HamburgerMenu";

export default function AboutUs() {
  return (
    <main className="max-w-3xl mx-auto p-6 text-white-800 leading-relaxed pb-0">
      {/* Hero Section */}
          <header className="mb-12 border-b pb-8">
              <div className="flex items-center justify-between mb-6">
                  <div>
                      <h1 className="text-4xl font-extrabold text-white-900 mb-4 tracking-tight">
                          About Us
                      </h1>
                      <p className="text-xl text-white-600 font-medium">
                          “Usichezwe, kaa rada.”
                      </p>
                  </div>

                  <HamburgerMenu />
              </div>
          </header>

      <div className="space-y-12">
        {/* Our Mission */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-2xl font-bold text-white-900">Our Mission</h2>
          </div>
          <p className="text-lg text-white-700 mb-4">
            This platform, (kuwaMakini) exists to help communities stay alert to scams, deceptive
            street tactics, and manipulation strategies used by fraudsters.
          </p>
          <p className="text-lg text-white-700">
            By sharing real experiences and documenting scam patterns, we help
            others recognize warning signs before becoming victims.
          </p>
        </section>

        {/* Why This Exists - Using a subtle card */}
        <section className="bg-white-50 border border-white-200 p-8 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📖</span>
            <h2 className="text-2xl font-bold text-white-900">Why This Platform Exists</h2>
          </div>
          <p className="mb-4">
            Many scam incidents happen quietly and go undocumented. People often
            realize they were tricked only after the scammer has disappeared.
            Without shared knowledge, the same tricks continue to harm others.
          </p>
          <p>
            kuwaMakini bridges this gap by documenting these experiences so that the public can
            recognize patterns and avoid falling into the same traps.
          </p>
        </section>

        {/* What You Gain - Visual Grid */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎯</span>
            <h2 className="text-2xl font-bold text-white-900">What You Gain Here</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: "📍", text: "Location-based scam awareness" },
              { icon: "🧠", text: "Education on common deception tactics" },
              { icon: "🚨", text: "Early warnings about emerging patterns" },
              { icon: "🤝", text: "Community-driven reporting" },
            ].map((item, i) => (
              <div key={i} className="flex font-bold items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-slate-700">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Focus on Tactics - The "Rada" Warning Box */}
        <section className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
          <div className="flex items-center gap-3 mb-3 text-amber-900">
            <span className="text-2xl">🔎</span>
            <h2 className="text-xl font-bold">Focus on Tactics, Not People</h2>
          </div>
          <p className="text-amber-900 leading-relaxed font-bold">
            This plaform (kuwaMakini) documents <strong>methods and patterns</strong> used in
            scams rather than targeting individuals. Reports focus on the approach used and the warning signs. This protects our users while spreading valuable awareness.
          </p>
        </section>

        {/* What to do / Safety Advice */}
        <section>
          <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-3">
            <span className="text-2xl">🧭</span> Safety Guidelines
          </h2>
          <ul className="space-y-3">
            {[
              "Walk away from the situation calmly.",
              "Avoid arguments, negotiations, or confrontations.",
              "Do not follow strangers to isolated locations.",
              "Trust your instincts if something feels suspicious."
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-amber-500 mt-1">✦</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Police Notice */}
         <section className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-xl">
          <div className="flex items-center gap-3 mb-3 text-amber-900">
            <span className="text-2xl">🚓</span>
            <h2 className="text-xl font-bold">Official Reporting</h2>
          </div>
          <p className="text-amber-900 leading-relaxed font-bold">
            This is an awareness platform. It does <strong>not</strong> replace reporting 
            criminal activity to law enforcement. If you are a victim of theft or fraud, 
            please contact your local police station immediately.   </p>
        </section>

        {/* Final Values List */}
        <section className="border-t pt-10">
          <h2 className="text-xl font-bold text-white-900 mb-6">What We Stand For</h2>
          <div className="flex flex-wrap gap-2">
            {[
              "Community safety", "Anonymous reporting", "Responsible moderation", 
              "Non-defamatory awareness", "Prevention through knowledge", "Street-smart"
            ].map((value, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                {value}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* Reusable Back to Top Component */}
      <BackToTop />
      <Footer />
    </main>
  );
}