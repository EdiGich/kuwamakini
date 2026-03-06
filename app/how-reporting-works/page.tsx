"use client";

import BackToTop from "../components/BackToTop";
import HamburgerMenu from "@/app/components/HamburgerMenu";

export default function HowReportingWorks() {
  const steps = [
    {
      title: "Report Submission",
      icon: "✍️",
      content: "Anyone can submit a report describing a scam attempt or deceptive tactic they encountered. No account is required and reports are submitted anonymously."
    },
    {
      title: "Moderation Review",
      icon: "🔍",
      content: "Every report is reviewed before publication to ensure it follows the platform’s guidelines. We prioritize scam tactics and remove identifying personal info."
    },
    {
      title: "Detail Reduction",
      icon: "✂️",
      content: "To prevent misuse, we may summarize reports. The goal is to highlight warning signs rather than publishing 'how-to' operational details."
    },
    {
      title: "Publication",
      icon: "📢",
      content: "Approved reports appear on the platform to help the public recognize patterns. Recent reports stay in the spotlight, while older ones contribute to our data pool."
    }
  ];

  return (
    <main className="max-w-3xl mx-auto p-6 text-slate-200 leading-relaxed pb-20">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">How Reporting Works</h1>
        <HamburgerMenu />
      </div>

      <p className="text-lg text-slate-400 mb-12 italic border-l-4 border-amber-500 pl-4">
        kuwaMakini uses a moderated reporting process designed to share scam awareness while protecting individuals and preventing misuse of the platform.
      </p>

      {/* The Timeline Flow */}
      <div className="space-y-4 mb-16">
        {steps.map((step, index) => (
          <div key={index} className="relative pl-10 border-l border-slate-700 pb-10 last:pb-0">
            {/* Step Marker */}
            <div className="absolute -left-5 top-0 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-900 text-xl shadow-lg shadow-amber-500/10">
              {step.icon}
            </div>
            
            <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl transition-all hover:border-amber-500/50">
              <h2 className="text-xl font-semibold text-white mb-2">{step.title}</h2>
              <p className="text-slate-400">{step.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid for Trend Analysis and Authority Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <section className="p-6 rounded-2xl border border-slate-200/20 bg-slate-800/20">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="text-xl">📊</span> Trend Analysis
          </h2>
          <p className="text-sm text-slate-400">
            Reports are analyzed to identify recurring methods and emerging patterns. 
            This data is displayed through summaries and visualizations to improve public awareness.
          </p>
        </section>

        <section className="p-6 rounded-2xl border border-red-500/30 bg-red-500/5">
          <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <span className="text-xl">🚓</span> Authorities
          </h2>
          <p className="text-sm text-slate-400 font-medium">
            kuwaMakini does <strong>not</strong> replace law enforcement. 
            If you experience fraud or theft, please report it to the appropriate authorities for investigation.
          </p>
        </section>
      </div>

      <footer className="text-center pt-8 border-t border-slate-800">
        <p className="text-xs text-slate-500 uppercase tracking-widest">
          Stay Alert • Stay Safe • kuwaMakini
        </p>
      </footer>

      <BackToTop />
    </main>
  );
}