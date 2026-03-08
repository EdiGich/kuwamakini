'use client'

import HamburgerMenu from "@/app/components/HamburgerMenu";
import BackToTop from "./components/BackToTop";
import { useEffect, useState } from 'react'
import Footer from "./components/Footer";

const KENYAN_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta',
  'Nairobi', 'Kajiado', 'Nakuru', 'Kiambu', 'Muranga', 'Nyeri', 'Kirinyaga',
  'Murang\'a', 'Embu', 'Meru', 'Isiolo', 'Samburu', 'Laikipia', 'Baringo',
  'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Kisii', 'Nyamira',
  'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Narok', 'Trans Nzoia', 'Uasin Gishu',
  'Elgeyo-Marakwet', 'Nandi', 'Turkana', 'West Pokot', 'Mandera', 'Wajir', 'Garissa'
]

export default function Home() {
  const [reports, setReports] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [type, setType] = useState('')
  const [county, setCounty] = useState('')
  const [userCounty, setUserCounty] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [preferredLanguage, setPreferredLanguage] = useState('English')
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const [onboardingSource, setOnboardingSource] = useState<'initial' | 'ai-summary'>('initial')

  // Initialize county preference from localStorage
  useEffect(() => {
    const onboardingDone = localStorage.getItem('county_onboarding_done')
    const savedCounty = localStorage.getItem('preferred_county')

    if (!onboardingDone) {
      setShowOnboarding(true)
    } else if (savedCounty) {
      setUserCounty(savedCounty)
      setCounty(savedCounty)
    }
    setMounted(true)
  }, [])

  const handleContinueWithoutCounty = () => {
    localStorage.setItem('county_onboarding_done', 'true')
    setShowOnboarding(false)
    setOnboardingSource('initial')
    setUserCounty('')
  }

  const handleSelectCounty = (selected: string) => {
    localStorage.setItem('county_onboarding_done', 'true')
    localStorage.setItem('preferred_county', selected)
    setUserCounty(selected)
    setCounty(selected)
    setShowOnboarding(false)
    setOnboardingSource('initial')
  }

  const handleChangeCounty = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value
    setCounty(selected)
    localStorage.setItem('preferred_county', selected)
    setUserCounty(selected)
  }

  async function fetchReports() {
    setLoading(true)
    let url = '/api/reports?sort=recent'
    if (type) url += `&type=${type}`
    if (county) url += `&county=${county}`
    const res = await fetch(url)
    const data = await res.json()
    setReports(data)
    setLoading(false)
  }

  async function fetchTrending() {
    const res = await fetch('/api/reports/trending')
    const data = await res.json()
    setTrending(data)
  }

  async function generateAISummary() {
    if (!county) {
      // Show modal to select county for AI summary
      setOnboardingSource('ai-summary')
      setShowOnboarding(true)
      return
    }

    setAiLoading(true)
    try {
      const feedData = reports.map(r => ({
        category: r.scam_category,
        county: r.county,
        area: r.specific_area,
        description: r.clean_description
      }))

      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reports: feedData,
          county,
          language: preferredLanguage
        })
      })

      const data = await response.json()
      if (data.summary) {
        setAiSummary(data.summary)
        // Auto-scroll to AI summary section
        setTimeout(() => {
          const element = document.getElementById('ai-summary-section')
          element?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else if (data.error) {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      alert('Failed to generate summary. Please try again.')
    }
    setAiLoading(false)
  }

  useEffect(() => {
    if (mounted) {
      fetchReports()
    }
  }, [type, county, mounted])

  useEffect(() => {
    fetchTrending()
  }, [])

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto text-slate-200 pb-0">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md shadow-2xl">
            {onboardingSource === 'ai-summary' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-4">Select your county for a detailed summary...</h2>
                <div className="space-y-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleSelectCounty(e.target.value)
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="">Select your county...</option>
                    {KENYAN_COUNTIES.sort().map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setShowOnboarding(false)
                      setOnboardingSource('initial')
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-3 rounded-xl transition-colors font-medium text-sm"
                  >
                    Cancel AI Summary
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-3">Welcome to kuwa<span className="text-amber-500">Makini</span></h2>
                <p className="text-slate-300 mb-4">
                  We'd like to show you scam alerts relevant to your area. Select your county for personalized alerts.
                </p>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                  <p className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">Why we need this:</p>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>✓ See alerts for your area first</li>
                    <li>✓ Personalized scam trends & patterns</li>
                    <li>✓ Faster access to relevant reports</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleSelectCounty(e.target.value)
                      }
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                  >
                    <option value="">Select your county...</option>
                    {KENYAN_COUNTIES.sort().map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleContinueWithoutCounty}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 px-4 py-3 rounded-xl transition-colors font-medium text-sm"
                  >
                    Continue Without County
                  </button>
                  <p className="text-[10px] text-slate-500 text-center">
                    Your selection is stored locally on your device. You can change it anytime.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            kuwa<span className="text-amber-500">Makini</span>
          </h1>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">Kaa Rada • Stay Alert</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/report"
            className="hidden sword-glimmer md:block bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-full shadow-lg shadow-amber-500/20 transition-all duration-300 font-bold uppercase text-sm tracking-wide active:scale-95"
          >
            Report a Scam
          </a>
          <HamburgerMenu />
        </div>
      </div>

      {/* Mobile Report Button (Visible only on small screens) */}
      <a
        href="/report"
        className="md:hidden block w-full text-center bg-amber-500 text-slate-900 py-4 rounded-xl font-bold uppercase mb-8 shadow-lg shadow-amber-500/10"
      >
        Report a Scam
      </a>

      {/* Trending Section - Horizontal Scroll on Mobile */}
      {trending.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <span className="text-amber-500">🔥</span> Trending Alerts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {trending.slice(0, 3).map((item: any) => (
              <div
                key={item.type}
                className="bg-slate-800/40 border border-slate-700 p-5 rounded-2xl backdrop-blur-sm hover:border-amber-500/50 transition-colors group"
              >
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Scam Type</p>
                <p className="font-bold text-white text-lg capitalize group-hover:text-amber-500 transition-colors">
                  {item.type?.replaceAll('_', ' ') || 'Unknown'}
                </p>
                <div className="mt-3 flex items-center justify-between">
                   <span className="text-2xl font-black text-white">{item.count}</span>
                   <span className="text-[10px] bg-slate-700 px-2 py-1 rounded text-slate-300 uppercase">Reports</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="bg-slate-900/50 sticky top-4 z-40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 shadow-xl">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-slate-800 border-none text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none flex-1 cursor-pointer"
        >
          <option value="">All Scam Types</option>
          <option value="fake_landlord">Fake Landlord</option>
          <option value="fake_police">Fake Police</option>
          <option value="fake_job">Fake Job</option>
          <option value="mpesa">M-Pesa Scam</option>
          <option value="fake_gold">Fake Gold</option>
          <option value="fake_emergency">Fake Emergency Call</option>
          <option value="atm_distraction">ATM Distraction</option>
          <option value="marketplace">Online Marketplace</option>
          <option value="tourist_target">Tourist Targeting</option>
          <option value="matatu_pickpocket">Matatu Pickpocketing</option>
          <option value="tuktuk_pickpocket">Tuk-Tuk Pickpocketing</option>
          <option value="other">Other</option>
        </select>

        <select
          value={county}
          onChange={handleChangeCounty}
          className="bg-slate-800 border-none text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none flex-1 cursor-pointer"
        >
          <option value="">All Counties</option>
          {KENYAN_COUNTIES.sort().map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </section>

      {/* Reports Feed */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <span className="text-amber-500">🚨</span> Live Feed
          </h2>
          {reports.length > 0 && (
            <div className="flex items-center gap-3">
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="bg-slate-800 border-none text-white p-2 rounded-lg text-xs outline-none cursor-pointer focus:ring-1 focus:ring-amber-500"
              >
                <option>English</option>
                <option>Swahili</option>
                <option>Sheng</option>
              </select>
              <button
                onClick={generateAISummary}
                disabled={aiLoading}
                className="bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 px-4 py-2 rounded-lg font-bold text-xs tracking-wide transition-all active:scale-95"
              >
                {aiLoading ? '🤖 Analyzing...' : '✨ AI Summary'}
              </button>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center py-20 opacity-50">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p>Scanning the streets...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
             <p className="text-slate-500 italic">No reports found in this area. Stay safe.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={reports.length > 10 ? 'space-y-4 max-h-200 overflow-y-auto pr-2 custom-scrollbar' : 'space-y-4'}>
              {reports.slice(0, 30).map((report, idx) => {
                const isExpanded = expandedReport === report.id
                const displayText = isExpanded ? report.clean_description : report.clean_description?.substring(0, 150) + '...'
                
                return (
                <div
                  key={report.id ?? `report-${idx}`}
                  onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                  className="bg-slate-800/30 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer hover:border-amber-500/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">
                      {report.scam_category?.replaceAll('_', ' ') || 'Unknown'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(report.original_created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded border border-slate-600">
                      📍 {report.county}
                    </span>
                    {report.specific_area && (
                      <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded border border-slate-600">
                        {report.specific_area}
                      </span>
                    )}
                  </div>
                  <p className={`text-slate-300 text-sm leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-2'}`}>
                    {displayText}
                  </p>
                  {!isExpanded && report.clean_description?.length > 150 && (
                    <p className="text-xs text-amber-400 mt-2 font-semibold">Click to read more...</p>
                  )}
                </div>
                )
              })
            }
            </div>
          </div>
        )}
      </section>

      {/* AI Summary Section */}
      {aiSummary && (
        <section id="ai-summary-section" className="mb-20 bg-gradient-br from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🤖</span>
            <h2 className="text-2xl font-bold text-white">AI Safety Summary</h2>
          </div>
          <div className="prose prose-invert max-w-none">
            <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
              {aiSummary}
            </div>
          </div>
          <button
            onClick={() => setAiSummary(null)}
            className="mt-6 text-xs text-amber-400 hover:text-amber-300 font-semibold underline transition-colors"
          >
            ✕ Close Summary
          </button>
        </section>
      )}

      {/* Geographic Concentration Section */}
      {reports.length > 0 && (
        <section className="mt-20 mb-20">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Geographic Hotspots</h2>
            <p className="text-slate-500">
              {county ? `Crime concentration across areas in ${county}` : 'Crime concentration across counties in Kenya'}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-4xl p-8 shadow-2xl">
            <GeographicHeatmap reports={reports} selectedCounty={county} />
          </div>
        </section>
      )}

      {/* Dashboard Analytics Section */}
      <section className="mt-20 border-t border-slate-800 pt-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Security Dashboard</h2>
          <p className="text-slate-500">{county ? `Scam trends in ${county}` : 'Visualized data from community reports to help you spot emerging trends.'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-4xl p-8 shadow-2xl">
          <Dashboard selectedCounty={county} />
        </div>
      </section>
      <BackToTop />
      <Footer />
    </main>
  )
}

function GeographicHeatmap({ reports, selectedCounty }: { reports: any[]; selectedCounty: string }) {
  // Group by county or area depending on selection
  const groupedData = selectedCounty
    ? // Group by specific_area when county is selected
      reports.reduce((acc: Record<string, number>, r: any) => {
        const area = r.specific_area || 'Unknown Area'
        acc[area] = (acc[area] || 0) + 1
        return acc
      }, {})
    : // Group by county when no county selected
      reports.reduce((acc: Record<string, number>, r: any) => {
        const county = r.county || 'Unknown County'
        acc[county] = (acc[county] || 0) + 1
        return acc
      }, {})

  const sorted = Object.entries(groupedData)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)

  const maxCount = Math.max(...sorted.map(d => d.count), 1)

  // Color intensity based on count
  const getIntensityColor = (count: number) => {
    const intensity = count / maxCount
    if (intensity >= 0.8) return 'bg-red-600'
    if (intensity >= 0.6) return 'bg-orange-600'
    if (intensity >= 0.4) return 'bg-amber-500'
    if (intensity >= 0.2) return 'bg-yellow-500'
    return 'bg-yellow-200'
  }

  const getIntensityLabel = (count: number) => {
    const intensity = count / maxCount
    if (intensity >= 0.8) return '🔴 Critical'
    if (intensity >= 0.6) return '🟠 Very High'
    if (intensity >= 0.4) return '🟡 High'
    if (intensity >= 0.2) return '🟨 Moderate'
    return '🟩 Low'
  }

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-xs text-slate-300">Critical (80%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-600 rounded"></div>
          <span className="text-xs text-slate-300">Very High (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"></div>
          <span className="text-xs text-slate-300">High (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-xs text-slate-300">Moderate (20-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span className="text-xs text-slate-300">Low (&lt;20%)</span>
        </div>
      </div>

      {/* Heat Map Grid */}
      <div className="space-y-3">
        {sorted.map((item, idx) => (
          <div key={`${item.location}-${idx}`} className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white capitalize max-w-xs truncate">{item.location}</span>
              <div className="flex items-center gap-3">
                <span className="text-lg">{getIntensityLabel(item.count)}</span>
                <span className="text-xs font-bold text-amber-400 min-w-12 text-right">{item.count} reports</span>
              </div>
            </div>
            <div className="w-full bg-slate-700/30 rounded-full h-8 overflow-hidden border border-slate-600">
              <div
                className={`h-full ${getIntensityColor(item.count)} transition-all duration-500 flex items-center justify-center`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              >
                {(item.count / maxCount) * 100 > 15 && (
                  <span className="text-xs font-bold text-white mix-blend-overlay">
                    {Math.round((item.count / reports.length) * 100)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Total Reports</p>
          <p className="text-2xl font-bold text-white">{reports.length}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Hottest Area</p>
          <p className="text-lg font-bold text-amber-400 truncate">{sorted[0]?.location || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Concentration</p>
          <p className="text-2xl font-bold text-orange-400">{Math.round((sorted[0]?.count || 0) / reports.length * 100)}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Areas/Counties</p>
          <p className="text-2xl font-bold text-sky-400">{sorted.length}</p>
        </div>
      </div>
    </div>
  )
}

function Dashboard({ selectedCounty }: { selectedCounty: string }) {
  const [data, setData] = useState<any[]>([])
  const [city, setCity] = useState<string>('')

  useEffect(() => {
    async function fetchAll() {
      let url = '/api/reports?sort=recent'
      if (selectedCounty) {
        url += `&county=${selectedCounty}`
      }
      const res = await fetch(url)
      const all = await res.json()
      setData(all || [])
    }
    fetchAll()
  }, [selectedCounty])

  // If county is selected, show areas within that county; otherwise show counties
  const filterOptions = selectedCounty 
    ? Array.from(new Set(data.map((d: any) => d.specific_area).filter(Boolean))).sort()
    : Array.from(new Set(data.map((d: any) => d.county).filter(Boolean))).sort()

  const byType = (selectedFilter: string) => {
    let filtered = data
    
    if (selectedCounty) {
      // Filter by area when county is selected
      if (selectedFilter) {
        filtered = data.filter((d: any) => d.specific_area === selectedFilter)
      }
    } else {
      // Filter by county when no county is selected
      if (selectedFilter) {
        filtered = data.filter((d: any) => d.county === selectedFilter)
      }
    }
    
    const counts: Record<string, number> = {}
    filtered.forEach((r: any) => {
      const t = r.scam_category || 'other'
      counts[t] = (counts[t] || 0) + 1
    })
    return Object.entries(counts).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)
  }

  const chartData = byType(city)
  const total = chartData.reduce((s, c) => s + c.count, 0)

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/50 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <label className="text-xs font-black uppercase text-slate-500 tracking-widest">
            Filter by {selectedCounty ? 'Area' : 'County'}:
          </label>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            className="bg-slate-700 text-white p-2 rounded-lg text-sm outline-none border-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">{selectedCounty ? `Full ${selectedCounty}` : 'All Counties'}</option>
            {filterOptions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div className="text-sm font-bold">
          <span className="text-slate-500 uppercase mr-2 tracking-tighter">Total Tracked:</span>
          <span className="bg-amber-500 text-slate-900 px-3 py-1 rounded-full text-lg">{total}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-800/50">
          <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Top Scam Methods</h3>
          <BarChart data={chartData} />
        </div>

        <div className="bg-slate-800/20 p-6 rounded-3xl border border-slate-800/50">
          <h3 className="text-lg font-bold text-white mb-6 border-l-4 border-amber-500 pl-3">Method Distribution</h3>
          <PieChart data={chartData} total={total} />
        </div>
      </div>
    </div>
  )
}

function BarChart({ data }: { data: any[] }) {
  const top = data.slice(0, 10)
  const max = top.length ? Math.max(...top.map((d) => d.count)) : 1

  return (
    <div className="space-y-4">
      {top.map((d) => (
        <div key={d.type} className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
            <span className="text-slate-400">{d.type?.replaceAll('_', ' ') || 'Unknown'}</span>
            <span className="text-white">{d.count}</span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full bg-amber-500 transition-all duration-1000 ease-out" 
              style={{ width: `${(d.count / max) * 100}%` }} 
            />
          </div>
        </div>
      ))}
      {top.length === 0 && <div className="text-sm text-slate-600 italic">No metrics available</div>}
    </div>
  )
}

function PieChart({ data, total }: { data: any[]; total: number }) {
  const top = data.slice(0, 6)
  const radius = 60
  const center = radius + 10
  let angle = -90

  const arcs = top.map((d) => {
    const portion = total ? (d.count / total) : 0
    const sweep = portion * 360
    const start = angle
    const end = angle + sweep
    angle = end
    return { ...d, start, end }
  })

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const a = (angleDeg - 90) * (Math.PI / 180.0)
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle)
    const end = polarToCartesian(x, y, r, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} L ${x} ${y} Z`
  }

  const getTextPosition = (startAngle: number, endAngle: number) => {
    const midAngle = (startAngle + endAngle) / 2
    const labelRadius = radius * 0.7
    return polarToCartesian(center, center, labelRadius, midAngle)
  }

  // const palette = ['#f59e0b', '#78350f', '#fbbf24', '#d97706', '#451a03', '#fef3c7']

  const palette = [
  '#f59e0b', // Amber 500 (Primary Caution)
  '#38bdf8', // Sky 400 (Clear Info)
  '#fb7185', // Rose 400 (Urgent Alert)
  '#34d399', // Emerald 400 (Success/Safe)
  '#818cf8', // Indigo 400 (System/Legal)
  '#fb923c'  // Orange 400 (Secondary Warning)
]

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row">
      <div className="relative">
        <svg width={center * 2} height={center * 2} viewBox={`0 0 ${center * 2} ${center * 2}`} className="drop-shadow-2xl">
          {arcs.map((a, i) => {
            const textPos = getTextPosition(a.start, a.end)
            const percentage = total ? Math.round((a.count / total) * 100) : 0
            return (
              <g key={`arc-${i}`}>
                <path d={describeArc(center, center, radius, a.start, a.end)} fill={palette[i % palette.length]} className="transition-all hover:opacity-80 cursor-help" />
                {percentage >= 5 && (
                  <text x={textPos.x} y={textPos.y} textAnchor="middle" dy="0.3em" className="text-[10px] font-bold fill-white pointer-events-none">
                    {percentage}%
                  </text>
                )}
              </g>
            )
          })}
          <circle cx={center} cy={center} r={radius / 1.6} fill="#0f172a" />
        </svg>
      </div>

      <div className="flex-1 w-full space-y-2">
        {top.map((d, i) => (
          <div key={`legend-${i}`} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full" style={{ background: palette[i % palette.length] }} />
              <span className="capitalize text-slate-400 font-medium">{d.type?.replaceAll('_', ' ') || 'Unknown'}</span>
            </div>
            <div className="text-white font-bold">{total ? Math.round((d.count / total) * 100) : 0}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}