"use client";

import BackToTop from "../components/BackToTop";
import HamburgerMenu from "@/app/components/HamburgerMenu";

export default function PrivacyPolicy() {
  const sections = [
    { id: "intro", title: "1. Introduction" },
    { id: "anonymous", title: "2. Anonymous Reporting" },
    { id: "public", title: "3. Public Reports" },
    { id: "info", title: "4. Data Processed" },
    { id: "abuse", title: "5. Abuse Prevention" },
    { id: "purpose", title: "6. Purpose of Data" },
    { id: "moderation", title: "7. Moderation" },
    { id: "security", title: "8. Data Security" },
    { id: "noAuthority", title: "9. Authorities" },
    { id: "responsible-awareness", title: "10. Awareness" },
    { id: "updates", title: "11. Policy Updates" }
  ];

  return (
    <main className="max-w-5xl mx-auto p-6 text-slate-300 leading-relaxed pb-20">
      {/* Header Area */}
      <header className="mb-12 flex justify-between items-start border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Privacy Policy</h1>
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>Last Updated: March 5, 2026</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span className="text-amber-500">kuwaMakini Platform</span>
          </div>
        </div>
        <HamburgerMenu />
      </header>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-8 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-3">On this page</p>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-800 hover:text-amber-500 transition-all border border-transparent hover:border-slate-700"
              >
                {section.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content Content */}
        <div className="flex-1 space-y-16">
          
          {/* TL;DR Quick Summary - Glassmorphism Amber */}
          <section className="relative overflow-hidden bg-amber-500/5 border border-amber-500/20 rounded-3xl p-8 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💡</div>
            <h2 className="text-xl font-bold mb-6 text-amber-500 flex items-center gap-2">
              Muhtasari / Quick Summary
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <SummaryItem icon="🛡️" title="No Accounts" desc="You don’t need to sign up to report a scam." />
              <SummaryItem icon="🕵️" title="Anonymous" desc="We want the story, not your identity." />
              <SummaryItem icon="🚫" title="No Private Info" desc="Strictly no IDs or phone numbers allowed." />
              <SummaryItem icon="🧠" title="Tactics First" desc="Focus on how the trick works, not who did it." />
            </ul>
          </section>

          {/* Section 1 & 2 */}
          <div className="space-y-10">
            <section id="intro" className="scroll-mt-10">
              <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
              <p className="text-lg text-slate-400">
                Welcome to kuwaMakini — <span className="text-white font-semibold">“Usichezwe, kaa rada.”</span> Stay informed about scams and deceptive tactics. Your privacy is our priority; this policy explains what we collect and, more importantly, what we do not.
              </p>
            </section>

            <section id="anonymous" className="scroll-mt-10 border-t border-slate-800 pt-10">
              <h2 className="text-xl font-bold text-white mb-4">2. Anonymous Reporting</h2>
              <p>
                Reports are anonymous by default. We do not require identity verification. We do not intentionally collect personal identifiers such as names, phone numbers, or emails tied to specific reports.
              </p>
            </section>
          </div>

          {/* Section 3: High Importance Box (Red Theme) */}
          <section id="public" className="scroll-mt-10 bg-red-500/5 border border-red-500/20 p-8 rounded-3xl">
            <h2 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> 3. Public Reports & Responsibility
            </h2>
            <p className="mb-6 font-medium text-red-200/80">
              Approved reports are public. To protect the community, you must follow these rules:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-red-100/70">
              <div className="flex gap-3"><span>❌</span> <span>No phone numbers or ID numbers.</span></div>
              <div className="flex gap-3"><span>❌</span> <span>No home addresses or private locations.</span></div>
              <div className="flex gap-3"><span>❌</span> <span>No specific individual naming.</span></div>
              <div className="flex gap-3"><span>❌</span> <span>No revenge-based accusations.</span></div>
            </div>
          </section>

          {/* Sections 4 & 5 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section id="info" className="scroll-mt-10 p-6 bg-slate-800/20 border border-slate-800 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-3">4. Data We Process</h2>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>• Scam reports (Descriptions) submitted by users.</li>
                <li>• General location information provided voluntarily in reports (e.g.,town or area).</li>
                <li>• Temporary technical metadata.</li>
                <li>• Anonymous usage analytics.</li>
              </ul>
            </section>

            <section id="abuse" className="scroll-mt-10 p-6 bg-slate-800/20 border border-slate-800 rounded-2xl">
              <h2 className="text-lg font-bold text-white mb-3">5. Abuse Prevention</h2>
              <p className="text-sm text-slate-400">
                To prevent spam, we may temporarily use IP addresses for rate-limiting. 
                </p>
                 <p className="text-sm text-slate-400">
                    These IP addresses are <strong>not</strong> stored in a permanent database and are only

used in short-term memory to detect excessive submissions or bot

activity. This helps prevent coordinated misinformation or attempts to

manipulate scam reports.
              </p>
            </section>
          </div>

          {/* Middle Sections */}
          <div className="space-y-12 text-slate-400">
            {[
              { id: "purpose", title: "6. Purpose", body: "We use data to publish awareness reports, identify scam patterns, and maintain platform security. kuwaMakini does not sell data or use it for ads." },
              { id: "moderation", title: "7. Moderation", body: "All reports are reviewed. We reserve the right to edit or reject submissions that violate community safety or contain PII (Personally Identifiable Information)." },
              { id: "security", title: "8. Security", body: "We use industry-standard safeguards, but no platform is 100% secure. Submit only information you are comfortable sharing publicly." }
            ].map((item) => (
              <section key={item.id} id={item.id} className="scroll-mt-10 border-b border-slate-800 pb-10">
                <h2 className="text-xl font-bold text-white mb-3">{item.title}</h2>
                <p>{item.body}</p>
              </section>
            ))}
          </div>

          {/* Section 9: Authority Alert */}
          <section id="noAuthority" className="scroll-mt-10 p-8 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
            <h2 className="text-xl font-bold text-blue-400 mb-4">9. Reporting to Authorities</h2>
            <p className="mb-4">
              kuwaMakini is an <strong>awareness platform</strong>, not a law enforcement agency.
            </p>
            <p className="text-sm border-l-2 border-blue-500/50 pl-4 italic">
              Submitting a report here does not replace official police reports. If you are a victim of crime, please contact the relevant authorities immediately.
            </p>
          </section>

          {/* Section 10: Responsible Awareness */}
          <section id="responsible-awareness" className="scroll-mt-10 p-8 bg-slate-800/40 border border-slate-200/10 rounded-3xl">
            <h2 className="text-xl font-bold text-amber-500 mb-4">10. Responsible Awareness</h2>
            <div className="space-y-4 text-slate-300">
              <p>We share awareness for public safety, but detailed "manuals" on how scams are performed are edited to prevent misuse.</p>
              <p>Older reports may be summarized into <span className="text-white font-mono text-xs">analytics_visualizations</span> to show trends while protecting the community.</p>
            </div>
          </section>

          {/* Final Section */}
          <section id="updates" className="scroll-mt-10 pt-10 text-center">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">11. Policy Updates</h2>
            <p className="text-xs text-slate-600">
              This policy evolves as the platform grows. Continued use of kuwaMakini constitutes acceptance of the latest terms.
            </p>
          </section>
        </div>
      </div>

      <BackToTop />
    </main>
  );
}

function SummaryItem({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-bold text-amber-200">{title}</p>
        <p className="text-amber-100/60 leading-tight">{desc}</p>
      </div>
    </div>
  );
}