"use client"; 
import HamburgerMenu from "@/app/components/HamburgerMenu";
import BackToTop from "../components/BackToTop";

import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("Submitted for review. Thank you!");
        setForm({ name: "", email: "", message: "" });
      } else {
        const data = await res.json();
        if (res.status === 429 && data.error) {
          setStatus(data.error);
        } else {
          setStatus("Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      setStatus("Network error. Please check your connection.");
    }
  }

  return (
      <main className="max-w-2xl mx-auto p-6 text-slate-800">
          <header className="mb-8 border-b pb-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="mr-10">
                      <h1 className="text-3xl font-bold text-slate-50 mb-3">Leave a Message</h1>
                      <p className="text-slate-100 leading-relaxed">
                          If a report contains incorrect or sensitive information, or you wish to flag,
                          request removal, or suggest corrections, please reach out. We take community
                          safety and accuracy seriously.
                      </p>
                  </div>
                  <HamburgerMenu />
              </div>
          </header>

          <div className="bg-slate-700 border border-slate-200 rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">
              Your Name <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Anonymous Reporter"
              className="w-full text-slate-400 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">
              Your Email <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full border text-slate-400 border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe the issue you are referring to..."
              className="w-full border text-slate-100 border-slate-200 p-3 rounded-xl min-h-37.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              required
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
          >
            Submit for Review
          </button>

          {status && (
            <div className={`p-4 rounded-lg text-sm font-medium text-center ${
              status.includes("Thank you") 
                ? "bg-green-50 text-green-700 border border-green-100" 
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}>
              {status}
            </div>
          )}
        </form>
      </div>
      
      <footer className="mt-8 text-center">
        <p className="text-xs text-slate-400 uppercase tracking-widest">
          kuwaMakini • Moderation Team
        </p>
      </footer>
      <BackToTop />
    </main>
  );
}