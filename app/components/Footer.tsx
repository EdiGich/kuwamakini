"use client";

import Link from "next/link";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-slate-900 border-t border-slate-800 pt-16 pb-8 px-6 mt-3 mb-0">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Brand Section */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-2xl italic font-black text-white tracking-tighter uppercase">
                            Kuwa<span className="text-amber-500">Makini</span>
                        </h2>
                        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
                            A community-driven platform dedicated to documenting scam patterns across Kenya.
                            We empower citizens through data transparency and collective vigilance.
                        </p>
                        <a
                            href="/report"
                            className="hidden sword-glimmer md:block bg-amber-500 hover:bg-amber-600 text-slate-900 px-6 py-3 rounded-full shadow-lg shadow-amber-500/20 transition-all duration-300 font-bold uppercase text-sm tracking-wide active:scale-95"
                        >
                            Report a Scam
                        </a>

                        {/* Mobile Report Button (Visible only on small screens) */}
                        <a
                            href="/report"
                            className="md:hidden block w-full text-center bg-amber-500 text-slate-900 py-4 rounded-xl font-bold uppercase mb-8 shadow-lg shadow-amber-500/10"
                        >
                            Report a Scam
                        </a>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Navigation</h3>
                        <ul className="space-y-2 text-sm font-bold text-slate-300">
                            <li><Link href="/" className="hover:text-white transition-colors">Dashboard</Link></li>
                            <li><Link href="/how-reporting-works" className="hover:text-white transition-colors">How it Works</Link></li>
                            <li><Link href="/about-us" className="hover:text-white transition-colors">Our Mission</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Get in Touch</Link></li>
                        </ul>
                    </div>

                    {/* Legal & Safety */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest">Trust & Legal</h3>
                        <ul className="space-y-2 text-sm font-bold text-slate-300">
                            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/community-guidelines" className="hover:text-white transition-colors">Guidelines</Link></li>
                            <li className="text-slate-500 italic pt-2">A shield for the community, powered by data since 2026.</li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                        © {currentYear} All Rights Reserved.
                    </p>
                    <div className="flex gap-6 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                        <span>Kenya 🇰🇪</span>
                        <span className="text-amber-500/50">Kuwa Makini</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}