'use client'

import HamburgerMenu from "@/app/components/HamburgerMenu";
import { useEffect, useState } from 'react'

export default function Home() {
  const [reports, setReports] = useState<any[]>([])
  const [trending, setTrending] = useState<any[]>([])
  const [type, setType] = useState('')
  const [area, setArea] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchReports() {
    setLoading(true)
    let url = '/api/reports?sort=recent'
    if (type) url += `&type=${type}`
    if (area) url += `&area=${area}`
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

  useEffect(() => {
    fetchReports()
  }, [type, area])

  useEffect(() => {
    fetchTrending()
  }, [])

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto text-slate-200">
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
                  {item.type.replaceAll('_', ' ')}
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

        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search Area (e.g. Nyali, Bamburi)"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full bg-slate-800 border-none text-white p-3 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none pl-10"
          />
          <span className="absolute left-3 top-3.5 opacity-40">📍</span>
        </div>
      </section>

      {/* Reports Feed */}
      <section className="mb-20">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
          <span className="text-amber-500">🚨</span> Live Feed
        </h2>
        
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
              {reports.slice(0, 30).map((report) => (
                <div
                  key={report.id}
                  className="bg-slate-800/30 border border-slate-800 p-6 rounded-2xl hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black uppercase tracking-tighter bg-amber-500/10 text-amber-500 px-2 py-1 rounded border border-amber-500/20">
                      {report.type.replaceAll('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-slate-500">📍</span> {report.area || 'General Area'}
                  </p>
                  <p className="text-slate-400 text-sm leading-relaxed">{report.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Dashboard Analytics Section */}
      <section className="mt-20 border-t border-slate-800 pt-16">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Security Dashboard</h2>
          <p className="text-slate-500">Visualized data from community reports to help you spot emerging trends.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-4xl p-8 shadow-2xl">
          <Dashboard />
        </div>
      </section>
    </main>
  )
}

function Dashboard() {
  const [data, setData] = useState<any[]>([])
  const [city, setCity] = useState<string>('')

  useEffect(() => {
    async function fetchAll() {
      const res = await fetch('/api/reports?sort=recent')
      const all = await res.json()
      setData(all || [])
    }
    fetchAll()
  }, [])

  const areas = Array.from(new Set(data.map((d: any) => d.area).filter(Boolean))).sort()

  const byType = (selectedCity: string) => {
    const filtered = selectedCity ? data.filter((d: any) => d.area === selectedCity) : data
    const counts: Record<string, number> = {}
    filtered.forEach((r: any) => {
      const t = r.type || 'other'
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
          <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Filter Data:</label>
          <select 
            value={city} 
            onChange={(e) => setCity(e.target.value)} 
            className="bg-slate-700 text-white p-2 rounded-lg text-sm outline-none border-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">Full City (All Areas)</option>
            {areas.map((a) => (
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
            <span className="text-slate-400">{d.type.replaceAll('_', ' ')}</span>
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
          {arcs.map((a, i) => (
            <path key={a.type} d={describeArc(center, center, radius, a.start, a.end)} fill={palette[i % palette.length]} className="transition-all hover:opacity-80 cursor-help" />
          ))}
          <circle cx={center} cy={center} r={radius / 1.6} fill="#0f172a" />
        </svg>
      </div>

      <div className="flex-1 w-full space-y-2">
        {top.map((d, i) => (
          <div key={d.type} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full" style={{ background: palette[i % palette.length] }} />
              <span className="capitalize text-slate-400 font-medium">{d.type.replaceAll('_', ' ')}</span>
            </div>
            <div className="text-white font-bold">{total ? Math.round((d.count / total) * 100) : 0}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}