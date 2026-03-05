
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
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">
            kuwaMakini
          </h1>
          <HamburgerMenu />
        </div>
        <a
          href="/report"
          className="inline-block bg-linear-to-r from-blue-700 to-blue-900 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold uppercase tracking-wide relative overflow-hidden group sword-glimmer"
          aria-label="Report a scam"
        >
          Report a Scam
        </a>
      </div>
     {/* Trending Section */}
      {trending.length > 0 && (
        <div className="mb-8 border rounded-lg p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">
            🔥 Trending This Week
          </h2>

          <div className="grid md:grid-cols-3 gap-4">
            {trending.map((item: any) => (
              <div
                key={item.type}
                className="bg-white border rounded p-3 shadow-sm"
              >
                <p className="font-medium capitalize">
                  {item.type.replaceAll('_', ' ')}
                </p>
                <p className="text-sm text-gray-500">
                  {item.count} reports
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border p-2 rounded"
        >
          <option className='text-gray-700' value="">All Types</option>
          <option className='text-gray-700' value="fake_landlord">Fake Landlord</option>
          <option className='text-gray-700' value="fake_police">Fake Police</option>
          <option className='text-gray-700' value="fake_job">Fake Job</option>
          <option className='text-gray-700' value="mpesa">M-Pesa Scam</option>
          <option className='text-gray-700' value="fake_gold">Fake Gold</option>
          <option className='text-gray-700' value="fake_emergency">Fake Emergency Call</option>
          <option className='text-gray-700' value="atm_distraction">ATM Distraction</option>
          <option className='text-gray-700' value="marketplace">Online Marketplace</option>
          <option className='text-gray-700' value="tourist_target">Tourist Targeting</option>
          <option className='text-gray-700' value="matatu_pickpocket">Matatu Pickpocketing</option>
          <option className='text-gray-700' value="tuktuk_pickpocket">Tuk-Tuk Pickpocketing</option>
          <option className='text-gray-700' value="other">Other</option>
        </select>

        <input
          type="text"
          placeholder="Filter by Area (e.g. Nyali)"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Reports */}
      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        <div>
          <div className={reports.length > 10 ? 'space-y-4 max-h-200 overflow-y-auto pr-2' : 'space-y-4'}>
            {reports.slice(0, 30).map((report) => (
              <div
                key={report.id}
                className="border p-4 rounded-lg shadow-sm"
              >
                <p className="text-sm text-gray-500">
                  {report.type} • {report.area || 'Area not specified'}
                </p>
                <p className="mt-2">{report.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          {reports.length > 30 && (
            <p className="text-sm text-gray-500 mt-2">Showing 30 of {reports.length} reports. Refine filters to see more.</p>
          )}
        </div>
      )}

      {/* Dashboard Section. Visualisations */}
      <section className="mt-12 rounded-lg p-6 bg-gray-600 text-white">
        <h2 className="text-2xl font-semibold mb-3">Dashboard</h2>
        <p className="text-sm text-gray-200 mb-4">Select an area to see scam breakdowns and quick analytics.</p>

        <Dashboard />
      </section>
    </main>
  )}


function Dashboard() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState<string>('')

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const res = await fetch('/api/reports?sort=recent')
      const all = await res.json()
      setData(all || [])
      setLoading(false)
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
    <div>
      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm">Area:</label>
        <select value={city} onChange={(e) => setCity(e.target.value)} className="p-2 rounded text-black">
          <option value="">All</option>
          {areas.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <div className="ml-auto text-sm text-gray-200">Total reports: <span className="font-bold">{total}</span></div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Top Scam Types (Horizontal)</h3>
          <BarChart data={chartData} total={total} />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Distribution</h3>
          <PieChart data={chartData} total={total} />
        </div>
      </div>
    </div>
  )
}

function BarChart({ data, total }: { data: any[]; total: number }) {
  const top = data.slice(0, 10)
  const max = top.length ? Math.max(...top.map((d) => d.count)) : 1

  return (
    <div className="space-y-3">
      {top.map((d) => (
        <div key={d.type} className="flex items-center gap-3">
          <div className="w-32 text-sm text-gray-200 capitalize">{d.type.replaceAll('_', ' ')}</div>
          <div className="flex-1 bg-gray-700 rounded overflow-hidden h-8">
            <div className="h-8 bg-green-400" style={{ width: `${(d.count / max) * 100}%` }} />
          </div>
          <div className="w-16 text-right text-sm">{d.count}</div>
        </div>
      ))}
      {top.length === 0 && <div className="text-sm text-gray-300">No data</div>}
    </div>
  )
}

function PieChart({ data, total }: { data: any[]; total: number }) {
  const top = data.slice(0, 6)
  const radius = 60
  const center = radius + 2
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

  const palette = ['#60A5FA', '#34D399', '#F59E0B', '#F87171', '#A78BFA', '#FB7185']

  return (
    <div className="flex items-center gap-4">
      <svg width={center * 2} height={center * 2} viewBox={`0 0 ${center * 2} ${center * 2}`}>
        {arcs.map((a, i) => (
          <path key={a.type} d={describeArc(center, center, radius, a.start, a.end)} fill={palette[i % palette.length]} />
        ))}
        <circle cx={center} cy={center} r={radius / 2} fill="#374151" />
        <text x={center} y={center} textAnchor="middle" dy="6" fill="#fff" className="text-sm" style={{ fontSize: 12 }}>
          {total}
        </text>
      </svg>

      <div className="flex-1 text-sm text-gray-200">
        {top.length === 0 && <div>No data</div>}
        {top.map((d, i) => (
          <div key={d.type} className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span style={{ width: 12, height: 12, background: palette[i % palette.length], display: 'inline-block', borderRadius: 3 }} />
              <span className="capitalize">{d.type.replaceAll('_', ' ')}</span>
            </div>
            <div>{total ? Math.round((d.count / total) * 100) : 0}%</div>
          </div>
        ))}
      </div>
    </div>
  )
}