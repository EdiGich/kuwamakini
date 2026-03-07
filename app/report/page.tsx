'use client'

import { useState } from 'react'
import HamburgerMenu from "@/app/components/HamburgerMenu";
import BackToTop from "@/app/components/BackToTop";

export default function ReportPage() {
  const [type, setType] = useState('other')
  const [area, setArea] = useState('')
  const [description, setDescription] = useState('')
  const [incidentDate, setIncidentDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim()) {
      setMessage('Description is required.')
      return
    }
    if (description.length > 2000) {
      setMessage('Description is too long.')
      return
    }

    try {
      setLoading(true)
      setMessage('')
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          area,
          description,
          incident_date: incidentDate || null
        })
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Something went wrong.')
      } else {
        setMessage('Report Submitted for Review. Thank you for keeping the community informed.')
        setDescription('')
        setArea('')
        setIncidentDate('')
        setType('other')
      }
    } catch (err) {
      setMessage('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-2xl mx-auto text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Report a Scam</h1>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-1">Submit Incident</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest border-b border-slate-800 pb-1"
          >
            Back to Feed
          </a>
          <HamburgerMenu />
        </div>
      </div>

      {/* Security Warning Card */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 mb-8">
        <h2 className="text-amber-500 font-bold text-sm flex items-center gap-2 mb-2">
          <span>🛡️</span> Security Check
        </h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Do <span className="text-white font-bold underline">NOT</span> include names, phone numbers, or home addresses. 
          Focus on the <span className="text-white font-bold uppercase">method</span> used. Reports with private info will be rejected.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Type of Incident</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-slate-800 border-none text-white p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer appearance-none"
          >
            <option value="other">Other / Not Listed</option>
            <option value="matatu_pickpocket">Matatu Pickpocketing</option>
            <option value="tuktuk_pickpocket">Tuk-Tuk Pickpocketing</option>
            <option value="fake_landlord">Fake Landlord</option>
            <option value="fake_police">Fake Police / Impersonation</option>
            <option value="fake_job">Fake Job Listing</option>
            <option value="mpesa">M-Pesa / Mobile Money Scam</option>
            <option value="fake_gold">Fake Gold / Mineral Scam</option>
            <option value="fake_emergency">Fake Emergency Call</option>
            <option value="atm_distraction">ATM Distraction / Card Swap</option>
            <option value="marketplace">Online Marketplace Scam</option>
            <option value="tourist_target">Tourist Targeting</option>
          </select>
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Area / Location</label>
          <input
            type="text"
            placeholder="e.g. Nyali, CBD, Likoni"
            value={area}
            maxLength={50}
            onChange={(e) => setArea(e.target.value)}
            className="w-full bg-slate-800 border-none text-white p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none placeholder:text-slate-600"
          />
        </div>

        {/* Description Textarea */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">The Tactic Used</label>
          <textarea
            placeholder="Eleza kwa kina. Describe the incident. What were the warning signs?"
            value={description}
            maxLength={2000}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border-none text-white p-4 rounded-xl h-48 focus:ring-2 focus:ring-amber-500 outline-none resize-none placeholder:text-slate-600 leading-relaxed"
            required
          />
          <div className="flex justify-between px-1">
             <span className="text-[10px] text-slate-600 uppercase font-bold">Max 2000 chars</span>
             <span className={`text-[10px] font-bold ${description.length > 1800 ? 'text-amber-500' : 'text-slate-600'}`}>
                {description.length} / 2000
             </span>
          </div>
        </div>

        {/* Incident Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Approximate Date (Optional)</label>
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full bg-slate-800 border-none text-white p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none scheme-dark"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all sword-glimmer shadow-lg ${
            loading 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-amber-500 text-slate-900 hover:bg-amber-600 active:scale-95 shadow-amber-500/20'
          }`}
        >
          {loading ? 'Processing...' : 'Submit Report'}
        </button>

        {/* Feedback Message */}
        {message && (
          <div className={`p-4 rounded-xl text-sm font-bold text-center border animate-in fade-in slide-in-from-top-2 ${
            message.includes('Submitted') 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            {message}
          </div>
        )}
      </form>

      {/* Footer Disclaimer */}
      <footer className="mt-12 text-center border-t border-slate-800 pt-8 pb-10">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-medium leading-loose">
          Reports are user-submitted and undergo moderation review. <br />
          we documents patterns, not individuals.
        </p>
      </footer>
      <BackToTop />
    </main>
  )
}