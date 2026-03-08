"use client";

import BackToTop from "../components/BackToTop";
import HamburgerMenu from "@/app/components/HamburgerMenu";
import Footer from "../components/Footer";

export default function CommunityGuidelines() {
  return (
    <main className="max-w-3xl mx-auto p-6 text-slate-800 leading-relaxed pb-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-200">Community Guidelines</h1>
        <HamburgerMenu />
      </div>

      <p className="text-lg text-slate-300 mb-10 border-l-4 border-amber-500 pl-4 italic">
        These guidelines help keep kuwaMakini safe, responsible, and useful for
        the community. We focus on documenting tactics, not targeting individuals.
      </p>

      <div className="space-y-12">
        {/* Purpose Section */}
        <section>
          <h2 className="text-xl font-bold text-slate-300 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎯</span> Our Purpose
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-bold">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <strong>Responsible Reporting</strong>
              <p className="text-slate-500 mt-1">Encouraging factual scam awareness.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <strong>Defamation Protection</strong>
              <p className="text-slate-500 mt-1">Shielding users from false accusations.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <strong>Education First</strong>
              <p className="text-slate-500 mt-1">Focusing on prevention and signs.</p>
            </div>
          </div>
        </section>

        {/* Tactis Over Names - DOS & DON'TS */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-slate-900 p-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <span className="text-xl"></span> Tactics Over Names
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Dos */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100">
              <h3 className="text-green-700 font-bold mb-3 uppercase text-xs tracking-widest">What to do</h3>
              <ul className="space-y-3 text-sm font-bold">
                <li className="flex gap-2">✅ <span>Describe the scam method clearly.</span></li>
                <li className="flex gap-2">✅ <span>Share the general area (e.g., Bamburi, Old Town).</span></li>
                <li className="flex gap-2">✅ <span>Highlight the "Red Flags" you noticed.</span></li>
              </ul>
            </div>
            {/* Don'ts */}
            <div className="p-6 bg-red-50/30">
              <h3 className="text-red-700 font-bold mb-3 uppercase text-xs tracking-widest">What to avoid</h3>
              <ul className="space-y-3 text-sm font-bold">
                <li className="flex gap-2">❌ <span>Do not name specific individuals.</span></li>
                <li className="flex gap-2">❌ <span>No phone numbers, IDs, or home addresses.</span></li>
                <li className="flex gap-2">❌ <span>Avoid personal revenge or grudges.</span></li>
              </ul>
            </div>
          </div>
        </section>

        {/* Prohibited Content */}
        <section>
          <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span className="text-2xl"></span> Prohibited Content
          </h2>
          <div className="bg-slate-200 font-bold p-6 rounded-xl border border-slate-200">
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Hate speech or threats.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Identifying private info.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Scam "How-to" manuals.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>Malicious misinformation.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Moderation Section */}
        <section className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span className="text-2xl"></span> Moderation Rights
          </h2>
          <p className="text-amber-800 text-sm mb-4">
            To maintain the integrity of <strong>kuwaMakini</strong>, all submissions undergo review.
          </p>
          <ul className="space-y-2 text-sm text-amber-900">
            <li className="flex gap-2 font-medium">• <span>Moderators may edit reports to remove sensitive details.</span></li>
            <li className="flex gap-2 font-medium">• <span>Reports may be summarized to highlight trends.</span></li>
            <li className="flex gap-2 font-medium">• <span>Guidelines violations will result in rejected reports.</span></li>
          </ul>
        </section>

        {/* Removal Policy */}
        <section className="pb-10 border border-amber-100 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-slate-200 mb-3">Content Removal Policy</h2>
          <p className="text-slate-300">
            Content may be removed if it contains defamatory accusations,
            sensitive personal information or violates these guidelines.
          </p>
        </section>
      </div>

      <BackToTop />
      <Footer />
    </main>
  );
}