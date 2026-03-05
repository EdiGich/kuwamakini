import BackToTop from "../components/BackToTop";
import HamburgerMenu from "@/app/components/HamburgerMenu";

export default function PrivacyPolicy() {
    const sections = [
        { id: "intro", title: "1. Introduction" },
        { id: "anonymous", title: "2. Anonymous Reporting" },
        { id: "public", title: "3. Public Reports & Rules" },
        { id: "info", title: "4. Information Processed" },
        { id: "abuse", title: "5. Abuse Prevention" },
        { id: "purpose", title: "6. Purpose of Data" },
        { id: "moderation", title: "7. Moderation" },
        { id: "security", title: "8. Data Security" },
        { id: "noAuthority", title: "9. Reporting to Authorities" },
        { id: "responsible-awareness", title: "10. Responsible Awareness" },
        { id: "updates", title: "11. Policy Updates" }
    ];

  return (
    <main className="max-w-2xl  mx-auto p-6 text-white leading-relaxed">
      {/* Header */}
          <header className="mb-8">
              <div className="flex items-center justify-between mb-6">
                  <div>
                      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
                      <div className="flex flex-col text-sm text-gray-500 border-b pb-4">
                          <span>Last Updated: March 5, 2026</span>
                          <span>Platform: kuwaMakini</span>
                      </div>
                  </div>

                  <HamburgerMenu />
              </div>

      </header>

      
      {/* TL;DR Quick Summary */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-5 mb-12 shadow-sm">
        <h2 className="text-xl font-bold mb-3 text-amber-900 flex items-center">
          <span className="mr-2">💡</span> Muhtasari / Quick Summary (TL;DR)
        </h2>
        <ul className="space-y-3 text-amber-900">
          <li className="flex items-start">
            <span className="mr-3 mt-1">✔️</span>
            <span><strong>No Accounts - </strong> You don’t need to sign up to report a scam.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1">🕵️</span>
            <span><strong>Anonymous - </strong> We want the story, not your identity.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1">🚫</span>
            <span><strong>No Private Info - </strong> Strictly no IDs, phone numbers, or home addresses allowed.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1">🧠</span>
            <span><strong>Tactics over Names - </strong> Focus on <em>how</em> the trick works, not <em>who</em> did it.</span>
          </li>
          <li className="flex items-start">
            <span className="mr-3 mt-1">🤝</span>
            <span><strong>Public Safety - </strong> We never sell data. The goal is public awareness... to keep the community <strong>rada</strong>.</span>
          </li>
        </ul>
      </div>

{/* Table of Contents */}
      <nav className="mb-10 p-4 bg-slate-100 border rounded-lg">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
          On this page
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-blue-800 hover:underline text-sm font-medium"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>


      <div className="space-y-10">
        {/* Section 1 */}
        <section id="intro">
          <h2 className="text-2xl font-bold text-white mb-3">1. Introduction</h2>
          <p className="text-lg">
            Welcome to kuwaMakini — “Usichezwe, kaa rada.” Stay informed about scams, street tricks, and deceptive
            tactics. Your privacy matters. This policy explains what we collect —
            and what we do not collect.
          </p>
        </section>

        {/* Section 2 */}
        <section id="anonymous">
          <h2 className="text-xl font-semibold text-white mb-3">
            2. Anonymous Reporting & Whistleblower Protection
          </h2>
          <p className="mb-4">
            Reports submitted to kuwaMakini are anonymous by default. We do not
            require accounts or identity verification to share a scam report.
          </p>
          <p>
            We do not intentionally collect personal identifiers such as names,
            phone numbers, or emails tied to specific reports. Your safety and
            ability to report scams without fear of retaliation is a core goal of
            the platform.
          </p>
        </section>

        {/* Section 3: High Importance Box */}
        <section id="public" className="bg-red-50 border border-red-100 p-6 rounded-xl">
          <h2 className="text-xl font-bold text-red-900 mb-3">
            3. Public Reports & Responsible Posting
          </h2>
          <p className="mb-4 font-medium text-red-800">
            Reports submitted and approved may become publicly visible. To protect
            both users and the platform, all reports must follow these rules:
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center gap-2 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span>Do not include phone numbers, ID numbers, or home addresses.</span>
            </li>
            <li className="flex items-center gap-2 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span>Do not include identifying details that could expose a private individual.</span>
            </li>
            <li className="flex items-center gap-2 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <span>Avoid naming specific individuals.</span>
            </li>
          </ul>
          <p className="text-red-800">
            kuwaMakini focuses on documenting scam tactics and patterns — not
            accusing specific people. Reports that contain personal accusations or
            private information may be edited or rejected during moderation.
          </p>
        </section>

        {/* Section 4 */}
        <section id="info">
          <h2 className="text-xl font-semibold mb-3">
            4. Information We May Temporarily Process
          </h2>
          <p className="mb-4">The platform may process limited technical data:</p>
          <ul className="list-disc ml-6 space-y-2">
            <li>Scam reports submitted by users</li>
            <li>General location information provided voluntarily in reports (e.g., town or area)</li>
            <li>Temporary technical data used to prevent spam or abuse</li>
            <li>Anonymous usage analytics used to improve the platform</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="abuse" className="p-5 bg-slate-50 rounded-lg border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            5. IP Address Handling & Abuse Prevention
          </h2>
          <p className="mb-4 text-slate-900">
            To prevent spam submissions and automated abuse, the platform may
            temporarily use IP addresses for rate-limiting security checks.
          </p>
          <p className="text-slate-800">
            These IP addresses are not stored in a permanent database and are only
            used in short-term memory to detect excessive submissions or bot
            activity. This helps prevent coordinated misinformation or attempts to
            manipulate scam reports.
          </p>
        </section>

        {/* Section 6 */}
        <section id="purpose">
          <h2 className="text-xl font-semibold mb-3">
            6. Purpose of Data Processing
          </h2>
          <ul className="list-disc ml-6 space-y-2 mb-4">
            <li>Publish verified scam awareness reports</li>
            <li>Identify emerging scam patterns</li>
            <li>Prevent spam or malicious submissions</li>
            <li>Maintain platform security and reliability</li>
          </ul>
          <p>
            kuwaMakini does not sell personal data and does not use submitted
            information for advertising purposes.
          </p>
        </section>

        {/* Section 7 */}
        <section id="moderation">
          <h2 className="text-xl font-semibold  mb-3">
            7. Moderation & Accountability
          </h2>
          <p>
            All reports are reviewed before publication. Moderators may edit,
            reject, or remove submissions that violate platform rules or contain
            sensitive personal information.
          </p>
        </section>

        {/* Section 8 */}
        <section id="security">
          <h2 className="text-xl font-semibold mb-3">8. Data Security</h2>
          <p>
            Reasonable safeguards are used to protect submitted information.
            However, no online platform can guarantee absolute security.
          </p>
        </section>

        {/* Section 9 */}
                <section id="noAuthority">
                    <h2 className="text-xl font-semibold mt-6 mb-2">
                        9. Reporting to Authorities
                    </h2>

                    <p className="mb-4">
                        kuwaMakini is an awareness platform designed to help communities stay
                        informed about scam tactics and deceptive activities.
                    </p>

                    <p className="mb-4">
                        Submitting a report on this platform does not replace reporting the
                        incident to local law enforcement or relevant authorities.
                    </p>

                    <p className="mb-4">
                        If you have experienced fraud, theft, harassment, or any criminal
                        activity, you are encouraged to report the incident to the appropriate
                        authorities so that official investigations and legal action can take
                        place.
                    </p>

                    <p className="mb-4">
                        Reports shared on kuwaMakini are intended for public awareness and
                        community education. The platform does not conduct criminal
                        investigations or enforce legal action.
                    </p>
                </section>

{/* Section 10: Responsible Awareness */}
        <section id="responsible-awareness" className="p-5 bg-slate-50 rounded-lg border border-slate-20">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">
            10. Responsible Awareness
          </h2>
          
          <p className="mb-4 text-slate-900">
            The platform, (kuwaMakini) shares scam awareness for public safety. While transparency
            helps communities stay informed, detailed operational information could
            potentially be misused.
          </p>

          <p className="mb-4 text-slate-900">
            For this reason, reports are reviewed and may be edited to remove
            specific details that could enable harmful activity. The platform
            focuses on identifying patterns, warning signs, and trends rather than
            publishing step-by-step descriptions of scams.
          </p>

          <p className="mb-4 text-slate-900">
            Older reports may be summarized through <strong> analytics</strong> and <strong>visualizations</strong> to
            highlight trends while reducing the risk of misuse.
          </p>
        </section>

                {/* Section 11 */}
                <section id="updates" className="pb-12">
                    <h2 className="text-xl font-semibold mb-3">
                        10. Updates to This Policy
                    </h2>
                    <p>
                        This Privacy Policy may be updated periodically as the platform evolves.
                        Updates will be reflected on this page.
                    </p>
                </section>
            </div>

            <BackToTop />
        </main>
    );
}