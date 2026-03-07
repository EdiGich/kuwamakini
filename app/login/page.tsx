'use client'

import { useState } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/admin')
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      {/* Brand/Logo Area */}
      <div className="mb-8 text-center">
        <div className="inline-block bg-amber-500/10 border border-amber-500/20 p-3 rounded-2xl mb-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Admin Portal</h1>
        <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">Authorized Access Only</p>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-3xl rounded-full"></div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
            <input
              type="email"
              placeholder="name@kuwamakini.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 text-white p-4 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
            />
          </div>

          <button 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg mt-2 ${
              loading 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-white text-slate-950 hover:bg-amber-500 hover:text-slate-950 active:scale-95 shadow-white/5'
            }`}
          >
            {loading ? 'Authenticating...' : 'Establish Session'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}
        </form>
      </div>

      <Link 
        href="/" 
        className="mt-8 text-slate-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
      >
        ← Back to Public Site
      </Link>
    </main>
  )
}