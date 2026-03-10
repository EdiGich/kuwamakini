'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()

  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'error' } | null>(null);

  // Modal & Selection State
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Similarity State
  const [similarReports, setSimilarReports] = useState<any[]>([])
  const [checkingSimilarity, setCheckingSimilarity] = useState(false)

  const [metrics, setMetrics] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 })

  // AI Inline State (shows result below report, not in modal)
  const [aiProcessing, setAIProcessing] = useState<string | null>(null)
  const [aiResults, setAIResults] = useState<{ [reportId: string]: any }>({})

  // Manual Approval State
  const [manualApprovals, setManualApprovals] = useState<{ [reportId: string]: any }>({})
  const [manualFormSubmitting, setManualFormSubmitting] = useState<string | null>(null)

  async function startAIProcess(report: any) {
    setAIProcessing(report.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setToast({ message: "You must be logged in", type: 'error' })
        setAIResults(prev => ({ ...prev, [report.id]: { error: "Authentication required" } }))
        setAIProcessing(null)
        return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const res = await fetch('/api/admin/process-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.id, adminId: user?.id }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // Check HTTP status first
      if (!res.ok) {
        let errorMsg = `Server error: ${res.status}`
        try {
          const errorData = await res.json()
          // errorMsg = errorData.error || errorMsg
          errorMsg = typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error)

        } catch (e) {
          // If error response isn't JSON, use the status message
        }
        setToast({ message: errorMsg, type: 'error' })
        setAIResults(prev => ({ ...prev, [report.id]: { error: errorMsg } }))
        return
      }

      let data = null
      try {
        data = await res.json()
        console.log("AI API response:", data)
      } catch (jsonErr) {
        const errorMsg = "AI service returned invalid response format"
        setToast({ message: errorMsg, type: 'error' })
        setAIResults(prev => ({ ...prev, [report.id]: { error: errorMsg } }))
        return
      }

      // Validate response structure
      if (!data.success) {
        const errorMsg = data.error || "AI processing failed"
        setToast({ message: errorMsg, type: 'error' })
        setAIResults(prev => ({ ...prev, [report.id]: { error: errorMsg } }))
        return
      }

      if (!data.result || !data.result.clean_description) {
        const errorMsg = "AI returned incomplete data"
        setToast({ message: errorMsg, type: 'error' })
        setAIResults(prev => ({ ...prev, [report.id]: { error: errorMsg } }))
        return
      }

      // Success! Store the result
      setAIResults(prev => ({ ...prev, [report.id]: { ...data.result, is_edited: false } }))
      setToast({ message: "Report sanitized successfully!", type: 'info' })
      setTimeout(() => setToast(null), 2000)
    } catch (err: any) {
      let errorMsg = "Failed to process report"
      if (err.name === 'AbortError') {
        errorMsg = "AI processing timed out (took too long)"
      } else if (err instanceof TypeError) {
        errorMsg = "Network error - check your connection"
      } else {
        // errorMsg = err?.message || errorMsg
        errorMsg = typeof err?.message === "string"
          ? err.message
          : JSON.stringify(err)
      }
      setToast({ message: errorMsg, type: 'error' })
      setAIResults(prev => ({ ...prev, [report.id]: { error: errorMsg } }))
    } finally {
      setAIProcessing(null)
    }
  }

  // Approve sanitized AI result and publish
  async function approveAISanitization(reportId: string) {
    setActionLoading(reportId)
    try {
      const aiResult = aiResults[reportId]
      
      // Check if report should be rejected based on quality classification
      if (aiResult.report_quality === 'GIBBERISH') {
        // Reject with gibberish reason
        const res = await fetch('/api/admin/reports', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: reportId,
            reason: 'Rejected by AI: Report is gibberish or incoherent'
          })
        })
        
        if (res.ok) {
          setReports(prev => prev.filter(r => r.id !== reportId))
          setMetrics(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }))
          setAIResults(prev => { const newResults = { ...prev }; delete newResults[reportId]; return newResults })
          setToast({ message: "Report rejected: Rejected by AI: Report is gibberish or incoherent", type: 'info' })
          setTimeout(() => setToast(null), 3000)
        } else {
          setToast({ message: "Failed to reject report", type: 'error' })
        }
      } else if (aiResult.report_quality === 'EXAGGERATED/FALSE') {
        // Reject with false/exaggerated reason
        const res = await fetch('/api/admin/reports', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: reportId,
            reason: 'Rejected by AI: Report is exaggerated or false'
          })
        })
        
        if (res.ok) {
          setReports(prev => prev.filter(r => r.id !== reportId))
          setMetrics(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }))
          setAIResults(prev => { const newResults = { ...prev }; delete newResults[reportId]; return newResults })
          setToast({ message: "Report rejected: Rejected by AI: Report is exaggerated or false", type: 'info' })
          setTimeout(() => setToast(null), 3000)
        } else {
          setToast({ message: "Failed to reject report", type: 'error' })
        }
      } else {
        // LEGITIMATE report - approve and publish
        const res = await fetch('/api/admin/reports', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: reportId,
            cleanDescription: aiResult.clean_description,
            scamCategory: aiResult.scam_category,
            county: aiResult.county,
            specificArea: aiResult.specific_area,
            riskLevel: aiResult.risk_level,
            processingMethod: aiResult.is_edited ? 'ai_and_moderator' : 'ai'
          })
        })
        
        if (res.ok) {
          setReports(prev => prev.filter(r => r.id !== reportId))
          setMetrics(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }))
          setAIResults(prev => { const newResults = { ...prev }; delete newResults[reportId]; return newResults })
          const message = aiResult.is_edited 
            ? "Report approved and published (AI + Moderator edits)!"
            : "Report sanitized and published!"
          setToast({ message, type: 'info' })
          setTimeout(() => setToast(null), 3000)
        } else {
          setToast({ message: "Failed to approve report", type: 'error' })
        }
      }
    } catch (err) {
      setToast({ message: "Failed to process report", type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  // Cancel AI sanitization
  function discardAISanitization(reportId: string) {
    setAIResults(prev => { const newResults = { ...prev }; delete newResults[reportId]; return newResults })
  }

  // Open manual approval form
  function openManualApprovalForm(report: any) {
    setManualApprovals(prev => ({
      ...prev,
      [report.id]: {
        cleanDescription: report.description,
        scamCategory: '',
        county: '',
        specificArea: report.area || '',
        riskLevel: 3
      }
    }))
  }

  // Update manual form field
  function updateManualField(reportId: string, field: string, value: any) {
    setManualApprovals(prev => ({
      ...prev,
      [reportId]: {
        ...prev[reportId],
        [field]: value
      }
    }))
  }

  // Submit manual approval
  async function submitManualApproval(report: any, formData: any) {
    if (!formData.cleanDescription || !formData.scamCategory) {
      setToast({ message: "Clean description and category are required", type: 'error' })
      return
    }

    setManualFormSubmitting(report.id)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const res = await fetch('/api/admin/manual-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          adminId: user?.id,
          cleanDescription: formData.cleanDescription,
          scamCategory: formData.scamCategory,
          county: formData.county,
          specificArea: formData.specificArea,
          riskLevel: formData.riskLevel
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setReports(prev => prev.filter(r => r.id !== report.id))
        setMetrics(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }))
        setManualApprovals(prev => { const newForms = { ...prev }; delete newForms[report.id]; return newForms })
        setToast({ message: "Report manually approved and published!", type: 'info' })
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast({ message: data.error || "Failed to approve report", type: 'error' })
      }
    } catch (err: any) {
      setToast({ message: err?.message || "Network error", type: 'error' })
    } finally {
      setManualFormSubmitting(null)
    }
  }

  // Cancel manual approval
  function discardManualApproval(reportId: string) {
    setManualApprovals(prev => { const newForms = { ...prev }; delete newForms[reportId]; return newForms })
  }

  // 1. Fetching logic
  async function fetchReports() {
    const res = await fetch('/api/admin/reports')
    const data = await res.json()
    if (!res.ok) { setReports([]); setLoading(false); return; }
    setReports(data.reports || [])
    setMetrics(data.metrics || { total: 0, pending: 0, approved: 0, rejected: 0 })
    setLoading(false)
  }

  // 2. Auth Check
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return; }
      fetchReports()
    }
    checkAuth()
  }, [])

  // 3. Similarity Logic
  async function checkSimilarity(report: any) {
    setCheckingSimilarity(true)
    setSelectedReportId(report.id) // Ensure we know which report is being scanned
    try {
      const res = await fetch(`/api/admin/similarity?id=${report.id}`)
      const data = await res.json()
      setSimilarReports(data || [])

      //Trigger post if no similar reports are foud
      if (!data || data.length === 0) {
        setToast({ message: 'No similar patterns detected. This report appears unique in the queue.', type: 'info' })
        setTimeout(() => setToast(null), 3000)
      }

    } catch (err) {
      console.error("Similarity check failed", err)
    } finally {
      setCheckingSimilarity(false)
    }
  }

  // 4. Approval Logic
  async function approveReport(id: string) {
    setActionLoading(id)
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== id))
      setMetrics((prev) => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }))
    }
    setActionLoading(null)
  }

  // 5. Unified Rejection Logic (Single or Bulk)
  function openRejectModal(id: string) {
    setSelectedReportId(id)
    setRejectReason('')
    setShowRejectModal(true)
  }

  async function submitReject() {
    if (!selectedReportId) return
    setActionLoading(selectedReportId)

    // Determine if we are doing a bulk action or single
    const isBulk = similarReports.length > 0
    const endpoint = isBulk ? '/api/admin/reports/bulk' : '/api/admin/reports'
    const body = isBulk
      ? { ids: [selectedReportId, ...similarReports.map(r => r.id)], reason: rejectReason }
      : { id: selectedReportId, reason: rejectReason }

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const removedIds = isBulk ? [selectedReportId, ...similarReports.map(r => r.id)] : [selectedReportId]
      setReports((prev) => prev.filter((r) => !removedIds.includes(r.id)))

      // Update metrics
      setMetrics((prev) => ({
        ...prev,
        pending: prev.pending - removedIds.length,
        rejected: prev.rejected + removedIds.length
      }))

      setShowRejectModal(false)
      setSimilarReports([])
    }
    setActionLoading(null)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-amber-500"></div>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-6 md:p-12 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Moderation Queue</h1>
          <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Admin Terminal</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admn-nyuma-ya-tent/audit" className="text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors uppercase tracking-widest border border-slate-800 px-4 py-2 rounded-lg flex items-center">
            View Audit Logs
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="text-[10px] font-black text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <MetricCard label="Queue" value={metrics.pending} color="text-amber-500" bg="bg-amber-500/5" border="border-amber-500/20" />
        <MetricCard label="Approved" value={metrics.approved} color="text-emerald-500" bg="bg-emerald-500/5" border="border-emerald-500/20" />
        <MetricCard label="Rejected" value={metrics.rejected} color="text-rose-500" bg="bg-rose-500/5" border="border-rose-500/20" />
        <MetricCard label="Total Lifetime" value={metrics.total} color="text-slate-400" bg="bg-slate-800/20" border="border-slate-800" />
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
          <p className="text-slate-500 font-medium">The queue is empty. All clear!</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {reports.map((report) => (
            <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded">
                      {report.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-white font-bold mt-3 text-xl">{report.area || 'Unknown Location'}</h3>
                  </div>
                  <span className="text-[10px] text-slate-600 font-mono tracking-widest">UID: {report.id.slice(0, 8)}</span>
                </div>

                <p className="text-slate-300 leading-relaxed mb-8 text-lg whitespace-pre-wrap">{report.description}</p>

                {/* AI Sanitization Result - Inline Display */}
                {aiResults[report.id] && !aiResults[report.id].error && (
                  <div className={`mb-6 border border-amber-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top-2 ${
                    aiResults[report.id].report_quality === 'LEGITIMATE' ? 'bg-slate-800/50' :
                    aiResults[report.id].report_quality === 'GIBBERISH' ? 'bg-rose-500/10 border-rose-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-black text-amber-500 uppercase tracking-widest">✨ AI Analysis Result</h4>
                      <div className="flex gap-2 items-center">
                        {aiResults[report.id].report_quality === 'LEGITIMATE' && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/30">
                            ✓ Legitimate
                          </span>
                        )}
                        {aiResults[report.id].report_quality === 'GIBBERISH' && (
                          <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-3 py-1 rounded-full border border-rose-500/30">
                            ⚠ Gibberish
                          </span>
                        )}
                        {aiResults[report.id].report_quality === 'EXAGGERATED/FALSE' && (
                          <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-500/30">
                            ⚠ False/Exaggerated
                          </span>
                        )}
                        <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full border border-amber-500/20">
                          Risk: {aiResults[report.id].risk_level}/5
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sanitized Description</label>
                          {aiResults[report.id].is_edited && (
                            <span className="text-[9px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                              Edited by Moderator
                            </span>
                          )}
                        </div>
                        <textarea
                          value={aiResults[report.id].clean_description}
                          onChange={(e) => {
                            setAIResults(prev => ({
                              ...prev,
                              [report.id]: {
                                ...prev[report.id],
                                clean_description: e.target.value,
                                is_edited: true
                              }
                            }))
                          }}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 text-sm focus:ring-2 focus:ring-amber-500 outline-none transition resize-none"
                          rows={4}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Category</p>
                          <p className="text-white font-bold text-xs">{aiResults[report.id].scam_category}</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">County</p>
                          <p className="text-white font-bold text-xs">{aiResults[report.id].county}</p>
                        </div>
                        <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-700">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Area</p>
                          <p className="text-white font-bold text-xs">{aiResults[report.id].specific_area}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => discardAISanitization(report.id)}
                        className="flex-1 py-2 text-sm rounded-lg text-slate-400 hover:bg-slate-700 transition-all uppercase font-bold"
                      >
                        Discard
                      </button>
                      <button
                        onClick={() => approveAISanitization(report.id)}
                        disabled={actionLoading === report.id}
                        className={`flex-1 py-2 text-sm rounded-lg font-black uppercase transition-all disabled:opacity-50 ${
                          aiResults[report.id].report_quality === 'LEGITIMATE' 
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : aiResults[report.id].report_quality === 'GIBBERISH'
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-500 text-slate-950'
                        }`}
                      >
                        {actionLoading === report.id 
                          ? 'Processing...' 
                          : aiResults[report.id].report_quality === 'LEGITIMATE'
                          ? 'Approve & Publish'
                          : aiResults[report.id].report_quality === 'GIBBERISH'
                          ? 'Reject (Gibberish)'
                          : 'Reject (False)'
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Error Display */}
                {aiResults[report.id]?.error && (
                  <div className="mb-6 bg-rose-500/10 border border-rose-500/30 p-4 rounded-2xl animate-in fade-in">
                    <p className="text-rose-500 text-sm font-semibold mb-2">❌ AI Processing Error</p>
                    <p className="text-rose-400 text-xs">
                      {String(aiResults[report.id].error)}
                    </p>
                    <button
                      onClick={() => discardAISanitization(report.id)}
                      className="text-xs mt-2 text-rose-400 underline hover:text-rose-300"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Manual Approval Form */}
                {manualApprovals[report.id] && (
                  <div className="mb-6 bg-slate-800/50 border border-emerald-500/30 p-6 rounded-2xl animate-in fade-in slide-in-from-top-2">
                    <h4 className="text-sm font-black text-emerald-500 uppercase tracking-widest mb-4">📋 Manual Approval Form</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sanitized Description *</label>
                        <textarea
                          value={manualApprovals[report.id].cleanDescription}
                          onChange={(e) => updateManualField(report.id, 'cleanDescription', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-4 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Scam Category *</label>
                        <input
                          type="text"
                          placeholder="e.g., Fake Landlord, ATM Distraction, Pickpocketing"
                          value={manualApprovals[report.id].scamCategory}
                          onChange={(e) => updateManualField(report.id, 'scamCategory', e.target.value)}
                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">County</label>
                          <input
                            type="text"
                            placeholder="e.g., Mombasa"
                            value={manualApprovals[report.id].county}
                            onChange={(e) => updateManualField(report.id, 'county', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Specific Area</label>
                          <input
                            type="text"
                            placeholder="e.g., Nyali"
                            value={manualApprovals[report.id].specificArea}
                            onChange={(e) => updateManualField(report.id, 'specificArea', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Risk Level (1-5)</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => updateManualField(report.id, 'riskLevel', level)}
                              className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase transition ${
                                manualApprovals[report.id].riskLevel === level
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4 pt-4 border-t border-slate-700">
                      <button
                        onClick={() => discardManualApproval(report.id)}
                        className="flex-1 py-2 text-sm rounded-lg text-slate-400 hover:bg-slate-700 transition-all uppercase font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => submitManualApproval(report, manualApprovals[report.id])}
                        disabled={manualFormSubmitting === report.id}
                        className="flex-1 py-2 text-sm rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase transition-all disabled:opacity-50"
                      >
                        {manualFormSubmitting === report.id ? 'Submitting...' : 'Submit & Publish'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Similarity Cluster Alert */}
                {similarReports.length > 0 && selectedReportId === report.id && (
                  <div className="mb-6 bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">⚠️</span>
                      <p className="text-xs font-black text-rose-500 uppercase tracking-widest">
                        {similarReports.length} Similar Scripts Detected in Queue
                      </p>
                    </div>
                    <button
                      onClick={() => openRejectModal(report.id)}
                      className="text-[10px] font-black bg-rose-600 text-white px-3 py-1.5 rounded-lg uppercase hover:bg-rose-500 transition-colors"
                    >
                      Bulk Reject Cluster
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-6 border-t border-slate-800/50">
                  <button
                    onClick={() => openManualApprovalForm(report)}
                    disabled={!!manualApprovals[report.id] || !!actionLoading}
                    className="flex-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
                  >
                    {manualApprovals[report.id] ? 'Form Open' : 'Approve Report'}
                  </button>
                  {/* AI BUTTON */}
                  <button
                    onClick={() => startAIProcess(report)}
                    disabled={aiProcessing === report.id || !!aiResults[report.id]}
                    className="flex-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {aiProcessing === report.id ? '⏳ Processing...' : '✨ Sanitize with AI'}
                  </button>
                  <button
                    onClick={() => openRejectModal(report.id)}
                    disabled={!!actionLoading}
                    className="flex-1 bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-400 font-bold py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 uppercase text-xs tracking-widest"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => checkSimilarity(report)}
                    disabled={checkingSimilarity && selectedReportId === report.id}
                    className="p-4 bg-slate-800 rounded-2xl hover:bg-amber-500 hover:text-slate-900 transition-all group/btn"
                    title="Scan for patterns"
                  >
                    {checkingSimilarity && selectedReportId === report.id ? '...' : 'Find Similar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Modal (Handles Single and Bulk) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-black/50">
            <h2 className="text-2xl font-black text-white mb-2">
              {similarReports.length > 0 ? 'Bulk Reject Cluster' : 'Reject Report'}
            </h2>
            <p className="text-sm text-slate-400 mb-6 font-medium">
              {similarReports.length > 0
                ? `You are about to reject ${similarReports.length + 1} reports with similar patterns.`
                : 'Please provide a reason for removing this report from the public feed.'}
            </p>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Scripted scam pattern, spam, or Personal Identity Information violation..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white focus:ring-2 focus:ring-rose-500 outline-none h-40 mb-6 transition-all placeholder:text-slate-700"
            />

            <div className="flex gap-3">
              <button onClick={() => { setShowRejectModal(false); setSimilarReports([]); }} className="flex-1 px-4 py-4 rounded-xl border border-slate-800 font-bold text-slate-400 hover:bg-slate-800 transition-colors uppercase text-xs tracking-widest">
                Cancel
              </button>
              <button onClick={submitReject} className="flex-1 px-4 py-4 rounded-xl bg-rose-600 text-white font-black hover:bg-rose-500 transition-colors uppercase text-xs tracking-widest shadow-lg shadow-rose-600/20">
                {actionLoading ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-sm w-full shadow-2xl scale-in-center">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-white mb-2">Terminate Session?</h2>
              <p className="text-sm text-slate-400 font-medium">You will need your security key to re-access the Moderation Terminal.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-rose-600/20">
                Logout
              </button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all uppercase tracking-widest text-xs">
                Stay Authenticated
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-200 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-3 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 ${toast.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/50 text-rose-500'
            : 'bg-slate-900/90 border-slate-700 text-amber-500'
            }`}>
            <span className="text-lg">{toast.type === 'error' ? '🚫' : '🛡️'}</span>
            <span className="text-xs font-black uppercase tracking-widest">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-slate-500 hover:text-white">✕</button>
          </div>
        </div>
      )}

    </main>
  )
}

function MetricCard({ label, value, color, bg, border }: any) {
  return (
    <div className={`${bg} ${border} border p-6 rounded-3xl shadow-sm`}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value.toLocaleString()}</p>
    </div>
  )
}